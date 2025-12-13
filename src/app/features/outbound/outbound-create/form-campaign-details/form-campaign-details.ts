import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'form-campaign-details',
  imports: [
    ReactiveFormsModule,
    TextareaModule,
    InputTextModule,
    DatePickerModule,
    CheckboxModule,
    ButtonModule,
  ],
  templateUrl: './form-campaign-details.html',
  styles: ``,
})
export class FormCampaignDetails {
  private fb = inject(FormBuilder);

  continue = output<void>();
  cancel = output<void>();

  campaignForm = this.fb.group({
    campaignName: ['', Validators.required],
    campaignDescription: [''],
    startDate: [null as Date | null, Validators.required],
    runsIndefinitely: [false],
    endDate: [null as Date | null],
  });

  constructor() {
    // Update endDate validation based on runsIndefinitely checkbox
    this.campaignForm.controls.runsIndefinitely.valueChanges.subscribe((isIndefinite) => {
      const endDateControl = this.campaignForm.controls.endDate;
      if (isIndefinite) {
        endDateControl.clearValidators();
        endDateControl.setValue(null);
      } else {
        endDateControl.setValidators([Validators.required]);
      }
      endDateControl.updateValueAndValidity();
    });
  }

  onCancel() {
    this.cancel.emit();
    this.campaignForm.reset();
  }

  onContinue() {
    if (this.campaignForm.valid) {
      console.log('Form data:', this.campaignForm.value);
      this.continue.emit();
    }
  }
}
