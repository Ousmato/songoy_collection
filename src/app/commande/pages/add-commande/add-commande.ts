import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { Select2, Select2Data, Select2Option, Select2UpdateEvent } from 'ng-select2-component';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { HabitType, HabitTypeKey } from '../../../shared/model/util.enum';
import { DependencyService } from '../../../shared/utils/dependency';
import { Client } from '../../../client/models/client.model';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { AddCommandeSommary } from '../../components/add-commande-sommary/add-commande-sommary';
import { CommandeRequest, LigneCommandeRequest, SourceHabitCommande } from '../../model/commande.model';
import { Categorie } from '../../../categorie/models/categorie.model';
import { SimpleArticleResponse } from '../../../article/models/article.model';
import { CouleurResponse } from '../../../article/models/article-couleur.model';

@Component({
  selector: 'app-add-commande',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Select2, FloatingBackButton, AddCommandeSommary],
  templateUrl: './add-commande.html',
  styleUrl: './add-commande.css',
})
export class AddCommande implements OnInit {
  user = getUserFromSessionStorage();
  dependencyService = inject(DependencyService);

  clientListOptionsData: Select2Data = [];
  categoriesData: Select2Data = [];
  articlesData: Select2Data = [];
  couleursData: Select2Data = [];
  typeHabilleOptions = EnumMethodes.getEnumeratedKeyValue(HabitType);
  sourceOptions: { key: SourceHabitCommande; value: string; icon: string }[] = [
    { key: 'CLIENT', value: 'Client', icon: 'fa-solid fa-user' },
    { key: 'BOUTIQUE', value: 'Boutique', icon: 'fa-solid fa-store' },
  ];

  commandeForm!: FormGroup;
  ligneForm!: FormGroup;
  lignes = signal<LigneCommandeRequest[]>([]);
  habitImagePreview = signal<string | null>(null);
  lastRequest = signal<CommandeRequest | null>(null);

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  ngOnInit(): void {
    this.loadForm();
    this.loadClients();
    this.loadCategories();
  }

