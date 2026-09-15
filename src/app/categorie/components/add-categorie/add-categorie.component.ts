import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { CategoryMesure, CategoryType } from '../../models/categorie.enum';
import { Entite } from '../../../admin/model/admin.enum';
import { Categorie } from '../../models/categorie.model';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';

@Component({
  selector: 'app-add-categorie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-categorie.component.html',
  styleUrl: './add-categorie.component.css'
})
export class AddCategorieComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  dependencyService = inject(DependencyService);
  private router = inject(Router);
  form!: FormGroup;
  categoryMesureList = EnumMethodes.getEnumKeyVale(CategoryMesure);
  categoryEntiteList = EnumMethodes.getEnumKeyVale(Entite);
  categoryTypeList = EnumMethodes.getEnumKeyVale(CategoryType);


  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.form = this.dependencyService.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      mesureCategory: ['', [Validators.required]],
      categoryType: ['', [Validators.required]],
      entite: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onClose() {
    if (this.close.observed) {
      this.close.emit();
      return;
    }

    this.router.navigateByUrl('/admin/list-paramettre');
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = getUserFromSessionStorage();
    if (!user?.id) {
      this.dependencyService.responseService.showErrorToast('Session administrateur introuvable.');
      return;
    }

    const category = this.form.getRawValue() as Categorie;
    this.dependencyService.categoryService.addCategorie(category, user.id).subscribe({
      next: (result) => {
        this.dependencyService.responseService.showSuccessToast(result?.message ?? 'Catégorie ajoutée avec succès.');
        this.onClose();
      },
      error: (error) => {
        this.dependencyService.responseService.showErrorToast(error?.error?.message ?? 'Impossible d’ajouter la catégorie.');
      },
    });
  }

  get nomCtrl() { return this.form.get('nom'); }
  get mesureCtrl() { return this.form.get('mesureCategory'); }
  get descriptionCtrl() { return this.form.get('description'); }
}
