import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
    // Inject dependencies
  private router = inject(Router);

  // UI state
  eyeLock = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
}
