import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';
import { FournisseurRequestDto } from '../../models/fournisseur.model';

@Component({
  selector: 'app-add-fournisseur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-fournisseur.html',
  styleUrl: './add-fournisseur.css',
})
export class AddFournisseur {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly dependency = inject(DependencyService);
  readonly user = getUserFromSessionStorage();
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly form = this.dependency.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.maxLength(80)]],
    prenom: ['', [Validators.required, Validators.maxLength(80)]],
    telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    adresse: ['', [Validators.required, Validators.maxLength(160)]],
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open && !this.submitting()) {
      this.cancel();
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.error.set('');

    if (this.form.invalid) {
      return;
    }
    if (!this.user?.id) {
      this.error.set('Reconnectez-vous pour enregistrer le fournisseur.');
      return;
    }

    this.submitting.set(true);
    const payload = this.form.getRawValue() as FournisseurRequestDto;
    this.dependency.fournisseurService.addFournisseur(this.user.id, payload).subscribe({
      next: response => {
        this.submitting.set(false);
        this.dependency.responseService.showSuccessToast(response?.message ?? 'Fournisseur ajouté.');
       
      },
      error: error => {
        this.submitting.set(false);
        const message = error?.error?.message ?? 'Impossible d’enregistrer le fournisseur.';
        this.error.set(message);
        this.dependency.responseService.showErrorToast(message);
      },
      complete:() =>{
         this.form.reset();
          this.saved.emit();
          this.close.emit();
      }
    });
  }

  cancel(): void {
    if (this.submitting()) return;
    this.error.set('');
    this.form.reset();
    this.close.emit();
  }
}
