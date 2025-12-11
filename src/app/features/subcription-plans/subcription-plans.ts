import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionPlansApi } from '../../core/services/subscription-plans-api';
import { SubscriptionPlan } from '../../core/models/subscription-plan';
import { Auth } from '../../core/services/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-subcription-plans',
  imports: [CommonModule],
  templateUrl: './subcription-plans.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SubcriptionPlans implements OnInit {
  private subscriptionPlansApi = inject(SubscriptionPlansApi);
  private auth = inject(Auth);

  plans = signal<SubscriptionPlan[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  isSubscribing = signal<boolean>(false);
  subscribingPlanId = signal<number | null>(null);
  subscribeError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.subscriptionPlansApi.getSubscriptionPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load subscription plans. Please try again later.');
        this.isLoading.set(false);
        console.error('Error loading subscription plans:', err);
      },
    });
  }

  selectPlan(plan: SubscriptionPlan): void {
    // Clear any previous subscription errors
    this.subscribeError.set(null);

    // Validate user is authenticated
    if (!this.auth.isUserAuthenticated()) {
      this.subscribeError.set('You must be logged in to subscribe to a plan.');
      return;
    }

    // Get current user
    const currentUser = this.auth.currentUser();
    if (!currentUser?.id) {
      this.subscribeError.set('Unable to identify user. Please log in again.');
      return;
    }

    // Set loading state
    this.isSubscribing.set(true);
    this.subscribingPlanId.set(plan.id);

    // Call subscribe API
    this.subscriptionPlansApi
      .subscribe(currentUser.id, plan.id)
      .pipe(
        finalize(() => {
          this.isSubscribing.set(false);
          this.subscribingPlanId.set(null);
        })
      )
      .subscribe({
        next: (response) => {
          // Redirect to Stripe checkout URL
          if (response.url) {
            window.location.href = response.url;
          } else {
            this.subscribeError.set('No checkout URL received. Please try again.');
          }
        },
        error: (err) => {
          console.error('Error subscribing to plan:', err);

          // Handle specific error messages from the API
          let errorMessage = 'Failed to process subscription. Please try again later.';

          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.error?.detail) {
            errorMessage = err.error.detail;
          } else if (err.status === 401) {
            errorMessage = 'Your session has expired. Please log in again.';
          } else if (err.status === 400) {
            errorMessage = 'Invalid subscription request. Please try again.';
          }

          this.subscribeError.set(errorMessage);
        },
      });
  }

  /**
   * Check if a specific plan is currently being subscribed to
   */
  isPlanSubscribing(planId: number): boolean {
    return this.isSubscribing() && this.subscribingPlanId() === planId;
  }
}
