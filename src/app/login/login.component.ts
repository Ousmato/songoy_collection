import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../admin/service/admin.service';
import { LoginRequestDto, LoginResponseDto } from '../admin/model/admin.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private readonly adminService = inject(AdminService);

  loginForm!: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  year = new Date().getFullYear();

  accessCodeCtrlInvalid = computed(() => {
    const c = this.loginForm?.get('accessCode');
    return c ? (c.touched && c.invalid) : false;
  });
  passwordCtrlInvalid = computed(() => {
    const c = this.loginForm?.get('password');
    return c ? (c.touched && c.invalid) : false;
  });

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      accessCode: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formData: LoginRequestDto = this.loginForm.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.login(formData).subscribe({
      next: (user: LoginResponseDto) => {
        sessionStorage.setItem('user', JSON.stringify(user));
        this.isLoading.set(false);
        this.router.navigateByUrl(user.entite === 'ATELIER' ? '/admin/list-commandes' : '/admin/dashboard');
      },
      error: (error) => {
        console.error('Échec de connexion au backend', error);
        this.isLoading.set(false);
        this.errorMessage.set('Code d’accès ou mot de passe incorrect.');
      },
    });
  }
}
