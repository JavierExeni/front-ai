/**
 * TypeScript type definitions for Google Identity Services (GIS)
 * Documentation: https://developers.google.com/identity/gsi/web/reference/js-reference
 */

/**
 * Credential response from Google after successful authentication
 */
export interface CredentialResponse {
  /** The JWT credential string */
  credential: string;
  /** The button element used for the sign-in */
  select_by?: string;
  /** Information about the client */
  client_id?: string;
}

/**
 * Configuration for initializing Google Identity Services
 */
export interface GoogleIdentityConfig {
  /** Your Google OAuth 2.0 Client ID */
  client_id: string;
  /** Callback function to handle the credential response */
  callback: (response: CredentialResponse) => void;
  /** Auto-select credentials if only one account is available */
  auto_select?: boolean;
  /** Cancel the prompt if the user clicks outside */
  cancel_on_tap_outside?: boolean;
  /** Context for the sign-in flow */
  context?: 'signin' | 'signup' | 'use';
  /** Enable upgraded One Tap UX on ITP browsers */
  itp_support?: boolean;
}

/**
 * Configuration for rendering the Google Sign-In button
 */
export interface GoogleButtonConfig {
  /** Button theme */
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  /** Button size */
  size?: 'large' | 'medium' | 'small';
  /** Button text */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  /** Button shape */
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  /** Logo alignment */
  logo_alignment?: 'left' | 'center';
  /** Button width in pixels */
  width?: number;
  /** Button locale */
  locale?: string;
}

/**
 * Google Identity Services API
 * Available globally after loading the GSI script
 */
export interface GoogleAccounts {
  id: {
    /** Initialize Google Identity Services */
    initialize: (config: GoogleIdentityConfig) => void;
    /** Render the sign-in button */
    renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void;
    /** Display the One Tap prompt */
    prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
    /** Dismiss the One Tap prompt */
    disableAutoSelect: () => void;
    /** Revoke the OAuth 2.0 grant */
    revoke: (email: string, callback: (response: RevocationResponse) => void) => void;
  };
}

/**
 * Notification about the prompt display moment
 */
export interface PromptMomentNotification {
  /** Whether the moment is displayed */
  isDisplayed: () => boolean;
  /** Whether the moment is dismissed */
  isDismissedMoment: () => boolean;
  /** Reason for dismissal */
  getDismissedReason: () => 'credential_returned' | 'cancel' | 'flow_restarted' | string;
  /** Whether the moment is skipped */
  isSkippedMoment: () => boolean;
  /** Reason for skipping */
  getSkippedReason: () => string;
  /** Whether credentials are not displayed */
  isNotDisplayed: () => boolean;
  /** Reason for not displaying */
  getNotDisplayedReason: () => string;
  /** Moment type */
  getMomentType: () => 'display' | 'skipped' | 'dismissed';
}

/**
 * Response from revoking OAuth 2.0 grant
 */
export interface RevocationResponse {
  /** Whether the revocation was successful */
  successful: boolean;
  /** Error message if revocation failed */
  error?: string;
}

/**
 * Decoded JWT credential payload from Google
 */
export interface GoogleCredentialPayload {
  /** Google user ID */
  sub: string;
  /** User's email address */
  email: string;
  /** Whether email is verified */
  email_verified: boolean;
  /** User's full name */
  name?: string;
  /** User's given name */
  given_name?: string;
  /** User's family name */
  family_name?: string;
  /** URL to user's profile picture */
  picture?: string;
  /** User's locale */
  locale?: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** Issuer */
  iss: string;
  /** Audience (your client ID) */
  aud: string;
}

/**
 * Extend Window interface to include Google Accounts
 */
declare global {
  interface Window {
    google?: GoogleAccounts;
  }

  /**
   * Declare google as a global constant (available from the script tag)
   */
  const google: GoogleAccounts;
}
