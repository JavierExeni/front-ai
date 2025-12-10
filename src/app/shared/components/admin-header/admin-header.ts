import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'admin-header',
  imports: [RouterLink],
  templateUrl: './admin-header.html',
  styles: ``,
})
export class AdminHeader {
  private authService = inject(Auth);

   readonly currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}
