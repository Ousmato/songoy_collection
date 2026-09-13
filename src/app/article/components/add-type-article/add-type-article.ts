import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArticleType } from '../../models/article-type';

@Component({
  selector: 'app-add-type-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-type-article.html',
  styleUrl: './add-type-article.css',
})
export class AddTypeArticle implements OnInit {
  @Output() close = new EventEmitter<void>();

  user = getUserFromSessionStorage();
  dependenceService = inject(DependencyService);
  private router = inject(Router);

  form!: FormGroup;

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.form = this.dependenceService.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      description: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(220)]],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.user) {
      return
    }
    const formData = this.form.getRawValue() as ArticleType;
    this.dependenceService.articleService.addArticleType(formData, this.user?.id!).subscribe({
      next: (response) => {
        this.form.reset();
        this.loadForm();
        this.dependenceService.responseService.showSuccessToast(response.message$);
        this.onClose();
      },
      error: (error) => {
        this.dependenceService.responseService.showErrorToast(error.message);
      }
    });

  }

  get nomCtrl() { return this.form.get('nom'); }
  get descriptionCtrl() { return this.form.get('description'); }
}
