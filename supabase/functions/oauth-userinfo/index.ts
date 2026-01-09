import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'invalid_token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer' },
      });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Validate access token
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_access_tokens')
      .select('*, oauth_clients(*)')
      .eq('token', accessToken)
      .is('revoked_at', null)
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: 'invalid_token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer error="invalid_token"' },
      });
    }

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'invalid_token', error_description: 'Token expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer error="invalid_token"' },
      });
    }

    const scopes = tokenData.scopes as string[];

    // Build userinfo response based on scopes
    const userinfo: Record<string, unknown> = {
      sub: tokenData.user_id,
    };

    // Get citizen data
    const { data: citizen } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', tokenData.citizen_id)
      .single();

    if (citizen) {
      // openid scope - always include sub
      if (scopes.includes('openid')) {
        userinfo.sub = tokenData.user_id;
      }

      // profile scope
      if (scopes.includes('profile')) {
        userinfo.given_name = citizen.first_name;
        userinfo.family_name = citizen.last_name;
        userinfo.name = `${citizen.first_name} ${citizen.last_name}`;
        userinfo.birthdate = citizen.date_of_birth;
        userinfo.gender = citizen.gender;
        userinfo.place_of_birth = citizen.place_of_birth;
        if (citizen.maiden_name) userinfo.maiden_name = citizen.maiden_name;
        if (citizen.father_name) userinfo.father_name = citizen.father_name;
        if (citizen.mother_name) userinfo.mother_name = citizen.mother_name;
      }

      // nip scope
      if (scopes.includes('nip')) {
        userinfo.nip = citizen.nip;
        userinfo.nip_verified = citizen.status === 'active';
      }

      // email scope
      if (scopes.includes('email') && citizen.email) {
        userinfo.email = citizen.email;
        userinfo.email_verified = true;
      }

      // phone scope
      if (scopes.includes('phone') && citizen.phone_number) {
        userinfo.phone_number = citizen.phone_number;
        userinfo.phone_number_verified = true;
      }

      // address scope
      if (scopes.includes('address') && citizen.address) {
        userinfo.address = citizen.address;
      }

      // diplomas scope
      if (scopes.includes('diplomas')) {
        const { data: diplomas } = await supabase
          .from('citizen_diplomas')
          .select('diploma_type, title, institution, issue_date, verification_status')
          .eq('citizen_id', citizen.id)
          .eq('verification_status', 'verified');

        userinfo.diplomas = diplomas || [];
      }

      // documents scope
      if (scopes.includes('documents')) {
        const { data: documents } = await supabase
          .from('identity_documents')
          .select('document_type, document_number, issue_date, expiry_date, status')
          .eq('citizen_id', citizen.id)
          .eq('status', 'active');

        userinfo.identity_documents = documents || [];
      }

      // biometrics scope
      if (scopes.includes('biometrics')) {
        const { data: biometricDoc } = await supabase
          .from('identity_documents')
          .select('biometric_data, file_url')
          .eq('citizen_id', citizen.id)
          .eq('document_type', 'cni')
          .eq('status', 'active')
          .single();

        if (biometricDoc) {
          userinfo.picture = biometricDoc.file_url;
          userinfo.biometric_data = {
            photo_available: !!biometricDoc.file_url,
            fingerprint_registered: !!biometricDoc.biometric_data,
          };
        }
      }

      // verify scope - just confirms identity without details
      if (scopes.includes('verify')) {
        userinfo.identity_verified = citizen.status === 'active';
        userinfo.verification_level = citizen.status === 'active' ? 'high' : 'none';
      }
    }

    // Log access
    await supabase.from('oauth_access_logs').insert({
      client_id: tokenData.client_id,
      user_id: tokenData.user_id,
      action: 'userinfo_access',
      scopes_granted: scopes,
      success: true,
    });

    return new Response(JSON.stringify(userinfo), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OAuth userinfo error:', error);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
