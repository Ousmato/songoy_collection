import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import {
  StockMouvementFilters,
  StockMouvementHistoriqueDto,
  TypeMouvement,
  TypeMouvementKey,
} from '../../models/stock.dto';
import { StockService } from '../../services/stock.service';

const toLocalDateParam = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type MovementTypeOption = { key: TypeMouvementKey; value: string };

@Component({
  selector: 'app-historique-mouvements',
  standalone: true,
  imports: [CommonModule, FloatingBackButton],
  templateUrl: './historique-mouvements.html',
  styleUrl: './historique-mouvements.css',
})
export class HistoriqueMouvements implements OnInit {
  private readonly stockService = inject(StockService);
  readonly user = getUserFromSessionStorage();

  readonly mouvements = signal<StockMouvementHistoriqueDto[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly recherche = signal('');
  readonly typeSelectionne = signal<TypeMouvementKey | ''>('');
  readonly dateFin = signal(toLocalDateParam(new Date()));
  readonly dateDebut = signal(`${this.dateFin().slice(0, 7)}-01`);
  readonly typeOptions = EnumMethodes.getEnumKeyVale(TypeMouvement) as MovementTypeOption[];

  readonly nombreEntrees = computed(() =>
    this.mouvements().filter(mouvement => mouvement.type === 'ACHAT').length,
  );
  readonly nombreSorties = computed(() =>
    this.mouvements().filter(mouvement => mouvement.type === 'VENTE').length,
  );

  readonly periodeLabel = computed(() => {
    if (!this.dateDebut() || !this.dateFin()) return 'Période à compléter';
    const debut = new Date(`${this.dateDebut()}T00:00:00`);
    const fin = new Date(`${this.dateFin()}T00:00:00`);
    const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${formatter.format(debut)} – ${formatter.format(fin)}`;
  });

  ngOnInit(): void {
    this.loadMouvements();
  }

  loadMouvements(): void {
    if (!this.user?.id) {
      this.mouvements.set([]);
      this.errorMessage.set('Votre session ne permet pas de charger les mouvements.');
      return;
    }
    if (!this.dateDebut() || !this.dateFin()) {
      this.mouvements.set([]);
      this.errorMessage.set('Choisissez les deux dates de la période.');
      return;
    }
    if (this.dateDebut() > this.dateFin()) {
      this.mouvements.set([]);
      this.errorMessage.set('La date de début doit précéder la date de fin.');
      return;
    }

    const filters: StockMouvementFilters = {
      debut: this.dateDebut(),
      fin: this.dateFin(),
      recherche: this.recherche(),
      ...(this.typeSelectionne() ? { type: this.typeSelectionne() as TypeMouvementKey } : {}),
    };

    this.loading.set(true);
    this.errorMessage.set('');
    this.mouvements.set([]);
    this.stockService.getHistoriqueMouvements(this.user.id, filters).pipe(
      catchError(() => {
        this.errorMessage.set('Impossible de charger les mouvements. Réessayez dans un instant.');
        return EMPTY;
      }),
      finalize(() => this.loading.set(false)),
    ).subscribe(mouvements => this.mouvements.set(mouvements));
  }

  resetFilters(): void {
    const aujourdHui = toLocalDateParam(new Date());
    this.dateDebut.set(`${aujourdHui.slice(0, 7)}-01`);
    this.dateFin.set(aujourdHui);
    this.typeSelectionne.set('');
    this.recherche.set('');
    this.loadMouvements();
  }

  typeLabel(type: TypeMouvementKey): string {
    return EnumMethodes.getEnumValueByKey(TypeMouvement, type) ?? type;
  }

  uniteLabel(unite: StockMouvementHistoriqueDto['unite']): string {
    if (!unite) return 'unité';
    return EnumMethodes.getEnumValueByKey(CategoryMesure, unite) ?? String(unite);
  }

  movementTone(type: TypeMouvementKey): string {
    return EnumMethodes.getEnumValueByKey(TypeMouvement, type)!;
    
  }

  formatQuantity(value: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value ?? 0);
  }

  formatMoney(value: number): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value ?? 0)} FCFA`;
  }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  formatTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
  }
}
