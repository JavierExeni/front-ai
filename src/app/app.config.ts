import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withViewTransitions } from '@angular/router';

import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';

// Custom PrimeNG Aura preset matching DaisyUI hqdm theme colors
// Primary color: oklch(60% 0.25 280) = #9747FF (purple/violet)
const CustomAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#9747ff', // Main brand color matching DaisyUI primary
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#9747ff',
          contrastColor: '#ffffff',
          hoverColor: '#7c3aed',
          activeColor: '#6d28d9',
        },
        surface: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      dark: {
        primary: {
          color: '#c084fc',
          contrastColor: '#1c1c1f',
          hoverColor: '#d8b4fe',
          activeColor: '#e9d5ff',
        },
        surface: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#1c1c1f',
          950: '#0e0e10',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    // PrimeNG Configuration
    providePrimeNG({
      theme: {
        preset: CustomAura,
        options: {
          darkModeSelector: '.app-dark-mode',
        },
      },
      ripple: true,
    }),
  ],
};