  loadForm(): void {
    this.commandeForm = this.dependencyService.fb.group({
      dateCommande: ['', Validators.required],
      dateLivraisonPrevue: ['', Validators.required],
      clientId: [''],
      clientNom: [''],
      avance: [0, [Validators.required, Validators.min(0)]],
    });

    this.ligneForm = this.dependencyService.fb.group({
      typeHabille: ['BOUBOU' satisfies HabitTypeKey, Validators.required],
      designation: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(1)]],
      prixMatiere: [0, [Validators.min(0)]],
      sourceHabit: ['CLIENT' satisfies SourceHabitCommande, Validators.required],
      idCategorie: [''],
      idArticle: [''],
      idCouleur: [''],
    });
  }

  loadClients(): void {
    if (!this.user) {
      return;
    }
    this.dependencyService.clientService.loadClients(this.user.id).subscribe({
      next: (response) => {
        this.clientListOptionsData = response.map<Select2Option>((clt: Client, index) => ({
          id: `client-${clt.id ?? index}-${index}`,
          value: clt.id,
          label: `${clt.nom ?? ''} ${clt.prenom ?? ''}`.trim() || 'Client non definit',
        })) as Select2Data;
      }
    });
  }

  loadCategories(): void {
    if (!this.user?.id) {
      return;
    }

    this.dependencyService.categoryService.loadCategories(this.user.id).subscribe({
      next: (response) => {
        this.categoriesData = response.map<Select2Option>((cat: Categorie, index) => ({
          id: `cat-${cat.id ?? index}-${index}`,
          value: cat.id ?? '',
          label: cat.nom || 'Categorie non definit',
        })) as Select2Data;
      },
    });
  }

  loadArticles(idCategorie: number): void {
    if (!idCategorie || !this.user?.id) {
      return;
    }

    this.dependencyService.articleService.loadArticlesByCategoryId(idCategorie, this.user.id).subscribe({
      next: (response) => {
        this.articlesData = response.map<Select2Option>((art: SimpleArticleResponse, index) => ({
          id: `art-${art.id ?? index}-${index}`,
          value: art.id,
          label: art.nom || 'Article non definit',
        })) as Select2Data;
      },
    });
  }

  loadCouleurs(idArticle: number): void {
    if (!idArticle || !this.user?.id) {
      return;
    }

    this.dependencyService.articleService.loadCouleurs(idArticle, this.user.id).subscribe({
      next: (response) => {
        this.couleursData = response.map<Select2Option>((couleur: CouleurResponse, index) => ({
          id: `couleur-${couleur.id ?? index}-${index}`,
          value: couleur.id,
          label: `${couleur.nom} (${couleur.quantity ?? 0})`,
        })) as Select2Data;
      },
    });
  }

  onCategorieUpdate(event: Select2UpdateEvent): void {
    const idCategorie = Number(event.value ?? '');
    this.ligneForm.patchValue({ idArticle: '', idCouleur: '' });
    this.articlesData = [];
    this.couleursData = [];

    if (idCategorie) {
      this.loadArticles(idCategorie);
    }
  }

  onArticleUpdate(event: Select2UpdateEvent): void {
    const idArticle = Number(event.value ?? '');
    this.ligneForm.patchValue({ idCouleur: '' });
    this.couleursData = [];

    if (idArticle) {
      this.loadCouleurs(idArticle);
    }
  }

  addLine(): void {
    if (this.ligneForm.invalid) {
      this.ligneForm.markAllAsTouched();
      return;
    }

    const formValue = this.ligneForm.value;
    const ligne: LigneCommandeRequest = {
      typeHabille: formValue.typeHabille,
      designation: formValue.designation.trim(),
      quantite: Number(formValue.quantite),
      prixUnitaire: Number(formValue.prixUnitaire),
      prixMatiere: this.isBoutiqueSource() ? Number(formValue.prixMatiere || 0) : undefined,
      sourceHabit: formValue.sourceHabit,
      imageHabitUrl: this.isBoutiqueSource() ? undefined : this.habitImagePreview() ?? undefined,
      idCouleur: this.isBoutiqueSource() ? Number(formValue.idCouleur) : undefined,
      couleurNom: this.isBoutiqueSource() ? this.selectLabel(this.couleursData, formValue.idCouleur) : undefined,
    };

    this.lignes.set([...this.lignes(), ligne]);
    this.ligneForm.patchValue({
      designation: '',
      quantite: 1,
      prixUnitaire: 0,
      prixMatiere: 0,
      sourceHabit: 'CLIENT',
      idCategorie: '',
      idArticle: '',
      idCouleur: '',
    });
    this.articlesData = [];
    this.couleursData = [];
    this.habitImagePreview.set(null);
    this.updateStockValidators('CLIENT');
    this.ligneForm.markAsPristine();
    this.ligneForm.markAsUntouched();
  }

  removeLine(index: number): void {
    this.lignes.set(this.lignes().filter((_, lineIndex) => lineIndex !== index));
  }

  sourceValue(): SourceHabitCommande {
    return this.ligneForm?.value?.sourceHabit ?? 'CLIENT';
  }

  setSource(source: SourceHabitCommande): void {
    this.ligneForm.patchValue({ sourceHabit: source });
    this.updateStockValidators(source);
  }

  isBoutiqueSource(): boolean {
    return this.sourceValue() === 'BOUTIQUE';
  }

  onHabitImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.habitImagePreview.set(String(reader.result));
    reader.readAsDataURL(file);
  }

  handleSubmit(request: CommandeRequest): void {
    this.lastRequest.set(request);
    console.log('CommandeRequest simulation', request);
  }

  private updateStockValidators(source: SourceHabitCommande): void {
    const requiredControls = ['idCategorie', 'idArticle', 'idCouleur'];

    requiredControls.forEach((controlName) => {
      const control = this.ligneForm.get(controlName);

      if (source === 'BOUTIQUE') {
        control?.setValidators(Validators.required);
      } else {
        control?.clearValidators();
        control?.setValue('');
      }

      control?.updateValueAndValidity();
    });

    if (source === 'CLIENT') {
      this.ligneForm.get('prixMatiere')?.setValue(0);
      this.articlesData = [];
      this.couleursData = [];
    } else {
      this.habitImagePreview.set(null);
    }
  }

  private selectLabel(data: Select2Data, value: number | string): string | undefined {
    return (data as Select2Option[]).find(item => Number(item.value) === Number(value))?.label;
  }
}
