-- Create vault_documents table for document vault service
CREATE TABLE IF NOT EXISTS public.vault_documents (
    id TEXT PRIMARY KEY DEFAULT 'doc_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'other')),
    file_url TEXT,
    file_size TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create iboite_messages table for messaging service
CREATE TABLE IF NOT EXISTS public.iboite_messages (
    id TEXT PRIMARY KEY DEFAULT 'msg_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'citizen')),
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'citizen')),
    recipient_name TEXT NOT NULL,
    recipient_id TEXT,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    preview TEXT NOT NULL,
    folder TEXT NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'archive')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_starred BOOLEAN NOT NULL DEFAULT false,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create document_vault table for idocument service
CREATE TABLE IF NOT EXISTS public.document_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id TEXT NOT NULL,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'other')),
    file_size BIGINT NOT NULL,
    mime_type TEXT,
    source TEXT NOT NULL DEFAULT 'upload',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'rejected')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_date TIMESTAMPTZ,
    expiration_date DATE,
    side TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iboite_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_vault ENABLE ROW LEVEL SECURITY;

-- RLS policies for vault_documents
CREATE POLICY "Users can view own vault documents"
    ON public.vault_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault documents"
    ON public.vault_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault documents"
    ON public.vault_documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault documents"
    ON public.vault_documents FOR DELETE
    USING (auth.uid() = user_id);

-- RLS policies for iboite_messages
CREATE POLICY "Users can view own messages"
    ON public.iboite_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
    ON public.iboite_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
    ON public.iboite_messages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
    ON public.iboite_messages FOR DELETE
    USING (auth.uid() = user_id);

-- RLS policies for document_vault
CREATE POLICY "Users can view own vault entries"
    ON public.document_vault FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault entries"
    ON public.document_vault FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault entries"
    ON public.document_vault FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault entries"
    ON public.document_vault FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vault_documents_user ON public.vault_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_iboite_messages_user ON public.iboite_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_iboite_messages_folder ON public.iboite_messages(user_id, folder);
CREATE INDEX IF NOT EXISTS idx_document_vault_user ON public.document_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_document_vault_folder ON public.document_vault(user_id, folder_id);