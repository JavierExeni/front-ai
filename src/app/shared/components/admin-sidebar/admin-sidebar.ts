import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { menuOptions } from '../../constants/menu-options';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styles: ``,
})
export class AdminSidebar {
  readonly themeService = inject(ThemeService);
  readonly options = menuOptions;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
