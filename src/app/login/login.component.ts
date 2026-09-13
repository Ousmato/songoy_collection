import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { UserRole } from '../admin/model/admin.enum';
import { LoginResponseDto } from '../admin/model/admin.model';

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

  private readonly mockUsers = environment.auth.enableMockLogin
    ? [{ email: 'admin@songoy.mg', password: 'admin123' }]
    : [];

  loginForm!: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  year = new Date().getFullYear();
  envName = environment.name;

  emailCtrlInvalid = computed(() => {
    const c = this.loginForm?.get('email');
    return c ? (c.touched && c.invalid) : false;
  });
  passwordCtrlInvalid = computed(() => {
    const c = this.loginForm?.get('password');
    return c ? (c.touched && c.invalid) : false;
  });

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
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

    const formData = this.loginForm.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    setTimeout(() => {
      if (environment.auth.enableMockLogin && this.mockUsers.length > 0) {
        const { email, password } = formData;
        const valid = this.mockUsers.some(
          u => u.email === email && u.password === password
        );
        if (valid) {
          this.setMockSession(email);
          this.isLoading.set(false);
          this.router.navigateByUrl('/admin/dashboard');
          return;
        }
      }

      this.isLoading.set(false);
      this.errorMessage.set('Identifiants incorrects. Contactez l\'administrateur ou réessayez.');
    }, environment.api.enableMock ? 950 : 0);
  }

  private setMockSession(email: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    const user: LoginResponseDto = {
      id: 1,
      loginType: 'ADMIN',
      role: UserRole.ADMIN,
      nom: 'Songhoi',
      prenom: 'Admin',
      email,
      telephone: '+223 00 00 00 00',
      accessToken: 'mock-songoy-token',
    };

    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('accessToken', user.accessToken);
  }
}
