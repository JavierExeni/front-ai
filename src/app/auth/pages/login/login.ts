import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { Auth } from '../../../core/services/auth';
import { CredentialResponse } from '../../../core/types/google-identity.types';
import { environment } from '../../../../environments/environment.development';

// Declare google as global constant (from script tag)
declare const google: any;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MessageModule, RouterLink],
  templateUrl: './login.html',
  styles: ``,
})
export default class Login implements OnInit, OnDestroy {
  // Inject dependencies
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(Auth);

  // UI state
  eyeLock = signal(false);
  isLoading = signal(false);
  isGoogleLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Google initialization state
  private googleInitialized = false;
  private initTimeout?: any;
  private buttonContainer: HTMLElement | null = null;

  // Reactive form
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    // Wait a bit for the script to load, then initialize
    this.initTimeout = setTimeout(() => {
      this.initializeGoogleSignIn();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }

    // Clean up button container
    if (this.buttonContainer && this.buttonContainer.parentNode) {
      this.buttonContainer.parentNode.removeChild(this.buttonContainer);
    }
  }

  /**
   * Initialize Google Identity Services
   */
  private initializeGoogleSignIn(): void {
    if (this.googleInitialized) {
      return;
    }

    // Check if Google Identity Services is loaded
    if (typeof google === 'undefined' || !google.accounts) {
      console.error('Google Identity Services not loaded yet, will retry on button click');
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleCallback.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      this.googleInitialized = true;
      console.log('✅ Google Identity Services initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }

  /**
   * Handle the Google Sign-In callback
   */
  private handleGoogleCallback(response: CredentialResponse): void {
    if (!response.credential) {
      this.errorMessage.set('Failed to receive Google credentials');
      this.resetLoadingStates();
      return;
    }

    this.isGoogleLoading.set(true);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Send the id_token to the backend
    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (loginResponse) => {
        this.resetLoadingStates();
        if(loginResponse.has_company){
          // Navigate to company page after successful login
          this.router.navigate(['/company']);
        }else{
          this.router.navigate(['auth/register']);
        }
      },
      error: (error) => {
        this.resetLoadingStates();
        // Re-initialize Google for next attempt
        this.googleInitialized = false;
        setTimeout(() => {
          this.initializeGoogleSignIn();
        }, 500);

        // Handle error and display message
        const errorMsg =
          error.error?.detail ||
          error.error?.message ||
          'Failed to sign in with Google. Please try again.';
        this.errorMessage.set(errorMsg);
        console.error('Google login error:', error);
      },
    });
  }

  /**
   * Reset all loading states
   */
  private resetLoadingStates(): void {
    this.isGoogleLoading.set(false);
    this.isLoading.set(false);
  }

  /**
   * Handle Google button click
   * Opens full account chooser (not One Tap)
   */
  onGoogleSignIn(): void {
    // Clear any previous errors
    this.errorMessage.set(null);

    // Try to initialize if not already done
    if (!this.googleInitialized) {
      this.initializeGoogleSignIn();
    }

    // Check if Google Identity Services is available
    if (typeof google === 'undefined' || !google.accounts) {
      this.errorMessage.set('Google Sign-In is not available. Please refresh the page and try again.');
      console.error('Google Identity Services not loaded');
      return;
    }

    // Don't allow multiple simultaneous attempts
    if (this.isGoogleLoading()) {
      console.log('Google sign-in already in progress');
      return;
    }

    try {
      // Create or reuse hidden container for Google button
      if (!this.buttonContainer) {
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.id = 'google-signin-button-hidden';
        this.buttonContainer.style.display = 'none';
        document.body.appendChild(this.buttonContainer);
      }

      // Render the Google button in the hidden container
      // This opens the full account chooser when clicked
      google.accounts.id.renderButton(
        this.buttonContainer,
        {
          type: 'standard',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 250
        }
      );

      // Trigger a click on the hidden button after a short delay
      setTimeout(() => {
        const googleButton = this.buttonContainer?.querySelector('div[role="button"]') as HTMLElement;
        if (googleButton) {
          console.log('Clicking hidden Google button to open account chooser');
          googleButton.click();
        } else {
          console.warn('Google button not found, falling back to One Tap');
          // Fallback to One Tap if button click doesn't work
          google.accounts.id.prompt();
        }
      }, 100);

    } catch (error) {
      console.error('Error triggering Google sign-in:', error);
      this.resetLoadingStates();
      this.errorMessage.set('Failed to open Google Sign-In. Please try again.');

      // Re-initialize for next attempt
      this.googleInitialized = false;
      setTimeout(() => {
        this.initializeGoogleSignIn();
      }, 500);
    }
  }

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
