import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'admin-header',
  imports: [],
  templateUrl: './admin-header.html',
  styles: ``,
})
export class AdminHeader {
  private authService = inject(Auth);

  logout(): void {
    this.authService.logout();
  }
}
