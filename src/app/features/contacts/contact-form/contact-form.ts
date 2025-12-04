import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputText } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input';

@Component({
  selector: 'contact-form',
  imports: [ReactiveFormsModule, InputText, MultiSelectModule, PhoneInputComponent],
  templateUrl: './contact-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm {
  private readonly fb = inject(FormBuilder);

  states = [
    {
      name: 'Interested',
    },
    {
      name: 'Not Interested',
    },
    {
      name: 'Callback Required',
    },
  ];

  readonly contactForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    company: [''],
    title: [''],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [null, [Validators.required]],
    status: [''],
  });

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
    }
  }
}
