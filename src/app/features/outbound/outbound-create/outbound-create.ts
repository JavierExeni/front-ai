import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { FormCampaignDetails } from "./form-campaign-details/form-campaign-details";
import { FormBuildSequence } from "./form-build-sequence/form-build-sequence";

@Component({
  selector: 'app-outbound-create',
  imports: [StepperModule, ButtonModule, FormCampaignDetails, FormBuildSequence],
  templateUrl: './outbound-create.html',
  styles: ``,
})
export default class OutboundCreate {
  private router = inject(Router);

  activeStep: number = 1;

  onCancel() {
    // Navigate back to outbound list
    this.router.navigate(['/admin/outbound']);
  }
}
