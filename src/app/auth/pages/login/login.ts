import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MessageModule, RouterLink],
  templateUrl: './login.html',
  styles: ``,
})
export default class Login {
  // Inject dependencies
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(Auth);

  // UI state
  eyeLock = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Reactive form
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // Navigate to company page after successful login
        this.router.navigate(['/company']);
      },
      error: (error) => {
        this.isLoading.set(false);
        // Handle error and display message
        const errorMsg =
          error.error?.detail ||
          error.error?.message ||
          'Invalid email or password. Please try again.';
        this.errorMessage.set(errorMsg);
      },
    });
  }
}
