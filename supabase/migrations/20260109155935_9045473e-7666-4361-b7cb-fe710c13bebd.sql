-- =====================================================
-- IDN.GA OAuth 2.0 / OpenID Connect Provider Tables
-- =====================================================

-- Table des applications tierces (clients OAuth)
CREATE TABLE public.oauth_clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id VARCHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    client_secret VARCHAR(128) NOT NULL DEFAULT encode(gen_random_bytes(64), 'hex'),
    client_name VARCHAR(255) NOT NULL,
    client_description TEXT,
    client_logo_url TEXT,
    client_website VARCHAR(512),
    redirect_uris TEXT[] NOT NULL DEFAULT '{}',
    allowed_scopes TEXT[] NOT NULL DEFAULT ARRAY['openid', 'profile'],
    grant_types TEXT[] NOT NULL DEFAULT ARRAY['authorization_code'],
    is_confidential BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des codes d'autorisation temporaires
CREATE TABLE public.oauth_authorization_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(128) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(64), 'hex'),
    client_id UUID NOT NULL REFERENCES public.oauth_clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES public.citizens(id),
    redirect_uri TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    code_challenge VARCHAR(128),
    code_challenge_method VARCHAR(10),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des tokens d'accès
CREATE TABLE public.oauth_access_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    token VARCHAR(256) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(64), 'hex'),
    client_id UUID NOT NULL REFERENCES public.oauth_clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES public.citizens(id),
    scopes TEXT[] NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des refresh tokens
CREATE TABLE public.oauth_refresh_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    token VARCHAR(256) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(64), 'hex'),
    access_token_id UUID NOT NULL REFERENCES public.oauth_access_tokens(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.oauth_clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des consentements utilisateur (permissions accordées)
CREATE TABLE public.oauth_consents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES public.citizens(id),
    client_id UUID NOT NULL REFERENCES public.oauth_clients(id) ON DELETE CASCADE,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    UNIQUE(user_id, client_id)
);

-- Table des diplômes et certifications (pour le scope 'diplomes')
CREATE TABLE public.citizen_diplomas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
    diploma_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    diploma_number VARCHAR(100),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    verification_hash VARCHAR(256),
    metadata JSONB DEFAULT '{}',
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des logs d'accès OAuth (audit)
CREATE TABLE public.oauth_access_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.oauth_clients(id),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL,
    scopes_requested TEXT[],
    scopes_granted TEXT[],
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Définition des scopes disponibles
CREATE TABLE public.oauth_scope_definitions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    scope_name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    requires_verification BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0
);

-- Insérer les scopes disponibles
INSERT INTO public.oauth_scope_definitions (scope_name, display_name, description, category, is_sensitive, requires_verification, sort_order) VALUES
('openid', 'Identifiant unique', 'Accès à votre identifiant IDN.GA', 'identity', false, false, 1),
('profile', 'Profil de base', 'Nom, prénom, date de naissance', 'identity', false, false, 2),
('nip', 'Numéro NIP', 'Votre Numéro d''Identification Personnel', 'identity', false, false, 3),
('email', 'Adresse email', 'Votre adresse email vérifiée', 'contact', false, false, 4),
('phone', 'Numéro de téléphone', 'Votre numéro de téléphone mobile', 'contact', false, false, 5),
('address', 'Adresse complète', 'Votre adresse de résidence', 'contact', true, false, 6),
('diplomas', 'Diplômes et certifications', 'Vos diplômes et qualifications vérifiés', 'documents', true, true, 7),
('documents', 'Documents officiels', 'Accès à vos documents d''identité', 'documents', true, true, 8),
('biometrics', 'Données biométriques', 'Photo d''identité et signature', 'security', true, true, 9),
('verify', 'Vérification d''identité', 'Confirmer votre identité sans partager les détails', 'security', false, false, 10);

-- Enable RLS
ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_diplomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_scope_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- oauth_clients: propriétaires peuvent voir/éditer leurs apps, admins tout
CREATE POLICY "Owners can manage their clients" ON public.oauth_clients
    FOR ALL USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Active clients are readable for auth" ON public.oauth_clients
    FOR SELECT USING (is_active = true);

-- oauth_authorization_codes: uniquement via service role
CREATE POLICY "Service role only for auth codes" ON public.oauth_authorization_codes
    FOR ALL USING (auth.uid() = user_id);

-- oauth_access_tokens: utilisateurs voient leurs tokens
CREATE POLICY "Users can view their tokens" ON public.oauth_access_tokens
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can revoke their tokens" ON public.oauth_access_tokens
    FOR UPDATE USING (user_id = auth.uid());

-- oauth_consents: utilisateurs gèrent leurs consentements
CREATE POLICY "Users manage their consents" ON public.oauth_consents
    FOR ALL USING (user_id = auth.uid());

-- citizen_diplomas: citoyens voient leurs diplômes
CREATE POLICY "Citizens view their diplomas" ON public.citizen_diplomas
    FOR SELECT USING (citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));

-- oauth_scope_definitions: lecture publique
CREATE POLICY "Scopes are publicly readable" ON public.oauth_scope_definitions
    FOR SELECT USING (true);

-- oauth_access_logs: admins et propriétaires
CREATE POLICY "Access logs for admins and owners" ON public.oauth_access_logs
    FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Indexes pour performance
CREATE INDEX idx_oauth_clients_client_id ON public.oauth_clients(client_id);
CREATE INDEX idx_oauth_auth_codes_code ON public.oauth_authorization_codes(code);
CREATE INDEX idx_oauth_auth_codes_expires ON public.oauth_authorization_codes(expires_at);
CREATE INDEX idx_oauth_access_tokens_token ON public.oauth_access_tokens(token);
CREATE INDEX idx_oauth_access_tokens_user ON public.oauth_access_tokens(user_id);
CREATE INDEX idx_oauth_consents_user_client ON public.oauth_consents(user_id, client_id);
CREATE INDEX idx_citizen_diplomas_citizen ON public.citizen_diplomas(citizen_id);

-- Triggers pour updated_at
CREATE TRIGGER update_oauth_clients_updated_at
    BEFORE UPDATE ON public.oauth_clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citizen_diplomas_updated_at
    BEFORE UPDATE ON public.citizen_diplomas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques clients de démonstration
INSERT INTO public.oauth_clients (client_name, client_description, client_logo_url, client_website, redirect_uris, allowed_scopes, is_verified) VALUES
('impots.ga', 'Direction Générale des Impôts - Portail fiscal en ligne', 'https://impots.ga/logo.png', 'https://impots.ga', ARRAY['https://impots.ga/callback', 'https://impots.ga/auth/callback'], ARRAY['openid', 'profile', 'nip', 'address'], true),
('banque-centrale.ga', 'Banque des États de l''Afrique Centrale - Services bancaires', 'https://beac.int/logo.png', 'https://beac.int', ARRAY['https://beac.int/oauth/callback'], ARRAY['openid', 'profile', 'nip', 'documents'], true),
('universite-omar-bongo.ga', 'Université Omar Bongo - Portail étudiant', 'https://uob.ga/logo.png', 'https://uob.ga', ARRAY['https://uob.ga/auth'], ARRAY['openid', 'profile', 'nip', 'email', 'diplomas'], true);

-- Insérer des diplômes de démonstration (liés aux citizens existants)
INSERT INTO public.citizen_diplomas (citizen_id, diploma_type, title, institution, issue_date, verification_status)
SELECT 
    id,
    'baccalaureat',
    'Baccalauréat Série D',
    'Lycée National Léon Mba',
    '2015-07-15',
    'verified'
FROM public.citizens
LIMIT 1;