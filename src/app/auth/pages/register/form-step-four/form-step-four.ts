import { Component, signal, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

interface TeamMember {
  email: string;
  role: string;
}

interface RoleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'form-step-four',
  imports: [ReactiveFormsModule, FormsModule, InputText, Select],
  templateUrl: './form-step-four.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormStepFour {
  activateStep = output<number>();
  private readonly fb = inject(FormBuilder);

  readonly teamMembers = signal<TeamMember[]>([]);
  readonly roleOptions = signal<RoleOption[]>([
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
  ]);

  readonly inviteForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  addTeamMember(): void {
    if (this.inviteForm.valid) {
      const email = this.inviteForm.get('email')?.value;

      // Check if email already exists
      const existingMember = this.teamMembers().find(member => member.email === email);
      if (existingMember) {
        return;
      }

      this.teamMembers.update(members => [
        ...members,
        { email, role: 'user' }
      ]);

      this.inviteForm.reset();
    } else {
      this.inviteForm.markAllAsTouched();
    }
  }

  removeTeamMember(email: string): void {
    this.teamMembers.update(members =>
      members.filter(member => member.email !== email)
    );
  }

  updateMemberRole(email: string, newRole: string): void {
    this.teamMembers.update(members =>
      members.map(member =>
        member.email === email ? { ...member, role: newRole } : member
      )
    );
  }

  onContinue(): void {
    console.log('Invited team members:', this.teamMembers());
    // Handle continue logic
  }

  onSkip(): void {
    console.log('Skipped team invitation');
    // Handle skip logic
  }

  getInitial(email: string): string {
    return email.charAt(0).toUpperCase();
  }
}
