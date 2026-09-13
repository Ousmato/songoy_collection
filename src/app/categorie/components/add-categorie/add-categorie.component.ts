import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { CategoryMesure } from '../../models/categorie.enum';

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

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.form = this.dependencyService.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      mesure: ['', [Validators.required]],
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

    this.onClose();
  }

  get nomCtrl() { return this.form.get('nom'); }
  get mesureCtrl() { return this.form.get('mesure'); }
  get descriptionCtrl() { return this.form.get('description'); }
}
