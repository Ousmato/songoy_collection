import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CouleurResponse } from '../../../article/models/article-couleur.model';

@Component({
  selector: 'app-achat-couleur-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achat-couleur-bottom-sheet.html',
  styleUrl: './achat-couleur-bottom-sheet.css',
})
export class AchatCouleurBottomSheet {
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
    const selectedCouleurs = this.couleurs.filter(couleur => ids.includes(couleur.id));
    this.applySelection.emit(selectedCouleurs);
  }
}
