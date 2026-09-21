import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModeleArticleRequestDto } from '../../models/article.model';

@Component({
  selector: 'app-modele-article-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modele-article-form.html',
  styleUrl: './modele-article-form.css',
})
export class ModeleArticleFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() saving = false;
  @Input() blocked = false;
  @Input() resetKey = 0;
  @Output() save = new EventEmitter<ModeleArticleRequestDto>();

  readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(255)]],
    marque: ['', Validators.maxLength(255)],
    matiere: ['', Validators.maxLength(255)],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      this.form.reset({ nom: '', marque: '', matiere: '' });
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving || this.blocked) return;

    const value = this.form.getRawValue();
    const nom = value.nom?.trim() ?? '';
    if (!nom) {
      this.form.controls.nom.setErrors({ required: true });
      return;
    }

    this.save.emit({
      nom,
      marque: this.optionalValue(value.marque),
      matiere: this.optionalValue(value.matiere),
    });
  }

  private optionalValue(value: string | null): string | null {
    const normalized = value?.trim();
    return normalized || null;
  }
}
