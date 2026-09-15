import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Select2, Select2Data, Select2Option } from 'ng-select2-component';
import { finalize } from 'rxjs';

import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';
import { CategoryDto, CategoryAttributeItemDto, CategoryAttributeRequestDto } from '../../models/categorie.dto';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';

@Component({
  selector: 'app-add-attribute',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Select2, FloatingBackButton],
  templateUrl: './add-attribute.html',
  styleUrl: './add-attribute.css'
})
export class AddAttribute implements OnInit {
  readonly user = getUserFromSessionStorage();
  readonly dependency = inject(DependencyService);
  private readonly router = inject(Router);
  readonly submitting = signal(false);
  readonly existingAttributes = signal<CategoryAttributeItemDto[]>([]);

  form!: FormGroup;
  categories: CategoryDto[] = [];
  categoriesData: Select2Data = [];

  ngOnInit(): void {
    this.form = this.dependency.fb.group({
      categoryIds: [[], [Validators.required, Validators.minLength(1)]],
      mode: ['new'],
      existingKey: [''],
      label: ['', [Validators.required, Validators.maxLength(80)]],
      type: ['', Validators.required],
      obligatoire: [false],
      ordre: [0]
    });

    this.loadCategories();
  }

  selectMode(mode: 'new' | 'existing'): void {
    if (this.submitting()) {
      return;
    }

    this.form.patchValue({ mode });
    const existing = mode === 'existing';
    for (const name of ['label', 'type']) {
      if (existing) {
        this.control(name)?.disable();
      } else {
        this.control(name)?.enable();
      }
    }
    const selection = this.control('existingKey');
    selection?.setValidators(existing ? [Validators.required] : []);
    selection?.updateValueAndValidity();
    selection?.markAsUntouched();
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || !this.user?.id || this.submitting()) {
      return;
    }

    const values = this.form.getRawValue();
    const { categoryIds } = values;
    const selectedCategoryIds = (categoryIds as Array<number | string>)
      .map(Number)
      .filter(id => Number.isInteger(id) && id > 0);
    if (!selectedCategoryIds.length) {
      this.control('categoryIds')?.setErrors({ required: true });
      return;
    }
    const selected = this.existingAttributes().find(item => item.key === values.existingKey);
    if (values.mode === 'existing' && !selected) {
      this.control('existingKey')?.setErrors({ required: true });
      return;
    }

    const normalizedLabel = values.mode === 'existing'
      ? selected?.label ?? ''
      : String(values.label ?? '').trim();
    const key = values.mode === 'existing'
      ? selected?.key ?? ''
      : this.createKey(normalizedLabel);

    if (!key) {
      this.control(values.mode === 'existing' ? 'existingKey' : 'label')?.setErrors({ invalidName: true });
      return;
    }

    const request: CategoryAttributeRequestDto = {
      type: values.mode === 'existing' ? selected!.type : values.type,
      obligatoire: values.obligatoire,
      ordre: values.ordre,
      key,
      label: normalizedLabel,
      categoryIds: [...new Set(selectedCategoryIds)]
    };

    this.submitting.set(true);
    this.dependency.categoryService.addAttributeToCategories(request, this.user.id)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: result => {
          this.dependency.responseService.showSuccessToast(
            result?.message ?? 'Caractéristique ajoutée avec succès.'
          );
          this.router.navigate(['/admin/list-caracteristique']);
        },
        error: error => {
          this.dependency.responseService.showErrorToast(
            error?.error?.message ?? 'Impossible d’ajouter la caractéristique.'
          );
        }
      });
  }

  cancel(): void {
    if (!this.submitting()) {
      this.router.navigate(['/admin/list-caracteristique']);
    }
  }

  control(name: string) {
    return this.form.get(name);
  }

  private createKey(label: string): string {
    return label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private loadCategories(): void {
    if (!this.user?.id) {
      return;
    }

    this.dependency.categoryService.loadCategories(this.user.id).subscribe({
      next: result => {
        this.categories = result ?? [];
        this.categoriesData = this.categories.map<Select2Option>(category => ({
          id: `category-${category.id}`,
          value: category.id,
          label: category.nom
        }));
        this.loadExistingAttributes();
      },
      error: error => this.dependency.responseService.showErrorToast(
        error?.error?.message ?? 'Impossible de charger les catégories.'
      )
    });
  }

  private loadExistingAttributes(): void {
    if (!this.user?.id) {
      return;
    }

    this.dependency.categoryService.loadAllCategoryAttributes(this.user.id).subscribe({
      next: groups => {
        const unique = new Map<string, CategoryAttributeItemDto>();
        for (const group of groups ?? []) {
          for (const item of group.attributes ?? []) {
            unique.set(item.key, item);
          }
        }
        this.existingAttributes.set([...unique.values()].sort((a, b) => a.label.localeCompare(b.label)));
      },
      error: error => this.dependency.responseService.showErrorToast(
        error?.error?.message ?? 'Impossible de charger les caractéristiques existantes.'
      )
    });
  }
}


