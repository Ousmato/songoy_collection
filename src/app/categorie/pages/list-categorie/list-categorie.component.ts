import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryMesure, CategoryType } from '../../models/categorie.enum';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';
import { CategoryDto } from '../../models/categorie.dto';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { Entite } from '../../../admin/model/admin.enum';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';


@Component({
  selector: 'app-list-categorie',
  standalone: true,
  imports: [CommonModule, RouterModule, FloatingBackButton, ConfirmModalComponent],
  templateUrl: './list-categorie.component.html',
  styleUrl: './list-categorie.component.css'
})
export class ListCategorieComponent implements OnInit{

  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });


  user = getUserFromSessionStorage()

  dependency = inject(DependencyService)
  categories = signal<CategoryDto[]>([])
  search = signal('');
  editingCategoryId = signal<number | null>(null);
  editedCategoryName = signal('');
  savingCategoryId = signal<number | null>(null);
  pendingCategoryDeletion = signal<CategoryDto | null>(null);
  deletingCategoryId = signal<number | null>(null);
  deletingPendingCategory = computed(() => {
    const category = this.pendingCategoryDeletion();
    return category !== null && this.deletingCategoryId() === category.id;
  });
  filteredCategories = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.categories();
    return this.categories().filter(category =>
      `${category.nom} ${category.description} ${category.entite} ${category.type}`
        .toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(){
    if(this.user){
      this.dependency.categoryService.loadCategories(this.user.id).subscribe({
        next: (result) => {
          this.categories.set(result)
        },
        error: (err) => this.dependency.responseService.showErrorToast(
          err?.error?.message ?? 'Impossible de charger les categories.'
        )
      })
    }
  }

  startCategoryNameEdit(category: CategoryDto): void {
    if (
      this.savingCategoryId() !== null
      || this.deletingCategoryId() !== null
      || this.pendingCategoryDeletion() !== null
    ) return;
    this.editingCategoryId.set(category.id);
    this.editedCategoryName.set(category.nom);
  }

  onCategoryNameInput(event: Event): void {
    this.editedCategoryName.set((event.target as HTMLInputElement).value);
  }

  cancelCategoryNameEdit(): void {
    if (this.savingCategoryId() !== null) return;
    this.editingCategoryId.set(null);
    this.editedCategoryName.set('');
  }

  saveCategoryName(category: CategoryDto): void {
    const idAdmin = this.user?.id;
    const nom = this.editedCategoryName().trim();
    if (!idAdmin || this.savingCategoryId() !== null || this.deletingCategoryId() !== null) return;
    if (!nom) {
      this.dependency.responseService.showErrorToast('Le nom de la categorie est obligatoire.');
      return;
    }
    if (nom === category.nom) {
      this.cancelCategoryNameEdit();
      return;
    }

    this.savingCategoryId.set(category.id);
    this.dependency.categoryService.updateCategoryName(category.id, idAdmin, { nom }).subscribe({
      next: response => {
        this.categories.update(categories => categories.map(item =>
          item.id === category.id ? { ...item, nom } : item
        ));
        this.editingCategoryId.set(null);
        this.editedCategoryName.set('');
        this.dependency.responseService.showSuccessToast(
          response?.message ?? 'Nom de la categorie modifie avec succes.'
        );
      },
      error: error => {
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible de modifier le nom de la categorie.'
        );
        this.savingCategoryId.set(null);
      },
      complete: () => this.savingCategoryId.set(null),
    });
  }

  requestCategoryDeletion(category: CategoryDto): void {
    if (this.savingCategoryId() !== null || this.deletingCategoryId() !== null) {
      return;
    }
    this.editingCategoryId.set(null);
    this.pendingCategoryDeletion.set(category);
  }

  cancelCategoryDeletion(): void {
    if (this.deletingCategoryId() !== null) return;
    this.pendingCategoryDeletion.set(null);
  }

  confirmCategoryDeletion(): void {
    const category = this.pendingCategoryDeletion();
    const idAdmin = this.user?.id;
    if (!category || !idAdmin || this.deletingCategoryId() !== null || this.savingCategoryId() !== null) return;

    this.deletingCategoryId.set(category.id);
    this.dependency.categoryService.deleteCategory(category.id, idAdmin).subscribe({
      next: response => {
        this.categories.update(categories => categories.filter(item => item.id !== category.id));
        this.pendingCategoryDeletion.set(null);
        this.dependency.responseService.showSuccessToast(
          response?.message ?? 'Categorie supprimee avec succes.'
        );
      },
      error: error => {
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible de supprimer cette categorie.'
        );
        this.pendingCategoryDeletion.set(null);
        this.deletingCategoryId.set(null);
      },
      complete: () => this.deletingCategoryId.set(null),
    });
  }

  getUniteLabel(cat: CategoryDto): string {
    return EnumMethodes.getEnumValueByKey(CategoryMesure, cat.mesureCategory) as string;
  }
  getEntiteLabel(cat: CategoryDto): string{
   return EnumMethodes.getEnumValueByKey(Entite, cat.entite) as string
  }
  getTypeLabel(cat: CategoryDto): string{
   return EnumMethodes.getEnumValueByKey(CategoryType, cat.type) as string
  }

}

