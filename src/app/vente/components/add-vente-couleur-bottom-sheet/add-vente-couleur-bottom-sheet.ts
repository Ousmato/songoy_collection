import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { CouleurResponse } from '../../../article/models/article-couleur.model';

@Component({
  selector: 'app-add-vente-couleur-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-vente-couleur-bottom-sheet.html',
  styleUrl: './add-vente-couleur-bottom-sheet.css',
})
export class AddVenteCouleurBottomSheet implements OnChanges {
  @Input() couleurs: CouleurResponse[] = [];
  @Input() selectedIds: number[] = [];
  @Input() articleName = 'Article';

  @Output() close = new EventEmitter<void>();
  @Output() applySelection = new EventEmitter<CouleurResponse[]>();

  draftSelectedIds = signal<number[]>([]);

  ngOnChanges(): void {
    this.draftSelectedIds.set([...this.selectedIds]);
  }

  isSelected(id: number): boolean {
    return this.draftSelectedIds().includes(id);
  }

  toggleCouleur(couleur: CouleurResponse): void {
    const ids = this.draftSelectedIds();

    if (ids.includes(couleur.id)) {
      this.draftSelectedIds.set(ids.filter(id => id !== couleur.id));
      return;
    }

    this.draftSelectedIds.set([...ids, couleur.id]);
  }

  validateSelection(): void {
    const ids = this.draftSelectedIds();
    this.applySelection.emit(this.couleurs.filter(couleur => ids.includes(couleur.id)));
  }
}
