import { Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NgxSonnerToaster } from 'ngx-sonner';

type Theme = 'hqdm-light' | 'hqdm-dark';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly title = signal('hqdm-front');
  protected readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Effect to apply theme to HTML element when it changes
    effect(() => {
      if (this.isBrowser) {
        const isDark = this.theme() === 'hqdm-dark';

        // Set DaisyUI theme
        document.documentElement.setAttribute('data-theme', this.theme());

        // Set PrimeNG dark mode class
        if (isDark) {
          document.documentElement.classList.add('app-dark-mode');
        } else {
          document.documentElement.classList.remove('app-dark-mode');
        }

        localStorage.setItem('theme', this.theme());
      }
    });
  }

  private getInitialTheme(): Theme {
    if (!this.isBrowser) {
      return 'hqdm-light';
    }

    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'hqdm-light' || savedTheme === 'hqdm-dark') {
      return savedTheme;
    }

    // Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'hqdm-dark' : 'hqdm-light';
  }

  protected toggleTheme(): void {
    this.theme.set(this.theme() === 'hqdm-light' ? 'hqdm-dark' : 'hqdm-light');
  }

  protected get isDarkMode(): boolean {
    return this.theme() === 'hqdm-dark';
  }
}
