import { Component, signal, inject, ChangeDetectionStrategy, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RegistrationStateService, TeamMember } from '../../../../core/services/registration-state';
import { Auth } from '../../../../core/services/auth';
import { environment } from '../../../../../environments/environment.development';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'form-step-four',
  imports: [ReactiveFormsModule, FormsModule, InputText],
  templateUrl: './form-step-four.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormStepFour implements OnInit {
  activateStep = output<number>();
  private readonly fb = inject(FormBuilder);
  private readonly registrationState = inject(RegistrationStateService);
  private readonly authService = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly teamMembers = signal<TeamMember[]>([]);
  readonly isLoading = signal<boolean>(false);

  readonly inviteForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    // Load existing team members if user is navigating back
    const existingMembers = this.registrationState.teamMembers();
    if (existingMembers.length > 0) {
      this.teamMembers.set(existingMembers);
    }
  }

  addTeamMember(): void {
    if (this.inviteForm.valid) {
      const email = this.inviteForm.get('email')?.value;

      // Check if email already exists
      const existingMember = this.teamMembers().find(member => member.email === email);
      if (existingMember) {
        toast.error('This email has already been added');
        return;
      }

      const newMember: TeamMember = { email, is_company_admin: false };
      this.teamMembers.update(members => [...members, newMember]);
      this.registrationState.addTeamMember(newMember);

      this.inviteForm.reset();
      toast.success('Team member added');
    } else {
      this.inviteForm.markAllAsTouched();
    }
  }

  updateMemberRole(email: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const isAdmin = target.value === 'admin';

    this.teamMembers.update(members =>
      members.map(member =>
        member.email === email ? { ...member, is_company_admin: isAdmin } : member
      )
    );
    this.registrationState.updateTeamMember(email, { is_company_admin: isAdmin });
  }

  removeTeamMember(email: string): void {
    this.teamMembers.update(members =>
      members.filter(member => member.email !== email)
    );
    this.registrationState.removeTeamMember(email);
    toast.info('Team member removed');
  }

  onContinue(): void {
    this.submitRegistration(true);
  }

  onSkip(): void {
    this.submitRegistration(false);
  }

  private submitRegistration(sendInvites: boolean): void {
    if (!this.registrationState.canSubmit()) {
      toast.error('Please complete all required steps');
      return;
    }

    this.isLoading.set(true);

    const isGoogleUser = this.registrationState.isGoogleUser();
    const currentUser = this.authService.currentUser();

    let payload: any;

    if (isGoogleUser && currentUser) {
      // Google user - use different payload structure
      payload = this.registrationState.buildGoogleUserPayload(currentUser.id.toString());
    } else {
      // Normal registration
      payload = this.registrationState.buildRegistrationPayload();
    }

    // Include members only if user clicked "Continue" and has members
    if (!sendInvites || this.teamMembers().length === 0) {
      payload.members = [];
    }

    console.log('Registration payload:', payload);

    // Make the API call
    this.http.post<any>(`${environment.apiUrl}/company/account/setup/`, payload)
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);

          // Update auth state if needed (for normal users)
          if (!isGoogleUser && response.access && response.refresh) {
            // Store tokens for normal users
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
          }

          this.completeRegistration(sendInvites && this.teamMembers().length > 0);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Registration error:', error);

          // Check if it's a member email duplicate error (status 400)
          if (error.status === 400) {
            const errorMessage = error.error?.error || error.error?.detail || '';

            // Check if the error message contains "email" and "already exists"
            if (typeof errorMessage === 'string' &&
                errorMessage.includes('email') &&
                errorMessage.includes('already exists')) {
              toast.error('Member email already exists', {
                description: 'One or more team members have an email address that is already registered in the system. Please remove or change them.'
              });
              return;
            }
          }

          // Default error handling
          const errorMsg = error.error?.detail ||
                          error.error?.message ||
                          error.error?.error ||
                          error.error?.email?.[0] ||
                          'Registration failed. Please try again.';

          toast.error('Registration failed', {
            description: errorMsg
          });
        }
      });
  }

  private completeRegistration(hasSentInvites: boolean = false): void {
    this.isLoading.set(false);

    const inviteCount = this.teamMembers().length;
    const description = hasSentInvites && inviteCount > 0
      ? `Welcome to HQDM! ${inviteCount} invitation(s) sent.`
      : 'Welcome to HQDM!';

    toast.success('Registration completed successfully!', {
      description
    });

    // Clear registration state
    this.registrationState.reset();

    // Redirect to company dashboard
    setTimeout(() => {
      this.router.navigate(['/company']);
    }, 1000);
  }

  getInitial(email: string): string {
    return email.charAt(0).toUpperCase();
  }
}
