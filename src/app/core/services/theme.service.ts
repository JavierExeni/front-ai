import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'hqdm-light' | 'hqdm-dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'hqdm-theme';

  // Signal para el tema actual
  readonly currentTheme = signal<Theme>(this.getInitialTheme());

  // Computed signal para saber si está en modo oscuro
  readonly isDark = signal<boolean>(this.currentTheme() === 'hqdm-dark');

  constructor() {
    // Effect para aplicar el tema cuando cambie
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.isDark.set(theme === 'hqdm-dark');
    });
  }

  /**
   * Obtiene el tema inicial desde localStorage o preferencias del sistema
   */
  private getInitialTheme(): Theme {
    // Primero intenta obtener desde localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme === 'hqdm-light' || savedTheme === 'hqdm-dark') {
      return savedTheme;
    }

    // Si no hay tema guardado, usa las preferencias del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'hqdm-dark' : 'hqdm-light';
  }

  /**
   * Aplica el tema al documento HTML
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;

    // Para DaisyUI
    htmlElement.setAttribute('data-theme', theme);

    // Para PrimeNG - agrega/remueve clase .app-dark-mode
    if (theme === 'hqdm-dark') {
      htmlElement.classList.add('app-dark-mode');
    } else {
      htmlElement.classList.remove('app-dark-mode');
    }

    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Alterna entre modo claro y oscuro
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'hqdm-light' ? 'hqdm-dark' : 'hqdm-light';
    this.currentTheme.set(newTheme);
  }

  /**
   * Establece un tema específico
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }
}
