import { Component, signal, inject, ChangeDetectionStrategy, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { RegistrationStateService } from '../../../../core/services/registration-state';

interface CompanySize {
  label: string;
  value: string;
}

@Component({
  selector: 'form-step-two',
  imports: [ReactiveFormsModule, InputText, Select],
  templateUrl: './form-step-two.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormStepTwo implements OnInit {
  activateStep = output<number>();
  private readonly fb = inject(FormBuilder);
  private readonly registrationState = inject(RegistrationStateService);

  readonly companySizes = signal<CompanySize[]>([
    { label: '1-10 employees', value: '1-10' },
    { label: '11-50 employees', value: '11-50' },
    { label: '51-200 employees', value: '51-200' },
    { label: '201-500 employees', value: '201-500' },
    { label: '501-1000 employees', value: '501-1000' },
    { label: '1000+ employees', value: '1000+' },
  ]);

  readonly companyInfoForm: FormGroup = this.fb.group({
    companyName: ['', [Validators.required]],
    website: ['', [Validators.required]],
    headquarters: ['', [Validators.required]],
    companySize: [null, [Validators.required]],
  });

  ngOnInit(): void {
    // Load existing state if user is navigating back
    const existingData = this.registrationState.companyData();
    if (existingData.name) {
      this.companyInfoForm.patchValue({
        companyName: existingData.name || '',
        website: existingData.website || '',
        headquarters: existingData.headquarters || '',
        companySize: existingData.size ? this.companySizes().find(s => s.value === existingData.size) : null,
      });
    }
  }

  onSubmit(): void {
    if (this.companyInfoForm.valid) {
      const formValue = this.companyInfoForm.value;

      // Save to global state
      this.registrationState.setCompanyData({
        name: formValue.companyName,
        website: formValue.website,
        headquarters: formValue.headquarters,
        size: formValue.companySize.value,
        industry_pack_id: null, // Will be set in step 3
      });

      this.activateStep.emit(3);
    } else {
      this.companyInfoForm.markAllAsTouched();
    }
  }
}
