import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OAuthConsentScreen } from '@/components/oauth/OAuthConsentScreen';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OAuthClient {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website: string;
  is_verified: boolean;
}

interface ScopeDefinition {
  scope_name: string;
  display_name: string;
  description: string;
  category: string;
  is_sensitive: boolean;
  requires_verification: boolean;
}

interface AuthorizeResponse {
  requires_consent?: boolean;
  auto_approved?: boolean;
  redirect_url?: string;
  client?: OAuthClient;
  scopes?: ScopeDefinition[];
  redirect_uri?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  error?: string;
  error_description?: string;
}

export default function OAuthAuthorize() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authData, setAuthData] = useState<AuthorizeResponse | null>(null);

  const client_id = searchParams.get('client_id');
  const redirect_uri = searchParams.get('redirect_uri');
  const response_type = searchParams.get('response_type') || 'code';
  const scope = searchParams.get('scope') || 'openid profile';
  const state = searchParams.get('state');
  const code_challenge = searchParams.get('code_challenge');
  const code_challenge_method = searchParams.get('code_challenge_method');

  useEffect(() => {
    const authorize = async () => {
      if (!client_id || !redirect_uri) {
        setError('Paramètres manquants: client_id et redirect_uri sont requis');
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirect to login with return URL
          const returnUrl = window.location.href;
          navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }

        const { data, error: fnError } = await supabase.functions.invoke('oauth-authorize', {
          body: {
            client_id,
            redirect_uri,
            response_type,
            scope,
            state,
            code_challenge,
            code_challenge_method,
          },
        });

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data.error) {
          setError(`${data.error}: ${data.error_description || ''}`);
        } else if (data.auto_approved && data.redirect_url) {
          // Auto-approved, redirect immediately
          window.location.href = data.redirect_url;
        } else if (data.requires_consent) {
          setAuthData(data);
        }
      } catch (err: any) {
        console.error('OAuth authorize error:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    authorize();
  }, [client_id, redirect_uri, response_type, scope, state, code_challenge, code_challenge_method, navigate]);

  const handleApprove = async (selectedScopes: string[]) => {
    if (!authData?.client) return;
    
    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('oauth-consent', {
        body: {
          client_id: authData.client.id,
          redirect_uri: authData.redirect_uri,
          scopes: selectedScopes,
          state: authData.state,
          code_challenge: authData.code_challenge,
          code_challenge_method: authData.code_challenge_method,
          action: 'approve',
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else if (data.error) {
        setError(`${data.error}: ${data.error_description || ''}`);
      }
    } catch (err: any) {
      console.error('OAuth consent error:', err);
      setError(err.message || 'Erreur lors de l\'autorisation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeny = async () => {
    if (!authData?.client) {
      // Just go back
      navigate(-1);
      return;
    }
    
    setSubmitting(true);
    try {
      const { data } = await supabase.functions.invoke('oauth-consent', {
        body: {
          client_id: authData.client.id,
          redirect_uri: authData.redirect_uri,
          scopes: [],
          state: authData.state,
          action: 'deny',
        },
      });

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (err: any) {
      console.error('OAuth deny error:', err);
      // Redirect with error anyway
      if (redirect_uri) {
        window.location.href = `${redirect_uri}?error=access_denied${state ? `&state=${state}` : ''}`;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-yellow-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-yellow-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erreur d'autorisation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  if (authData?.requires_consent && authData.client && authData.scopes) {
    return (
      <OAuthConsentScreen
        client={authData.client}
        scopes={authData.scopes}
        onApprove={handleApprove}
        onDeny={handleDeny}
        isLoading={submitting}
      />
    );
  }

  return null;
}
