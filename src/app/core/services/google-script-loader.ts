import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Observable, ReplaySubject, of } from 'rxjs';

/**
 * Service to dynamically load the Google Identity Services script
 * Implements best practices for external script loading in Angular:
 * - Uses DOCUMENT injection token (SSR-safe)
 * - Returns Observable for reactive handling
 * - Caches the loading state to prevent duplicate loads
 * - Platform-aware (checks if running in browser)
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleScriptLoaderService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private scriptLoadedSubject?: ReplaySubject<boolean>;
  private readonly GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

  /**
   * Load the Google Identity Services script
   * @returns Observable<boolean> that emits true when script is loaded, false on error
   */
  loadScript(): Observable<boolean> {
    console.log('[GoogleScriptLoader] loadScript() called');

    // Only run in browser environment (not in SSR)
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[GoogleScriptLoader] Not in browser, returning false');
      return of(false);
    }

    // If script is already loaded, return immediately
    if (this.isScriptLoaded()) {
      console.log('[GoogleScriptLoader] Script already loaded, returning true');
      return of(true);
    }

    // If loading is already in progress, return the existing observable
    if (this.scriptLoadedSubject) {
      console.log('[GoogleScriptLoader] Loading already in progress, returning cached observable');
      return this.scriptLoadedSubject.asObservable();
    }

    // Create a new ReplaySubject to cache the result
    this.scriptLoadedSubject = new ReplaySubject<boolean>(1);
    console.log('[GoogleScriptLoader] Created new ReplaySubject');

    // Check if script tag already exists (from index.html)
    const existingScript = this.document.querySelector(
      `script[src="${this.GOOGLE_SCRIPT_URL}"]`
    );

    if (existingScript) {
      console.log('[GoogleScriptLoader] Found existing script tag');

      // Check if the script is already loaded (readyState check for IE, or just check if Google is available)
      const scriptElement = existingScript as HTMLScriptElement;

      // If Google is already available, the script already loaded
      if (this.isScriptLoaded()) {
        console.log('[GoogleScriptLoader] Script already executed, emitting true immediately');
        this.scriptLoadedSubject.next(true);
        this.scriptLoadedSubject.complete();
      } else {
        // Script tag exists but hasn't loaded yet, poll for it
        console.log('[GoogleScriptLoader] Script found but not loaded yet, polling for Google object...');
        this.pollForGoogle();
      }
    } else {
      console.log('[GoogleScriptLoader] No existing script found, creating new one');
      // Create and inject script tag dynamically
      const script = this.document.createElement('script');
      script.src = this.GOOGLE_SCRIPT_URL;
      script.async = true;
      script.defer = true;

      this.attachLoadListeners(script);

      // Append to document head
      this.document.head.appendChild(script);
      console.log('[GoogleScriptLoader] Script appended to head');
    }

    return this.scriptLoadedSubject.asObservable();
  }

  /**
   * Check if Google Identity Services is already loaded
   */
  private isScriptLoaded(): boolean {
    return typeof google !== 'undefined' &&
           typeof google?.id !== 'undefined';
  }

  /**
   * Attach load and error event listeners to script element
   */
  private attachLoadListeners(script: HTMLScriptElement): void {
    console.log('[GoogleScriptLoader] Attaching load listeners');

    script.addEventListener('load', () => {
      console.log('[GoogleScriptLoader] Script load event fired');
      console.log('[GoogleScriptLoader] Checking if Google is loaded:', this.isScriptLoaded());

      if (this.isScriptLoaded()) {
        console.log('[GoogleScriptLoader] ✅ Google object available, emitting true');
        this.scriptLoadedSubject?.next(true);
        this.scriptLoadedSubject?.complete();
      } else {
        // Script loaded but Google object not available
        console.error('[GoogleScriptLoader] ❌ Script loaded but Google object not available');
        this.scriptLoadedSubject?.next(false);
        this.scriptLoadedSubject?.complete();
      }
    });

    script.addEventListener('error', (error) => {
      console.error('[GoogleScriptLoader] ❌ Failed to load Google Identity Services script:', error);
      this.scriptLoadedSubject?.next(false);
      this.scriptLoadedSubject?.complete();
    });
  }

  /**
   * Poll for Google Identity Services to become available
   * Used when script tag exists but hasn't loaded yet
   */
  private pollForGoogle(): void {
    let attempts = 0;
    const maxAttempts = 50; // 50 * 100ms = 5 seconds

    const checkInterval = setInterval(() => {
      attempts++;
      console.log(`[GoogleScriptLoader] Polling attempt ${attempts}/${maxAttempts}`);

      if (this.isScriptLoaded()) {
        console.log('[GoogleScriptLoader] ✅ Google object detected via polling');
        clearInterval(checkInterval);
        this.scriptLoadedSubject?.next(true);
        this.scriptLoadedSubject?.complete();
      } else if (attempts >= maxAttempts) {
        console.error('[GoogleScriptLoader] ❌ Timeout waiting for Google object');
        clearInterval(checkInterval);
        this.scriptLoadedSubject?.next(false);
        this.scriptLoadedSubject?.complete();
      }
    }, 100);
  }

  /**
   * Check if Google Identity Services is available
   */
  isGoogleAvailable(): boolean {
    return this.isScriptLoaded();
  }
}
