import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { getUserFromSessionStorage } from '../../shared/auth.util';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DependencyService } from '../../../shared/utils/dependency';
import { Entite, PersonnelRole } from '../../model/admin.enum';
import { PersonnelRequestDto } from '../../model/admin.model';
import { RouterModule } from '@angular/router';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';

@Component({
  selector: 'app-add-personnel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FloatingBackButton],
  templateUrl: './add-personnel.html',
  styleUrl: './add-personnel.css',
})
export class AddPersonnel implements OnInit {

  user = getUserFromSessionStorage();
  submitted = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form!: FormGroup
  dependency = inject(DependencyService);
  roleOptions = EnumMethodes.getEnumKeyVale(PersonnelRole)
  entiteOptions = EnumMethodes.getEnumKeyVale(Entite)

  get availableRoleOptions() {
    if (this.user?.role === PersonnelRole.SUPER_ADMIN) {
      return this.roleOptions.filter(option => option.key === 'ADMIN');
    }
    if (this.user?.role === PersonnelRole.ADMIN) {
      return this.roleOptions.filter(option => option.key !== 'ADMIN' && option.key !== 'SUPER_ADMIN');
    }
    return [];
  }

  get availableEntiteOptions() {
    const role = this.control('role')?.value;
    if (this.user?.role === PersonnelRole.SUPER_ADMIN) {
      return this.entiteOptions.filter(option => option.key === 'GLOBAL' && role === 'ADMIN');
    }
    return this.entiteOptions.filter(option => option.key !== 'GLOBAL');
  }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm(){
    this.form = this.dependency.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(80)]],
      prenom: ['', [Validators.required, Validators.maxLength(80)]],
      adresse: ['', [Validators.required, Validators.maxLength(160)]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      dateNaissance: [''],
      role: ['', Validators.required],
      entite: ['', Validators.required],
    });
  }

  control(name: string) {
    return this.form.get(name);
  }

  onRoleChange(event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    const currentEntite = String(this.control('entite')?.value ?? '');
    const globalAllowed = this.user?.role === PersonnelRole.SUPER_ADMIN && role === 'ADMIN';
    if (currentEntite === 'GLOBAL' && !globalAllowed) {
      this.control('entite')?.setValue('');
    }
  }

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid || !this.user?.id) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as PersonnelRequestDto;
    this.dependency.responseService.showLoading('Ajout du personnel…');
    this.dependency.adminService.addPersonnel(payload, this.user.id).subscribe({
      next: (result) => {
        this.dependency.responseService.showSuccessToast(result.message);
        this.form.reset();
        this.submitted.set(false);
      },
      error: (error) => {
        this.submitted.set(false);
        this.dependency.responseService.showErrorToast(error?.error?.message || 'Impossible d’ajouter ce personnel.');
      },
    });
  }
}
