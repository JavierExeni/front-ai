import { Component, output, signal, inject, OnInit } from '@angular/core';
import { RegistrationStateService } from '../../../../core/services/registration-state';
import { IndustriesApiService, IIndustry } from '../../../../core/services/industries-api';

@Component({
  selector: 'form-step-three',
  imports: [],
  templateUrl: './form-step-three.html',
  styles: ``,
})
export class FormStepThree implements OnInit {
  activateStep = output<number>();
  private readonly registrationState = inject(RegistrationStateService);
  private readonly industriesApiService = inject(IndustriesApiService);

  selectedIndustry = signal<number | null>(null);
  industries = signal<IIndustry[]>([]);
  isLoadingIndustries = signal<boolean>(true);

  ngOnInit(): void {
    // Load industries from backend
    this.isLoadingIndustries.set(true);
    this.industriesApiService.fetchIndustries().subscribe({
      next: (industries) => {
        this.industries.set(industries);
        this.isLoadingIndustries.set(false);

        // Load existing state if user is navigating back
        const existingIndustry = this.registrationState.selectedIndustry();
        if (existingIndustry) {
          this.selectedIndustry.set(existingIndustry);
        }
      },
      error: (error) => {
        console.error('Error loading industries:', error);
        this.isLoadingIndustries.set(false);
      }
    });
  }

  selectIndustry(industryId: number): void {
    this.selectedIndustry.set(industryId);
    // Save to global state immediately
    this.registrationState.setSelectedIndustry(industryId);
  }

  onContinue(): void {
    if (this.selectedIndustry()) {
      this.activateStep.emit(4);
    }
  }
}
