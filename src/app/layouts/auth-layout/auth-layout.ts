import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../shared/services/theme';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './auth-layout.html',
  styles: ``,
})
export class AuthLayout {
  readonly themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
