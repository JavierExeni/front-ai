import { Component } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'form-campaign-details',
  imports: [TextareaModule, InputTextModule, DatePickerModule],
  templateUrl: './form-campaign-details.html',
  styles: ``,
})
export class FormCampaignDetails {}
