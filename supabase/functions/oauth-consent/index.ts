import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsentRequest {
  client_id: string;
  redirect_uri: string;
  scopes: string[];
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  action: 'approve' | 'deny';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ConsentRequest = await req.json();
    const { client_id, redirect_uri, scopes, state, code_challenge, code_challenge_method, action } = body;

    // Fetch client by UUID
    const { data: client, error: clientError } = await supabase
      .from('oauth_clients')
      .select('*')
      .eq('id', client_id)
      .eq('is_active', true)
      .single();

    if (clientError || !client) {
      return new Response(JSON.stringify({ error: 'invalid_client' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get citizen
    const { data: citizen } = await supabase
      .from('citizens')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (action === 'deny') {
      // Log denial
      await supabase.from('oauth_access_logs').insert({
        client_id: client.id,
        user_id: user.id,
        action: 'consent_denied',
        scopes_requested: scopes,
        scopes_granted: [],
        success: false,
      });

      return new Response(JSON.stringify({
        redirect_url: `${redirect_uri}?error=access_denied&error_description=User denied consent${state ? `&state=${state}` : ''}`,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save consent
    await supabase
      .from('oauth_consents')
      .upsert({
        user_id: user.id,
        citizen_id: citizen?.id,
        client_id: client.id,
        scopes,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      }, {
        onConflict: 'user_id,client_id',
      });

    // Generate authorization code
    const { data: authCode, error: codeError } = await supabase
      .from('oauth_authorization_codes')
      .insert({
        client_id: client.id,
        user_id: user.id,
        citizen_id: citizen?.id,
        redirect_uri,
        scopes,
        code_challenge,
        code_challenge_method,
      })
      .select('code')
      .single();

    if (codeError) {
      throw codeError;
    }

    // Log success
    await supabase.from('oauth_access_logs').insert({
      client_id: client.id,
      user_id: user.id,
      action: 'consent_granted',
      scopes_requested: scopes,
      scopes_granted: scopes,
      success: true,
    });

    return new Response(JSON.stringify({
      redirect_url: `${redirect_uri}?code=${authCode.code}${state ? `&state=${state}` : ''}`,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OAuth consent error:', error);
    return new Response(JSON.stringify({ error: 'server_error', error_description: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
