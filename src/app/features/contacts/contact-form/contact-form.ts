import { Component, ChangeDetectionStrategy, inject, input, output, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputText } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input';
import { Contact } from '../../../core/models/contact';

@Component({
  selector: 'contact-form',
  imports: [ReactiveFormsModule, InputText, MultiSelectModule, PhoneInputComponent],
  templateUrl: './contact-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm {
  private readonly fb = inject(FormBuilder);

  // Inputs
  initialData = input<Contact | null>(null);

  // Outputs
  submit = output<any>();
  cancel = output<void>();

  states = [
    {
      name: 'interested',
      label: 'Interested',
    },
    {
      name: 'not_interested',
      label: 'Not Interested',
    },
    {
      name: 'callback_required',
      label: 'Callback Required',
    },
  ];

  readonly contactForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    company: [''],
    title: [''],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [null, [Validators.required]],
    status: [[]],
  });

  constructor() {
    // Effect to populate form when initialData changes
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.contactForm.patchValue({
          firstName: data.first_name,
          lastName: data.last_name,
          company: data.company_client,
          title: data.title,
          email: data.email,
          phoneNumber: data.phone,
          status: data.status || [],
        });
      } else {
        this.contactForm.reset();
      }
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;

      // Transform form data to API format
      const contactData = {
        first_name: formValue.firstName,
        last_name: formValue.lastName,
        company_client: formValue.company,
        title: formValue.title,
        email: formValue.email,
        phone: formValue.phoneNumber,
        status: formValue.status || [],
      };

      this.submit.emit(contactData);
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.contactForm.reset();
    this.cancel.emit();
  }
}
