declare module '@react-oauth/google' {
  export interface GoogleCredentialResponse {
    credential?: string;
    clientId?: string;
    select_by?: string;
  }

  export interface GoogleLoginProps {
    onSuccess?: (credentialResponse: GoogleCredentialResponse) => void;
    onError?: () => void;
    useOneTap?: boolean;
    flow?: 'implicit' | 'auth-code';
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    state_cookie_domain?: string;
    ux_mode?: 'popup' | 'redirect';
    login_uri?: string;
    native_callback?: (response: any) => void;
    itp_support?: boolean;
  }

  export const GoogleLogin: React.FC<GoogleLoginProps>;

  export interface GoogleOAuthProviderProps {
    clientId: string;
    children: React.ReactNode;
  }

  export const GoogleOAuthProvider: React.FC<GoogleOAuthProviderProps>;
}