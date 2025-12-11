import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { FormCampaignDetails } from "./form-campaign-details/form-campaign-details";

@Component({
  selector: 'app-outbound-create',
  imports: [StepperModule, ButtonModule, FormCampaignDetails],
  templateUrl: './outbound-create.html',
  styles: ``,
})
export default class OutboundCreate {
activeStep: number = 1;
}
