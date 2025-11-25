-- ============================================
-- IDN.GA - Partie 2: Tables principales
-- ============================================

-- Table des citoyens (informations personnelles)
CREATE TABLE IF NOT EXISTS public.citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  nip TEXT UNIQUE NOT NULL, -- Numéro d'Identification Personnelle (format: GA-XXXX-XXXX-XXXX)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  maiden_name TEXT,
  date_of_birth DATE NOT NULL,
  place_of_birth TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  
  -- Informations de contact
  email TEXT,
  phone_number TEXT,
  address JSONB, -- {street, city, province, postal_code}
  
  -- Informations parentales
  father_name TEXT,
  mother_name TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased', 'suspended'))
);

-- Table des documents d'identité
CREATE TABLE IF NOT EXISTS public.identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  
  -- Type et informations du document
  document_type TEXT NOT NULL CHECK (document_type IN ('cni', 'passport', 'birth_certificate', 'driving_license')),
  document_number TEXT UNIQUE NOT NULL,
  
  -- Dates de validité
  issue_date DATE NOT NULL,
  expiry_date DATE,
  
  -- Lieu d'émission
  issuing_authority TEXT NOT NULL,
  issuing_location TEXT NOT NULL,
  
  -- Fichier numérique
  file_path TEXT,
  file_url TEXT,
  
  -- Statut et sécurité
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'suspended', 'lost', 'stolen')),
  security_features JSONB, -- {hologram: true, chip: true, biometric: true, qr_code: 'xxx'}
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Validation biométrique
  biometric_data JSONB -- {fingerprint_hash: 'xxx', photo_hash: 'xxx'}
);

-- Table des demandes de documents
CREATE TABLE IF NOT EXISTS public.document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  
  -- Type de demande
  request_type TEXT NOT NULL CHECK (request_type IN ('new', 'renewal', 'replacement', 'correction')),
  document_type TEXT NOT NULL CHECK (document_type IN ('cni', 'passport', 'birth_certificate', 'driving_license')),
  
  -- Raison et détails
  reason TEXT,
  details JSONB, -- {lost_date: 'xxx', police_report: 'xxx', etc.}
  
  -- Documents joints
  supporting_documents JSONB, -- [{name: 'acte_naissance.pdf', path: 'xxx'}, ...]
  
  -- Statut de traitement
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Traitement
  assigned_to UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Dates
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_completion_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des journaux de vérification
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document vérifié
  document_id UUID REFERENCES public.identity_documents(id) ON DELETE SET NULL,
  document_number TEXT NOT NULL,
  document_type TEXT NOT NULL,
  
  -- Qui a vérifié
  verified_by UUID REFERENCES auth.users(id),
  verifier_organization TEXT,
  
  -- Résultat de la vérification
  verification_result TEXT NOT NULL CHECK (verification_result IN ('valid', 'invalid', 'expired', 'suspicious', 'revoked')),
  verification_method TEXT NOT NULL CHECK (verification_method IN ('manual', 'qr_scan', 'biometric', 'api', 'nfc')),
  
  -- Détails
  notes TEXT,
  metadata JSONB, -- {ip_address: 'xxx', device: 'xxx', location: 'xxx'}
  
  -- Date
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_citizens_nip ON public.citizens(nip);
CREATE INDEX IF NOT EXISTS idx_citizens_user_id ON public.citizens(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_documents_citizen_id ON public.identity_documents(citizen_id);
CREATE INDEX IF NOT EXISTS idx_identity_documents_number ON public.identity_documents(document_number);
CREATE INDEX IF NOT EXISTS idx_identity_documents_status ON public.identity_documents(status);
CREATE INDEX IF NOT EXISTS idx_document_requests_citizen_id ON public.document_requests(citizen_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_status ON public.document_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_logs_document_id ON public.verification_logs(document_id);

-- Trigger pour update updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_citizens_updated_at BEFORE UPDATE ON public.citizens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_identity_documents_updated_at BEFORE UPDATE ON public.identity_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_requests_updated_at BEFORE UPDATE ON public.document_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour citizens
CREATE POLICY "Citizens can view their own data"
  ON public.citizens FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Identity controllers can view all citizens"
  ON public.citizens FOR SELECT
  USING (has_role(auth.uid(), 'identity_controller') OR has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Identity controllers can manage citizens"
  ON public.citizens FOR ALL
  USING (has_role(auth.uid(), 'identity_controller') OR has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));

-- Policies pour identity_documents
CREATE POLICY "Citizens can view their own documents"
  ON public.identity_documents FOR SELECT
  USING (citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));

CREATE POLICY "Identity controllers can view all documents"
  ON public.identity_documents FOR SELECT
  USING (has_role(auth.uid(), 'identity_controller') OR has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Identity controllers can manage documents"
  ON public.identity_documents FOR ALL
  USING (has_role(auth.uid(), 'identity_controller') OR has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));

-- Policies pour document_requests
CREATE POLICY "Citizens can view their own requests"
  ON public.document_requests FOR SELECT
  USING (citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));

CREATE POLICY "Citizens can create requests"
  ON public.document_requests FOR INSERT
  WITH CHECK (citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));

CREATE POLICY "Identity controllers can view all requests"
  ON public.document_requests FOR SELECT
  USING (has_role(auth.uid(), 'identity_controller') OR has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Identity controllers can manage requests"
  ON public.document_requests FOR ALL
  USING (has_role(auth.uid(), 'identity_controller') OR has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));

-- Policies pour verification_logs
CREATE POLICY "Identity controllers can view logs"
  ON public.verification_logs FOR SELECT
  USING (has_role(auth.uid(), 'identity_controller') OR has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Identity controllers can create logs"
  ON public.verification_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'identity_controller') OR has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));

-- System admins can view all logs
CREATE POLICY "System admins can view all logs"
  ON public.verification_logs FOR SELECT
  USING (has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'admin'));