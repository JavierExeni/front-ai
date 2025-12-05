import { Component, signal, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

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
export class FormStepTwo {
  activateStep = output<number>();
  private readonly fb = inject(FormBuilder);

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

  onSubmit(): void {
    if (this.companyInfoForm.valid) {
      console.log('Form submitted:', this.companyInfoForm.value);
      this.activateStep.emit(3)
    } else {
      this.companyInfoForm.markAllAsTouched();
    }
  }
}
