import { Component, output, signal } from '@angular/core';

interface Industry {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'form-step-three',
  imports: [],
  templateUrl: './form-step-three.html',
  styles: ``,
})
export class FormStepThree {
  activateStep = output<number>();
  selectedIndustry = signal<string | null>(null);

  industries: Industry[] = [
    { id: 'marketing', name: 'Advertising & Marketing', icon: 'fa-solid fa-bullhorn' },
    { id: 'movers', name: 'Logistic & Moving', icon: 'fa-solid fa-dolly' },
    { id: 'plumbers', name: 'Plumbing Services', icon: 'fa-solid fa-wrench' },
    { id: 'hvac', name: 'HVAC Services', icon: 'fa-solid fa-fan' },
    { id: 'electricians', name: 'Electrical Services', icon: 'fa-solid fa-plug-circle-bolt' },
    { id: 'roofers', name: 'Roofing Services', icon: 'fa-solid fa-helmet-safety' },
    { id: 'others', name: 'Other', icon: 'fa-solid fa-arrows-rotate' },
  ];

  selectIndustry(industryId: string): void {
    this.selectedIndustry.set(industryId);
  }
}
