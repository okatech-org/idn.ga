import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthorizeRequest {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header for user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized', error_description: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized', error_description: 'Invalid user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: AuthorizeRequest = await req.json();
    const { client_id, redirect_uri, response_type, scope, state, code_challenge, code_challenge_method } = body;

    // Validate response_type
    if (response_type !== 'code') {
      return new Response(JSON.stringify({ error: 'unsupported_response_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch client
    const { data: client, error: clientError } = await supabase
      .from('oauth_clients')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (clientError || !client) {
      return new Response(JSON.stringify({ error: 'invalid_client', error_description: 'Client not found or inactive' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate redirect_uri
    if (!client.redirect_uris.includes(redirect_uri)) {
      return new Response(JSON.stringify({ error: 'invalid_redirect_uri' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate scopes
    const requestedScopes = scope.split(' ').filter(Boolean);
    const allowedScopes = client.allowed_scopes as string[];
    const validScopes = requestedScopes.filter(s => allowedScopes.includes(s));

    if (validScopes.length === 0) {
      return new Response(JSON.stringify({ error: 'invalid_scope' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get citizen info linked to user
    const { data: citizen } = await supabase
      .from('citizens')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Check existing consent
    const { data: existingConsent } = await supabase
      .from('oauth_consents')
      .select('scopes')
      .eq('user_id', user.id)
      .eq('client_id', client.id)
      .is('revoked_at', null)
      .single();

    // If consent exists and covers all requested scopes, auto-approve
    const hasFullConsent = existingConsent && 
      validScopes.every(s => (existingConsent.scopes as string[]).includes(s));

    if (hasFullConsent) {
      // Generate authorization code directly
      const { data: authCode, error: codeError } = await supabase
        .from('oauth_authorization_codes')
        .insert({
          client_id: client.id,
          user_id: user.id,
          citizen_id: citizen?.id,
          redirect_uri,
          scopes: validScopes,
          code_challenge,
          code_challenge_method,
        })
        .select('code')
        .single();

      if (codeError) {
        throw codeError;
      }

      // Log the access
      await supabase.from('oauth_access_logs').insert({
        client_id: client.id,
        user_id: user.id,
        action: 'authorize_auto',
        scopes_requested: requestedScopes,
        scopes_granted: validScopes,
        success: true,
      });

      return new Response(JSON.stringify({
        redirect_url: `${redirect_uri}?code=${authCode.code}${state ? `&state=${state}` : ''}`,
        auto_approved: true,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return client info for consent screen
    const { data: scopeDefinitions } = await supabase
      .from('oauth_scope_definitions')
      .select('*')
      .in('scope_name', validScopes)
      .order('sort_order');

    return new Response(JSON.stringify({
      requires_consent: true,
      client: {
        id: client.id,
        name: client.client_name,
        description: client.client_description,
        logo_url: client.client_logo_url,
        website: client.client_website,
        is_verified: client.is_verified,
      },
      scopes: scopeDefinitions,
      redirect_uri,
      state,
      code_challenge,
      code_challenge_method,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OAuth authorize error:', error);
    return new Response(JSON.stringify({ error: 'server_error', error_description: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
