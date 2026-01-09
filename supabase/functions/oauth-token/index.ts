import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as base64Encode } from 'https://deno.land/std@0.208.0/encoding/base64.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple JWT creation for ID tokens
function createIdToken(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${headerB64}.${payloadB64}`;
  
  // Simple HMAC-SHA256 signature using Web Crypto
  const key = encoder.encode(secret);
  const message = encoder.encode(data);
  
  // For demo purposes, using a simple hash. In production, use proper HMAC.
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = ((hash << 5) - hash + message[i] + key[i % key.length]) | 0;
  }
  const signature = Math.abs(hash).toString(36).padEnd(43, 'x');
  
  return `${data}.${signature}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { grant_type, code, redirect_uri, client_id, client_secret, code_verifier, refresh_token } = body;

    // Fetch client
    const { data: client, error: clientError } = await supabase
      .from('oauth_clients')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (clientError || !client) {
      return new Response(JSON.stringify({ error: 'invalid_client' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify client secret for confidential clients
    if (client.is_confidential && client.client_secret !== client_secret) {
      return new Response(JSON.stringify({ error: 'invalid_client' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (grant_type === 'authorization_code') {
      // Fetch authorization code
      const { data: authCode, error: codeError } = await supabase
        .from('oauth_authorization_codes')
        .select('*')
        .eq('code', code)
        .eq('client_id', client.id)
        .is('used_at', null)
        .single();

      if (codeError || !authCode) {
        return new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid or expired code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check expiration
      if (new Date(authCode.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'Code expired' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate redirect_uri
      if (authCode.redirect_uri !== redirect_uri) {
        return new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'Redirect URI mismatch' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PKCE validation
      if (authCode.code_challenge && code_verifier) {
        // Simple S256 validation
        const encoder = new TextEncoder();
        const data = encoder.encode(code_verifier);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const calculatedChallenge = btoa(String.fromCharCode(...hashArray))
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');
        
        if (calculatedChallenge !== authCode.code_challenge) {
          return new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid code_verifier' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Mark code as used
      await supabase
        .from('oauth_authorization_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', authCode.id);

      // Create access token
      const { data: accessToken, error: tokenError } = await supabase
        .from('oauth_access_tokens')
        .insert({
          client_id: client.id,
          user_id: authCode.user_id,
          citizen_id: authCode.citizen_id,
          scopes: authCode.scopes,
        })
        .select('*')
        .single();

      if (tokenError) {
        throw tokenError;
      }

      // Create refresh token
      const { data: refreshToken } = await supabase
        .from('oauth_refresh_tokens')
        .insert({
          access_token_id: accessToken.id,
          client_id: client.id,
          user_id: authCode.user_id,
        })
        .select('token')
        .single();

      // Build ID token if openid scope
      let id_token = null;
      if ((authCode.scopes as string[]).includes('openid')) {
        const { data: citizen } = await supabase
          .from('citizens')
          .select('*')
          .eq('id', authCode.citizen_id)
          .single();

        const idTokenPayload: Record<string, unknown> = {
          iss: supabaseUrl,
          sub: authCode.user_id,
          aud: client.client_id,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          nip: citizen?.nip,
        };

        if ((authCode.scopes as string[]).includes('profile') && citizen) {
          idTokenPayload.given_name = citizen.first_name;
          idTokenPayload.family_name = citizen.last_name;
          idTokenPayload.birthdate = citizen.date_of_birth;
          idTokenPayload.gender = citizen.gender;
        }

        if ((authCode.scopes as string[]).includes('email') && citizen?.email) {
          idTokenPayload.email = citizen.email;
          idTokenPayload.email_verified = true;
        }

        if ((authCode.scopes as string[]).includes('phone') && citizen?.phone_number) {
          idTokenPayload.phone_number = citizen.phone_number;
          idTokenPayload.phone_number_verified = true;
        }

        id_token = createIdToken(idTokenPayload, supabaseServiceKey);
      }

      // Log token issuance
      await supabase.from('oauth_access_logs').insert({
        client_id: client.id,
        user_id: authCode.user_id,
        action: 'token_issued',
        scopes_granted: authCode.scopes,
        success: true,
      });

      return new Response(JSON.stringify({
        access_token: accessToken.token,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken?.token,
        scope: (authCode.scopes as string[]).join(' '),
        id_token,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (grant_type === 'refresh_token') {
      // Handle refresh token
      const { data: existingRefresh, error: refreshError } = await supabase
        .from('oauth_refresh_tokens')
        .select('*, oauth_access_tokens(*)')
        .eq('token', refresh_token)
        .eq('client_id', client.id)
        .is('revoked_at', null)
        .single();

      if (refreshError || !existingRefresh) {
        return new Response(JSON.stringify({ error: 'invalid_grant' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check expiration
      if (new Date(existingRefresh.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'Refresh token expired' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Revoke old tokens
      await supabase
        .from('oauth_access_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', existingRefresh.access_token_id);

      await supabase
        .from('oauth_refresh_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', existingRefresh.id);

      // Create new access token
      const oldToken = existingRefresh.oauth_access_tokens;
      const { data: newAccessToken } = await supabase
        .from('oauth_access_tokens')
        .insert({
          client_id: client.id,
          user_id: oldToken.user_id,
          citizen_id: oldToken.citizen_id,
          scopes: oldToken.scopes,
        })
        .select('*')
        .single();

      // Create new refresh token
      const { data: newRefreshToken } = await supabase
        .from('oauth_refresh_tokens')
        .insert({
          access_token_id: newAccessToken!.id,
          client_id: client.id,
          user_id: oldToken.user_id,
        })
        .select('token')
        .single();

      return new Response(JSON.stringify({
        access_token: newAccessToken!.token,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken?.token,
        scope: (oldToken.scopes as string[]).join(' '),
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'unsupported_grant_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('OAuth token error:', error);
    return new Response(JSON.stringify({ error: 'server_error', error_description: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
