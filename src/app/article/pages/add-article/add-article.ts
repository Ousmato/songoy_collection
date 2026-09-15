import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';
import { CategoryDto } from '../../../categorie/models/categorie.dto';
import { ArticleTypeResponse } from '../../models/article-type';
import { ArticleRequestDto } from '../../models/article.model';
import { HeicConvertService, HeicProcessResult } from '../../../shared/service/heic-covert.service';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FloatingBackButton],
  templateUrl: './add-article.html',
  styleUrl: './add-article.css',
})
export class AddArticle implements OnInit{

  user = getUserFromSessionStorage()
  dependency = inject(DependencyService)
  private readonly router = inject(Router);
  private readonly imageProcessor = inject(HeicConvertService);
  categoryList : CategoryDto [] = []
  articleTypeList : ArticleTypeResponse [] = []
  form!: FormGroup
  previews = signal<HeicProcessResult[]>([]);
  processingImages = signal(false);
  submitted = signal(false);
  ngOnInit(): void {
    this.loadForm()
    this.loadArticleType()
    this.loadCategories()
  }

  loadForm(){
    this.form = this.dependency.fb.group({
      categoryId: ['', Validators.required],
      articleTypeId: ['', Validators.required],
      files: []
    })
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.processingImages.set(true);
    try {
      const results = await this.imageProcessor.processFileList(input.files, {
        toType: 'image/jpeg', quality: 0.82, maxWidth: 1600, maxHeight: 1600
      });
      this.previews.set(results.filter(result => !!result.url));
      this.form.patchValue({ files: results.map(result => result.file) });
      this.form.get('files')?.markAsTouched();
    } finally {
      this.processingImages.set(false);
    }
  }

  removeImage(index: number): void {
    const files = this.previews().filter((_, i) => i !== index);
    this.previews.set(files);
    this.form.patchValue({ files: files.map(result => result.file) });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.processingImages() || !this.user?.id) {
      return;
    }

    this.submitted.set(true);
    const payload = this.form.getRawValue() as ArticleRequestDto;
    this.dependency.articleService.addArticle(payload, this.user.id).subscribe({
      next: (result) => {
        this.dependency.responseService.showSuccessToast(
          result?.message ?? 'Article ajouté avec succès.'
        );
      },
      error: (error) => {
        this.submitted.set(false);
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible d’ajouter l’article.'
        );
      },
    });
  }

  control(name: string) { return this.form.get(name); }

  loadArticleType(){
    if(this.user){
      this.dependency.articleService.loadArticleType(this.user.id).subscribe({
        next: (result) => {
          this.articleTypeList = result
        },
        error: (err) => this.dependency.responseService.showErrorToast(err.error.message)
      })
    }
  }

  loadCategories(){
    if(this.user){
      this.dependency.categoryService.loadCategories(this.user.id).subscribe({
        next: (result) => {
          this.categoryList = result
        },
        error: (err) => this.dependency.responseService.showErrorToast(err.error.message)
      })
    }
  }

  

}
