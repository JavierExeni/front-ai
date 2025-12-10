import { Component, ChangeDetectionStrategy, signal, output, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
  selector: 'app-otp-input-dialog',
  imports: [DialogModule, ButtonModule, InputOtpModule, FormsModule],
  templateUrl: './otp-input-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtpInputDialogComponent {
  // Inputs
  readonly visible = input.required<boolean>();
  readonly email = input<string>('');
  readonly isVerifying = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly otpComplete = output<string>();

  // State
  readonly otpValue = signal<string | null>(null);

  constructor() {
    // Auto-submit when OTP is complete (6 digits)
    effect(() => {
      const value = this.otpValue();
      if (value && value.length === 6) {
        this.otpComplete.emit(value);
      }
    });
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.otpValue.set(null);
  }

  onOtpChange(value: any): void {
    this.otpValue.set(value);
  }
}
