CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'president',
    'dgss',
    'dgr',
    'minister',
    'user',
    'cabinet_private',
    'sec_gen',
    'courrier',
    'reception',
    'protocol'
);


--
-- Name: document_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_action AS ENUM (
    'deposited',
    'scanned',
    'opened',
    'transferred',
    'read',
    'classified',
    'archived',
    'confidential_marked'
);


--
-- Name: document_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_status AS ENUM (
    'deposited',
    'scanned_envelope',
    'opened',
    'confidential_routed',
    'read',
    'archived'
);


--
-- Name: document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_type AS ENUM (
    'courrier',
    'file',
    'note'
);


--
-- Name: folder_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.folder_type AS ENUM (
    'system',
    'custom'
);


--
-- Name: mail_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.mail_status AS ENUM (
    'received',
    'scanning',
    'analyzing',
    'pending_validation',
    'validated',
    'distributed',
    'processed',
    'archived'
);


--
-- Name: cleanup_old_messages(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_messages() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_settings JSONB;
    v_max_messages INTEGER;
    v_cleanup_enabled BOOLEAN;
    v_older_than_days INTEGER;
    v_temp_count INTEGER;
BEGIN
    -- Get cleanup settings
    SELECT setting_value INTO v_settings
    FROM system_settings
    WHERE setting_key = 'storage_limits';
    
    IF v_settings IS NULL THEN
        RETURN 0;
    END IF;
    
    v_cleanup_enabled := (v_settings->>'auto_cleanup_enabled')::boolean;
    
    IF NOT v_cleanup_enabled THEN
        RETURN 0;
    END IF;
    
    v_max_messages := (v_settings->>'max_conversation_messages')::integer;
    v_older_than_days := (v_settings->>'cleanup_older_than_days')::integer;
    
    -- Mark messages as deleted if they exceed the limit per session
    WITH ranked_messages AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC) as rn
        FROM conversation_messages
        WHERE is_deleted = false
    )
    UPDATE conversation_messages cm
    SET is_deleted = true
    FROM ranked_messages rm
    WHERE cm.id = rm.id
      AND rm.rn > v_max_messages;
    
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_deleted_count := v_temp_count;
    
    -- Also delete messages older than configured days
    UPDATE conversation_messages
    SET is_deleted = true
    WHERE created_at < NOW() - make_interval(days => v_older_than_days)
      AND is_deleted = false;
    
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_deleted_count := v_deleted_count + v_temp_count;
    
    RETURN v_deleted_count;
END;
$$;


--
-- Name: handle_new_user_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_profile() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_president(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_president(user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.has_role(user_id, 'president'::app_role)
$$;


--
-- Name: log_audit_event(uuid, text, text, jsonb, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_audit_event(p_user_id uuid, p_action text, p_resource text, p_details jsonb DEFAULT '{}'::jsonb, p_ip_address text DEFAULT NULL::text, p_severity text DEFAULT 'info'::text, p_success boolean DEFAULT true) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        resource,
        details,
        ip_address,
        severity,
        success
    ) VALUES (
        p_user_id,
        p_action,
        p_resource,
        p_details,
        p_ip_address,
        p_severity,
        p_success
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;


--
-- Name: query_intelligence(public.vector, double precision, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.query_intelligence(query_embedding public.vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 5) RETURNS TABLE(id uuid, content text, summary text, category text, sentiment text, entities jsonb, author text, published_at timestamp with time zone, similarity double precision)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    intelligence_items.id,
    intelligence_items.content,
    intelligence_items.summary,
    intelligence_items.category,
    intelligence_items.sentiment,
    intelligence_items.entities,
    intelligence_items.author,
    intelligence_items.published_at,
    1 - (intelligence_items.embedding <=> query_embedding) as similarity
  FROM intelligence_items
  WHERE intelligence_items.embedding IS NOT NULL
    AND 1 - (intelligence_items.embedding <=> query_embedding) > match_threshold
  ORDER BY intelligence_items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


--
-- Name: trigger_process_intelligence(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_process_intelligence() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
    edge_function_url TEXT;
    payload JSONB;
    request_id BIGINT;
BEGIN
    -- URL de l'Edge Function
    edge_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/process-intelligence';
    
    -- Si pas de setting, utiliser l'URL par défaut
    IF edge_function_url IS NULL OR edge_function_url = '/functions/v1/process-intelligence' THEN
        edge_function_url := 'https://sfsoqoeunivgorrgioap.supabase.co/functions/v1/process-intelligence';
    END IF;
    
    -- Construire le payload avec le record inséré
    payload := jsonb_build_object(
        'record', jsonb_build_object(
            'id', NEW.id,
            'content', NEW.content,
            'author', NEW.author,
            'source_id', NEW.source_id,
            'published_at', NEW.published_at
        )
    );
    
    -- Créer un log d'entrée
    INSERT INTO intelligence_processing_logs (item_id, status)
    VALUES (NEW.id, 'pending');
    
    -- Appeler l'Edge Function de manière asynchrone via pg_net
    SELECT INTO request_id extensions.http_post(
        url := edge_function_url,
        body := payload::text,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || coalesce(
                current_setting('app.settings.service_role_key', true),
                current_setting('request.jwt.claim.sub', true)
            )
        )::jsonb
    );
    
    -- Log pour debugging
    RAISE LOG 'Intelligence item % sent for processing (request_id: %)', NEW.id, request_id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Logger l'erreur mais ne pas bloquer l'insertion
        RAISE WARNING 'Failed to trigger intelligence processing for %: %', NEW.id, SQLERRM;
        
        -- Mettre à jour le log avec l'erreur
        UPDATE intelligence_processing_logs 
        SET status = 'error', 
            error_message = SQLERRM,
            completed_at = NOW()
        WHERE item_id = NEW.id;
        
        RETURN NEW;
END;
$$;


--
-- Name: update_iasted_config_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_iasted_config_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_intelligence_scraping_config_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_intelligence_scraping_config_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_intelligence_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_intelligence_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: administrative_archives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administrative_archives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    reference_code text NOT NULL,
    archiving_date timestamp with time zone DEFAULT now() NOT NULL,
    access_level text DEFAULT 'public'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT administrative_archives_access_level_check CHECK ((access_level = ANY (ARRAY['public'::text, 'restricted'::text, 'confidential'::text, 'secret'::text])))
);


--
-- Name: analytics_voice_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_voice_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid,
    user_id uuid NOT NULL,
    event_type text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    action text NOT NULL,
    resource text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now(),
    severity text DEFAULT 'info'::text,
    success boolean DEFAULT true,
    duration_ms integer,
    user_agent text,
    CONSTRAINT audit_logs_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'error'::text, 'critical'::text])))
);


--
-- Name: budget_national; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_national (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    year integer NOT NULL,
    total_budget bigint NOT NULL,
    executed_amount bigint DEFAULT 0,
    ministry_allocations jsonb DEFAULT '[]'::jsonb,
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: chantiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chantiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    location text,
    status text DEFAULT 'planned'::text,
    progress integer DEFAULT 0,
    budget bigint,
    start_date date,
    end_date date,
    ministry text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chantiers_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT chantiers_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'in_progress'::text, 'completed'::text, 'suspended'::text])))
);


--
-- Name: conseil_ministres_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conseil_ministres_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    "time" time without time zone,
    location text DEFAULT 'Palais Rénovation'::text,
    status text DEFAULT 'scheduled'::text,
    agenda_summary text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT conseil_ministres_sessions_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: conversation_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    audio_url text,
    tokens integer,
    latency_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_deleted boolean DEFAULT false,
    CONSTRAINT conversation_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'router'::text, 'tool'::text])))
);


--
-- Name: conversation_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    memory_summary text,
    focus_mode text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    session_name text DEFAULT 'Nouvelle conversation'::text,
    is_archived boolean DEFAULT false,
    last_message_at timestamp with time zone,
    message_count integer DEFAULT 0
);


--
-- Name: council_preparations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.council_preparations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_date timestamp with time zone NOT NULL,
    agenda_items text[] DEFAULT ARRAY[]::text[] NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    documents_url text[] DEFAULT ARRAY[]::text[],
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT council_preparations_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'finalized'::text, 'archived'::text])))
);


--
-- Name: decret_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decret_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    decret_id uuid,
    user_id uuid NOT NULL,
    user_name text,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: decret_signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decret_signatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    decret_id uuid,
    signed_by uuid NOT NULL,
    signed_by_name text,
    signed_at timestamp with time zone DEFAULT now(),
    signature_type text DEFAULT 'approval'::text,
    CONSTRAINT decret_signatures_signature_type_check CHECK ((signature_type = ANY (ARRAY['approval'::text, 'review'::text, 'countersign'::text])))
);


--
-- Name: decrets_ordonnances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decrets_ordonnances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference_number text NOT NULL,
    title text NOT NULL,
    type text DEFAULT 'decree'::text,
    status text DEFAULT 'draft'::text,
    content text,
    ministry text,
    created_by uuid,
    signature_date timestamp with time zone,
    publication_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT decrets_ordonnances_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending_review'::text, 'pending_signature'::text, 'signed'::text, 'published'::text]))),
    CONSTRAINT decrets_ordonnances_type_check CHECK ((type = ANY (ARRAY['decree'::text, 'order'::text, 'decision'::text, 'circular'::text])))
);


--
-- Name: doc_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doc_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_folder_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_folder_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    folder_id uuid NOT NULL,
    document_id uuid NOT NULL,
    added_at timestamp with time zone DEFAULT now()
);


--
-- Name: document_folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    folder_type public.folder_type DEFAULT 'custom'::public.folder_type,
    service_role text,
    created_by uuid,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    icon text
);


--
-- Name: document_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    action public.document_action NOT NULL,
    performed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    structure jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_number text DEFAULT ((('DOC-'::text || to_char(now(), 'YYYY'::text)) || '-'::text) || lpad((nextval('public.doc_number_seq'::regclass))::text, 5, '0'::text)) NOT NULL,
    title text,
    document_type public.document_type DEFAULT 'courrier'::public.document_type,
    status public.document_status DEFAULT 'deposited'::public.document_status,
    is_confidential boolean DEFAULT false,
    sender_name text,
    sender_organization text,
    current_holder_service text,
    user_id uuid,
    filename text,
    file_path text,
    file_type text,
    file_size bigint,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deposited_at timestamp with time zone,
    envelope_scan_urls text[],
    content_scan_urls text[]
);


--
-- Name: encrypted_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encrypted_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    security_level text DEFAULT 'standard'::text NOT NULL,
    is_read boolean DEFAULT false,
    encryption_key text,
    created_at timestamp with time zone DEFAULT now(),
    sender_name text
);


--
-- Name: generated_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generated_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    document_name text NOT NULL,
    document_type text NOT NULL,
    template_used text,
    file_path text NOT NULL,
    file_size bigint,
    storage_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: guest_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    name text NOT NULL,
    title text,
    organization text,
    status text DEFAULT 'invited'::text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT guest_lists_category_check CHECK ((category = ANY (ARRAY['vip'::text, 'press'::text, 'staff'::text, 'general'::text]))),
    CONSTRAINT guest_lists_status_check CHECK ((status = ANY (ARRAY['invited'::text, 'confirmed'::text, 'declined'::text, 'attended'::text])))
);


--
-- Name: iasted_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iasted_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id text,
    agent_name text DEFAULT 'iAsted'::text,
    president_voice_id text DEFAULT '9BWtsMINqrJLrRacOk9x'::text,
    minister_voice_id text DEFAULT 'EXAVITQu4vr4xnSDxMaL'::text,
    default_voice_id text DEFAULT 'Xb7hH8MSUJpSbSDYk0k2'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: incoming_mails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incoming_mails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference_number text NOT NULL,
    sender text NOT NULL,
    subject text NOT NULL,
    received_date timestamp with time zone DEFAULT now() NOT NULL,
    type text DEFAULT 'lettre'::text NOT NULL,
    urgency text DEFAULT 'normale'::text NOT NULL,
    status text DEFAULT 'recu'::text NOT NULL,
    assigned_to text,
    digital_copy_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT incoming_mails_status_check CHECK ((status = ANY (ARRAY['recu'::text, 'en_traitement'::text, 'distribue'::text, 'archive'::text]))),
    CONSTRAINT incoming_mails_type_check CHECK ((type = ANY (ARRAY['lettre'::text, 'colis'::text, 'facture'::text, 'invitation'::text, 'autre'::text]))),
    CONSTRAINT incoming_mails_urgency_check CHECK ((urgency = ANY (ARRAY['faible'::text, 'normale'::text, 'haute'::text, 'urgente'::text])))
);


--
-- Name: institution_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institution_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    institution_name text NOT NULL,
    ministere text,
    taux_resolution numeric(5,2),
    cas_traites integer DEFAULT 0,
    score_performance integer,
    periode_debut date,
    periode_fin date,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT institution_performance_score_performance_check CHECK (((score_performance >= 0) AND (score_performance <= 100)))
);


--
-- Name: intelligence_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intelligence_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_id uuid,
    external_id text,
    content text NOT NULL,
    summary text,
    category text,
    sentiment text,
    entities jsonb DEFAULT '[]'::jsonb,
    author text,
    published_at timestamp with time zone DEFAULT now(),
    embedding public.vector(1536),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT intelligence_items_category_check CHECK ((category = ANY (ARRAY['securite'::text, 'economie'::text, 'social'::text, 'politique'::text, 'rumeur'::text, 'autre'::text]))),
    CONSTRAINT intelligence_items_sentiment_check CHECK ((sentiment = ANY (ARRAY['positif'::text, 'negatif'::text, 'neutre'::text, 'colere'::text, 'peur'::text, 'joie'::text])))
);


--
-- Name: intelligence_processing_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intelligence_processing_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    error_message text,
    processing_time_ms integer
);


--
-- Name: intelligence_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intelligence_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    source text NOT NULL,
    classification text DEFAULT 'confidential'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT intelligence_reports_classification_check CHECK ((classification = ANY (ARRAY['secret'::text, 'top_secret'::text, 'confidential'::text, 'restricted'::text]))),
    CONSTRAINT intelligence_reports_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'reviewed'::text, 'archived'::text])))
);


--
-- Name: intelligence_scraping_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intelligence_scraping_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enabled boolean DEFAULT true,
    frequency_hours integer DEFAULT 72,
    next_run_at timestamp with time zone DEFAULT now(),
    last_run_at timestamp with time zone,
    social_networks jsonb DEFAULT '{"x": true, "tiktok": true, "youtube": true, "facebook": true}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: intelligence_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intelligence_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    last_crawled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT intelligence_sources_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'error'::text]))),
    CONSTRAINT intelligence_sources_type_check CHECK ((type = ANY (ARRAY['rss'::text, 'web'::text, 'social'::text, 'api'::text])))
);


--
-- Name: interministerial_coordination; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interministerial_coordination (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject text NOT NULL,
    ministries_involved text[] DEFAULT ARRAY[]::text[] NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    meeting_date timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT interministerial_coordination_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'ongoing'::text, 'completed'::text])))
);


--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_base (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text,
    tags text[] DEFAULT ARRAY[]::text[],
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    file_path text,
    file_type text,
    status text DEFAULT 'ready'::text,
    access_level text[] DEFAULT ARRAY['admin'::text]
);


--
-- Name: legal_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_title text NOT NULL,
    requestor text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    assigned_to text,
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT legal_reviews_priority_check CHECK ((priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text]))),
    CONSTRAINT legal_reviews_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_review'::text, 'completed'::text])))
);


--
-- Name: mail_ai_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_ai_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mail_id uuid NOT NULL,
    summary text,
    urgency text,
    confidentiality_level text,
    suggested_routing text,
    key_points jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mail_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mail_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_type text,
    file_size bigint,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mail_routing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_routing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mail_id uuid NOT NULL,
    from_service text,
    to_service text NOT NULL,
    routed_by uuid,
    routed_at timestamp with time zone DEFAULT now(),
    notes text
);


--
-- Name: mail_tracking_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mail_tracking_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tracking_number text DEFAULT ((('GA-'::text || to_char(now(), 'YYYY'::text)) || '-'::text) || lpad((nextval('public.mail_tracking_seq'::regclass))::text, 5, '0'::text)) NOT NULL,
    sender_name text,
    sender_organization text,
    reception_date timestamp with time zone DEFAULT now(),
    status public.mail_status DEFAULT 'received'::public.mail_status,
    subject text,
    content text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    envelope_scan_urls text[],
    content_scan_urls text[],
    deposited_at timestamp with time zone,
    current_holder_service text,
    user_id uuid
);


--
-- Name: ministerial_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ministerial_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ministry text NOT NULL,
    project_name text NOT NULL,
    status text DEFAULT 'en_cours'::text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    deadline timestamp with time zone NOT NULL,
    priority text DEFAULT 'moyenne'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ministerial_projects_priority_check CHECK ((priority = ANY (ARRAY['haute'::text, 'moyenne'::text, 'basse'::text]))),
    CONSTRAINT ministerial_projects_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT ministerial_projects_status_check CHECK ((status = ANY (ARRAY['en_cours'::text, 'termine'::text, 'bloque'::text])))
);


--
-- Name: national_kpis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.national_kpis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    signalements_totaux integer DEFAULT 0,
    cas_critiques integer DEFAULT 0,
    taux_resolution numeric(5,2) DEFAULT 0,
    fonds_recuperes_fcfa bigint DEFAULT 0,
    indice_transparence integer,
    satisfaction_publique numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT national_kpis_indice_transparence_check CHECK (((indice_transparence >= 0) AND (indice_transparence <= 100)))
);


--
-- Name: nominations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nominations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    candidate_name text NOT NULL,
    poste text NOT NULL,
    ministere text NOT NULL,
    candidate_info jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text,
    decided_at timestamp with time zone,
    decided_by uuid,
    decision_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT nominations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: official_decrees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.official_decrees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    reference_number text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    signature_date timestamp with time zone,
    publication_date timestamp with time zone,
    type text DEFAULT 'decree'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT official_decrees_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending_signature'::text, 'signed'::text, 'published'::text]))),
    CONSTRAINT official_decrees_type_check CHECK ((type = ANY (ARRAY['decree'::text, 'order'::text, 'decision'::text, 'circular'::text])))
);


--
-- Name: official_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.official_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    date timestamp with time zone NOT NULL,
    location text NOT NULL,
    type text DEFAULT 'ceremony'::text NOT NULL,
    status text DEFAULT 'upcoming'::text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT official_events_status_check CHECK ((status = ANY (ARRAY['upcoming'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT official_events_type_check CHECK ((type = ANY (ARRAY['ceremony'::text, 'meeting'::text, 'visit'::text, 'gala'::text])))
);


--
-- Name: opinion_publique; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.opinion_publique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    satisfaction_globale numeric(5,2),
    sentiment_satisfaits numeric(5,2),
    sentiment_neutres numeric(5,2),
    sentiment_insatisfaits numeric(5,2),
    preoccupations jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ordre_du_jour; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ordre_du_jour (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid,
    title text NOT NULL,
    ministry text,
    presenter text,
    status text DEFAULT 'proposed'::text,
    order_index integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ordre_du_jour_status_check CHECK ((status = ANY (ARRAY['proposed'::text, 'approved'::text, 'discussed'::text, 'deferred'::text])))
);


--
-- Name: personal_correspondence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_correspondence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    sender_name text NOT NULL,
    sender_organization text,
    subject text NOT NULL,
    content text,
    received_date timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    type text DEFAULT 'letter'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: presidential_decisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.presidential_decisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    signalement_id uuid,
    decision_type text NOT NULL,
    motif text,
    decision_data jsonb DEFAULT '{}'::jsonb,
    president_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT presidential_decisions_decision_type_check CHECK ((decision_type = ANY (ARRAY['approuver_enquete'::text, 'ordonner_investigation'::text, 'protocole_xr7'::text, 'consulter_dossier'::text]))),
    CONSTRAINT presidential_decisions_president_user_id_check CHECK (public.is_president(president_user_id))
);


--
-- Name: presidential_instructions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.presidential_instructions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instruction text NOT NULL,
    assigned_to text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    due_date timestamp with time zone NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT presidential_instructions_priority_check CHECK ((priority = ANY (ARRAY['critical'::text, 'high'::text, 'normal'::text]))),
    CONSTRAINT presidential_instructions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text])))
);


--
-- Name: private_audiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.private_audiences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_by uuid NOT NULL,
    date timestamp with time zone NOT NULL,
    person_name text NOT NULL,
    person_title text,
    subject text NOT NULL,
    location text,
    notes text,
    status text DEFAULT 'scheduled'::text NOT NULL,
    confidentiality_level text DEFAULT 'confidentiel'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: private_trips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.private_trips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    destination text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    purpose text NOT NULL,
    type text DEFAULT 'official'::text NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: projets_etat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projets_etat (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    sector text,
    status text DEFAULT 'planned'::text,
    progress integer DEFAULT 0,
    budget bigint,
    funding_source text,
    responsible_entity text,
    start_date date,
    completion_date date,
    impact_score integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT projets_etat_impact_score_check CHECK (((impact_score >= 0) AND (impact_score <= 100))),
    CONSTRAINT projets_etat_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT projets_etat_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'in_progress'::text, 'completed'::text, 'suspended'::text, 'cancelled'::text])))
);


--
-- Name: projets_presidentiels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projets_presidentiels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    priority text DEFAULT 'medium'::text,
    status text DEFAULT 'proposed'::text,
    progress integer DEFAULT 0,
    budget bigint,
    responsible_ministry text,
    start_date date,
    target_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT projets_presidentiels_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT projets_presidentiels_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT projets_presidentiels_status_check CHECK ((status = ANY (ARRAY['proposed'::text, 'approved'::text, 'in_progress'::text, 'completed'::text, 'suspended'::text])))
);


--
-- Name: protocol_procedures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.protocol_procedures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'ceremonial'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT protocol_procedures_category_check CHECK ((category = ANY (ARRAY['ceremonial'::text, 'diplomatic'::text, 'security'::text, 'logistics'::text])))
);


--
-- Name: role_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_email text NOT NULL,
    role_name text NOT NULL,
    role_description text NOT NULL,
    work_description text NOT NULL,
    implementation_suggestions text,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    document_paths text[] DEFAULT ARRAY[]::text[],
    CONSTRAINT role_feedback_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'implemented'::text])))
);


--
-- Name: service_document_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_document_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_role text NOT NULL,
    header_text text,
    sub_header_text text,
    footer_text text,
    logo_url text,
    margins jsonb DEFAULT '{"top": 20, "left": 20, "right": 20, "bottom": 20}'::jsonb,
    primary_color text DEFAULT '#000000'::text,
    secondary_color text DEFAULT '#666666'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: signalements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signalements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    titre text NOT NULL,
    description text,
    categorie text NOT NULL,
    montant_fcfa bigint,
    province text,
    secteur text,
    implique_haut_fonctionnaire boolean DEFAULT false,
    grade_fonctionnaire text,
    score_priorite_ia integer,
    statut text DEFAULT 'nouveau'::text,
    preuves jsonb DEFAULT '[]'::jsonb,
    temoins jsonb DEFAULT '[]'::jsonb,
    analyse_ia text,
    recommandation_ia text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT signalements_score_priorite_ia_check CHECK (((score_priorite_ia >= 0) AND (score_priorite_ia <= 100))),
    CONSTRAINT signalements_statut_check CHECK ((statut = ANY (ARRAY['nouveau'::text, 'en_enquete'::text, 'resolu'::text, 'classe'::text, 'priorite_zero'::text])))
);


--
-- Name: surveillance_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.surveillance_targets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'individual'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    description text,
    location text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_update timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT surveillance_targets_priority_check CHECK ((priority = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text]))),
    CONSTRAINT surveillance_targets_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'under_review'::text, 'neutralized'::text]))),
    CONSTRAINT surveillance_targets_type_check CHECK ((type = ANY (ARRAY['individual'::text, 'organization'::text, 'location'::text, 'cyber'::text])))
);


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb DEFAULT '{}'::jsonb NOT NULL,
    setting_type text DEFAULT 'general'::text NOT NULL,
    description text,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid
);


--
-- Name: threat_indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threat_indicators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    level text DEFAULT 'guarded'::text NOT NULL,
    description text NOT NULL,
    location text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT threat_indicators_level_check CHECK ((level = ANY (ARRAY['critical'::text, 'high'::text, 'elevated'::text, 'guarded'::text, 'low'::text]))),
    CONSTRAINT threat_indicators_type_check CHECK ((type = ANY (ARRAY['terrorism'::text, 'espionage'::text, 'cyber'::text, 'civil_unrest'::text, 'economic'::text])))
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    user_id uuid NOT NULL,
    voice_id text DEFAULT 'EXAVITQu4vr4xnSDxMaL'::text,
    voice_silence_duration integer DEFAULT 2000,
    voice_silence_threshold integer DEFAULT 10,
    voice_continuous_mode boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    voice_push_to_talk boolean DEFAULT false
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    gender text DEFAULT 'male'::text,
    preferred_title text,
    full_name text,
    tone_preference text DEFAULT 'professional'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_profiles_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text]))),
    CONSTRAINT user_profiles_tone_preference_check CHECK ((tone_preference = ANY (ARRAY['formal'::text, 'professional'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: vip_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vip_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    title text,
    organization text,
    category text DEFAULT 'diplomatic'::text NOT NULL,
    phone text,
    email text,
    address text,
    notes text,
    last_contact_date date,
    is_favorite boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: voice_presets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    voice_id text NOT NULL,
    voice_silence_duration integer DEFAULT 2000,
    voice_silence_threshold integer DEFAULT 10,
    voice_continuous_mode boolean DEFAULT false,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: administrative_archives administrative_archives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrative_archives
    ADD CONSTRAINT administrative_archives_pkey PRIMARY KEY (id);


--
-- Name: administrative_archives administrative_archives_reference_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrative_archives
    ADD CONSTRAINT administrative_archives_reference_code_key UNIQUE (reference_code);


--
-- Name: analytics_voice_events analytics_voice_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_voice_events
    ADD CONSTRAINT analytics_voice_events_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: budget_national budget_national_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_national
    ADD CONSTRAINT budget_national_pkey PRIMARY KEY (id);


--
-- Name: chantiers chantiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chantiers
    ADD CONSTRAINT chantiers_pkey PRIMARY KEY (id);


--
-- Name: conseil_ministres_sessions conseil_ministres_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conseil_ministres_sessions
    ADD CONSTRAINT conseil_ministres_sessions_pkey PRIMARY KEY (id);


--
-- Name: conversation_messages conversation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);


--
-- Name: conversation_sessions conversation_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_sessions
    ADD CONSTRAINT conversation_sessions_pkey PRIMARY KEY (id);


--
-- Name: council_preparations council_preparations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.council_preparations
    ADD CONSTRAINT council_preparations_pkey PRIMARY KEY (id);


--
-- Name: decret_comments decret_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decret_comments
    ADD CONSTRAINT decret_comments_pkey PRIMARY KEY (id);


--
-- Name: decret_signatures decret_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decret_signatures
    ADD CONSTRAINT decret_signatures_pkey PRIMARY KEY (id);


--
-- Name: decrets_ordonnances decrets_ordonnances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decrets_ordonnances
    ADD CONSTRAINT decrets_ordonnances_pkey PRIMARY KEY (id);


--
-- Name: decrets_ordonnances decrets_ordonnances_reference_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decrets_ordonnances
    ADD CONSTRAINT decrets_ordonnances_reference_number_key UNIQUE (reference_number);


--
-- Name: document_folder_items document_folder_items_folder_id_document_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folder_items
    ADD CONSTRAINT document_folder_items_folder_id_document_id_key UNIQUE (folder_id, document_id);


--
-- Name: document_folder_items document_folder_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folder_items
    ADD CONSTRAINT document_folder_items_pkey PRIMARY KEY (id);


--
-- Name: document_folders document_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folders
    ADD CONSTRAINT document_folders_pkey PRIMARY KEY (id);


--
-- Name: document_history document_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_history
    ADD CONSTRAINT document_history_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: documents documents_document_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_number_key UNIQUE (document_number);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: encrypted_messages encrypted_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encrypted_messages
    ADD CONSTRAINT encrypted_messages_pkey PRIMARY KEY (id);


--
-- Name: generated_documents generated_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_pkey PRIMARY KEY (id);


--
-- Name: guest_lists guest_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_lists
    ADD CONSTRAINT guest_lists_pkey PRIMARY KEY (id);


--
-- Name: iasted_config iasted_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iasted_config
    ADD CONSTRAINT iasted_config_pkey PRIMARY KEY (id);


--
-- Name: incoming_mails incoming_mails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incoming_mails
    ADD CONSTRAINT incoming_mails_pkey PRIMARY KEY (id);


--
-- Name: incoming_mails incoming_mails_reference_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incoming_mails
    ADD CONSTRAINT incoming_mails_reference_number_key UNIQUE (reference_number);


--
-- Name: institution_performance institution_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institution_performance
    ADD CONSTRAINT institution_performance_pkey PRIMARY KEY (id);


--
-- Name: intelligence_items intelligence_items_external_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_items
    ADD CONSTRAINT intelligence_items_external_id_key UNIQUE (external_id);


--
-- Name: intelligence_items intelligence_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_items
    ADD CONSTRAINT intelligence_items_pkey PRIMARY KEY (id);


--
-- Name: intelligence_processing_logs intelligence_processing_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_processing_logs
    ADD CONSTRAINT intelligence_processing_logs_pkey PRIMARY KEY (id);


--
-- Name: intelligence_reports intelligence_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_reports
    ADD CONSTRAINT intelligence_reports_pkey PRIMARY KEY (id);


--
-- Name: intelligence_scraping_config intelligence_scraping_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_scraping_config
    ADD CONSTRAINT intelligence_scraping_config_pkey PRIMARY KEY (id);


--
-- Name: intelligence_sources intelligence_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_sources
    ADD CONSTRAINT intelligence_sources_pkey PRIMARY KEY (id);


--
-- Name: intelligence_sources intelligence_sources_url_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_sources
    ADD CONSTRAINT intelligence_sources_url_unique UNIQUE (url);


--
-- Name: interministerial_coordination interministerial_coordination_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interministerial_coordination
    ADD CONSTRAINT interministerial_coordination_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: legal_reviews legal_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_reviews
    ADD CONSTRAINT legal_reviews_pkey PRIMARY KEY (id);


--
-- Name: mail_ai_analysis mail_ai_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_ai_analysis
    ADD CONSTRAINT mail_ai_analysis_pkey PRIMARY KEY (id);


--
-- Name: mail_attachments mail_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_attachments
    ADD CONSTRAINT mail_attachments_pkey PRIMARY KEY (id);


--
-- Name: mail_routing mail_routing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_routing
    ADD CONSTRAINT mail_routing_pkey PRIMARY KEY (id);


--
-- Name: mails mails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mails
    ADD CONSTRAINT mails_pkey PRIMARY KEY (id);


--
-- Name: mails mails_tracking_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mails
    ADD CONSTRAINT mails_tracking_number_key UNIQUE (tracking_number);


--
-- Name: ministerial_projects ministerial_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ministerial_projects
    ADD CONSTRAINT ministerial_projects_pkey PRIMARY KEY (id);


--
-- Name: national_kpis national_kpis_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.national_kpis
    ADD CONSTRAINT national_kpis_date_key UNIQUE (date);


--
-- Name: national_kpis national_kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.national_kpis
    ADD CONSTRAINT national_kpis_pkey PRIMARY KEY (id);


--
-- Name: nominations nominations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominations
    ADD CONSTRAINT nominations_pkey PRIMARY KEY (id);


--
-- Name: official_decrees official_decrees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_decrees
    ADD CONSTRAINT official_decrees_pkey PRIMARY KEY (id);


--
-- Name: official_decrees official_decrees_reference_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_decrees
    ADD CONSTRAINT official_decrees_reference_number_key UNIQUE (reference_number);


--
-- Name: official_events official_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_events
    ADD CONSTRAINT official_events_pkey PRIMARY KEY (id);


--
-- Name: opinion_publique opinion_publique_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opinion_publique
    ADD CONSTRAINT opinion_publique_date_key UNIQUE (date);


--
-- Name: opinion_publique opinion_publique_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opinion_publique
    ADD CONSTRAINT opinion_publique_pkey PRIMARY KEY (id);


--
-- Name: ordre_du_jour ordre_du_jour_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordre_du_jour
    ADD CONSTRAINT ordre_du_jour_pkey PRIMARY KEY (id);


--
-- Name: personal_correspondence personal_correspondence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_correspondence
    ADD CONSTRAINT personal_correspondence_pkey PRIMARY KEY (id);


--
-- Name: presidential_decisions presidential_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presidential_decisions
    ADD CONSTRAINT presidential_decisions_pkey PRIMARY KEY (id);


--
-- Name: presidential_instructions presidential_instructions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presidential_instructions
    ADD CONSTRAINT presidential_instructions_pkey PRIMARY KEY (id);


--
-- Name: private_audiences private_audiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_audiences
    ADD CONSTRAINT private_audiences_pkey PRIMARY KEY (id);


--
-- Name: private_trips private_trips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_trips
    ADD CONSTRAINT private_trips_pkey PRIMARY KEY (id);


--
-- Name: projets_etat projets_etat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projets_etat
    ADD CONSTRAINT projets_etat_pkey PRIMARY KEY (id);


--
-- Name: projets_presidentiels projets_presidentiels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projets_presidentiels
    ADD CONSTRAINT projets_presidentiels_pkey PRIMARY KEY (id);


--
-- Name: protocol_procedures protocol_procedures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protocol_procedures
    ADD CONSTRAINT protocol_procedures_pkey PRIMARY KEY (id);


--
-- Name: role_feedback role_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_feedback
    ADD CONSTRAINT role_feedback_pkey PRIMARY KEY (id);


--
-- Name: service_document_settings service_document_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_document_settings
    ADD CONSTRAINT service_document_settings_pkey PRIMARY KEY (id);


--
-- Name: service_document_settings service_document_settings_service_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_document_settings
    ADD CONSTRAINT service_document_settings_service_role_key UNIQUE (service_role);


--
-- Name: signalements signalements_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signalements
    ADD CONSTRAINT signalements_code_key UNIQUE (code);


--
-- Name: signalements signalements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signalements
    ADD CONSTRAINT signalements_pkey PRIMARY KEY (id);


--
-- Name: surveillance_targets surveillance_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveillance_targets
    ADD CONSTRAINT surveillance_targets_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_key_key UNIQUE (key);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: threat_indicators threat_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threat_indicators
    ADD CONSTRAINT threat_indicators_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: vip_contacts vip_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_contacts
    ADD CONSTRAINT vip_contacts_pkey PRIMARY KEY (id);


--
-- Name: voice_presets voice_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_presets
    ADD CONSTRAINT voice_presets_pkey PRIMARY KEY (id);


--
-- Name: voice_presets voice_presets_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_presets
    ADD CONSTRAINT voice_presets_user_id_name_key UNIQUE (user_id, name);


--
-- Name: idx_administrative_archives_access_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_administrative_archives_access_level ON public.administrative_archives USING btree (access_level);


--
-- Name: idx_administrative_archives_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_administrative_archives_category ON public.administrative_archives USING btree (category);


--
-- Name: idx_administrative_archives_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_administrative_archives_reference ON public.administrative_archives USING btree (reference_code);


--
-- Name: idx_analytics_voice_events_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_voice_events_session_id ON public.analytics_voice_events USING btree (session_id);


--
-- Name: idx_analytics_voice_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_voice_events_user_id ON public.analytics_voice_events USING btree (user_id);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_resource ON public.audit_logs USING btree (resource);


--
-- Name: idx_audit_logs_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_severity ON public.audit_logs USING btree (severity);


--
-- Name: idx_audit_logs_success; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_success ON public.audit_logs USING btree (success);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_chantiers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chantiers_status ON public.chantiers USING btree (status);


--
-- Name: idx_conversation_messages_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_messages_deleted ON public.conversation_messages USING btree (is_deleted);


--
-- Name: idx_conversation_messages_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_messages_session_id ON public.conversation_messages USING btree (session_id);


--
-- Name: idx_conversation_sessions_last_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_sessions_last_message ON public.conversation_sessions USING btree (last_message_at DESC);


--
-- Name: idx_conversation_sessions_user_archived; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_sessions_user_archived ON public.conversation_sessions USING btree (user_id, is_archived);


--
-- Name: idx_conversation_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_sessions_user_id ON public.conversation_sessions USING btree (user_id);


--
-- Name: idx_council_preparations_meeting_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_council_preparations_meeting_date ON public.council_preparations USING btree (meeting_date);


--
-- Name: idx_decret_comments_decret; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_decret_comments_decret ON public.decret_comments USING btree (decret_id);


--
-- Name: idx_decret_signatures_decret; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_decret_signatures_decret ON public.decret_signatures USING btree (decret_id);


--
-- Name: idx_decrets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_decrets_status ON public.decrets_ordonnances USING btree (status);


--
-- Name: idx_document_folder_items_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_folder_items_document_id ON public.document_folder_items USING btree (document_id);


--
-- Name: idx_document_folder_items_folder_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_folder_items_folder_id ON public.document_folder_items USING btree (folder_id);


--
-- Name: idx_document_folders_service_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_folders_service_role ON public.document_folders USING btree (service_role);


--
-- Name: idx_document_history_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_history_document_id ON public.document_history USING btree (document_id);


--
-- Name: idx_documents_holder_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_holder_service ON public.documents USING btree (current_holder_service);


--
-- Name: idx_documents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_status ON public.documents USING btree (status);


--
-- Name: idx_documents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_user_id ON public.documents USING btree (user_id);


--
-- Name: idx_encrypted_messages_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_encrypted_messages_recipient_id ON public.encrypted_messages USING btree (recipient_id);


--
-- Name: idx_encrypted_messages_sender_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_encrypted_messages_sender_id ON public.encrypted_messages USING btree (sender_id);


--
-- Name: idx_generated_documents_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_documents_created_at ON public.generated_documents USING btree (created_at DESC);


--
-- Name: idx_generated_documents_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_documents_type ON public.generated_documents USING btree (document_type);


--
-- Name: idx_generated_documents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_documents_user_id ON public.generated_documents USING btree (user_id);


--
-- Name: idx_guest_lists_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_lists_category ON public.guest_lists USING btree (category);


--
-- Name: idx_guest_lists_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_lists_event_id ON public.guest_lists USING btree (event_id);


--
-- Name: idx_guest_lists_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_lists_status ON public.guest_lists USING btree (status);


--
-- Name: idx_incoming_mails_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incoming_mails_reference ON public.incoming_mails USING btree (reference_number);


--
-- Name: idx_incoming_mails_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incoming_mails_status ON public.incoming_mails USING btree (status);


--
-- Name: idx_incoming_mails_urgency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incoming_mails_urgency ON public.incoming_mails USING btree (urgency);


--
-- Name: idx_intelligence_items_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_items_category ON public.intelligence_items USING btree (category);


--
-- Name: idx_intelligence_items_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_items_embedding ON public.intelligence_items USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');


--
-- Name: idx_intelligence_items_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_items_published_at ON public.intelligence_items USING btree (published_at DESC);


--
-- Name: idx_intelligence_items_sentiment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_items_sentiment ON public.intelligence_items USING btree (sentiment);


--
-- Name: idx_intelligence_items_source_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_items_source_id ON public.intelligence_items USING btree (source_id);


--
-- Name: idx_intelligence_processing_logs_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_processing_logs_item_id ON public.intelligence_processing_logs USING btree (item_id);


--
-- Name: idx_intelligence_processing_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_processing_logs_status ON public.intelligence_processing_logs USING btree (status);


--
-- Name: idx_intelligence_reports_classification; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_reports_classification ON public.intelligence_reports USING btree (classification);


--
-- Name: idx_intelligence_reports_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_reports_created_at ON public.intelligence_reports USING btree (created_at DESC);


--
-- Name: idx_intelligence_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_reports_status ON public.intelligence_reports USING btree (status);


--
-- Name: idx_intelligence_sources_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intelligence_sources_status ON public.intelligence_sources USING btree (status);


--
-- Name: idx_interministerial_coordination_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interministerial_coordination_status ON public.interministerial_coordination USING btree (status);


--
-- Name: idx_knowledge_base_access_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_knowledge_base_access_level ON public.knowledge_base USING gin (access_level);


--
-- Name: idx_knowledge_base_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_knowledge_base_category ON public.knowledge_base USING btree (category);


--
-- Name: idx_knowledge_base_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_knowledge_base_status ON public.knowledge_base USING btree (status);


--
-- Name: idx_legal_reviews_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_reviews_priority ON public.legal_reviews USING btree (priority);


--
-- Name: idx_legal_reviews_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_reviews_status ON public.legal_reviews USING btree (status);


--
-- Name: idx_mail_ai_analysis_mail_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_ai_analysis_mail_id ON public.mail_ai_analysis USING btree (mail_id);


--
-- Name: idx_mail_attachments_mail_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_attachments_mail_id ON public.mail_attachments USING btree (mail_id);


--
-- Name: idx_mail_routing_from_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_routing_from_service ON public.mail_routing USING btree (from_service);


--
-- Name: idx_mail_routing_mail_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_routing_mail_id ON public.mail_routing USING btree (mail_id);


--
-- Name: idx_mail_routing_to_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_routing_to_service ON public.mail_routing USING btree (to_service);


--
-- Name: idx_mails_current_holder_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mails_current_holder_service ON public.mails USING btree (current_holder_service);


--
-- Name: idx_mails_deposited_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mails_deposited_at ON public.mails USING btree (deposited_at);


--
-- Name: idx_mails_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mails_status ON public.mails USING btree (status);


--
-- Name: idx_mails_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mails_user_id ON public.mails USING btree (user_id);


--
-- Name: idx_ministerial_projects_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ministerial_projects_priority ON public.ministerial_projects USING btree (priority);


--
-- Name: idx_ministerial_projects_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ministerial_projects_status ON public.ministerial_projects USING btree (status);


--
-- Name: idx_nominations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nominations_status ON public.nominations USING btree (status);


--
-- Name: idx_official_decrees_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_official_decrees_reference ON public.official_decrees USING btree (reference_number);


--
-- Name: idx_official_decrees_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_official_decrees_status ON public.official_decrees USING btree (status);


--
-- Name: idx_official_decrees_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_official_decrees_type ON public.official_decrees USING btree (type);


--
-- Name: idx_official_events_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_official_events_date ON public.official_events USING btree (date);


--
-- Name: idx_official_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_official_events_status ON public.official_events USING btree (status);


--
-- Name: idx_official_events_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_official_events_type ON public.official_events USING btree (type);


--
-- Name: idx_ordre_du_jour_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ordre_du_jour_session ON public.ordre_du_jour USING btree (session_id);


--
-- Name: idx_personal_correspondence_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personal_correspondence_user_id ON public.personal_correspondence USING btree (user_id);


--
-- Name: idx_presidential_instructions_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_presidential_instructions_due_date ON public.presidential_instructions USING btree (due_date);


--
-- Name: idx_presidential_instructions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_presidential_instructions_status ON public.presidential_instructions USING btree (status);


--
-- Name: idx_private_audiences_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_private_audiences_date ON public.private_audiences USING btree (date);


--
-- Name: idx_private_audiences_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_private_audiences_user_id ON public.private_audiences USING btree (user_id);


--
-- Name: idx_private_trips_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_private_trips_user_id ON public.private_trips USING btree (user_id);


--
-- Name: idx_projets_etat_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projets_etat_status ON public.projets_etat USING btree (status);


--
-- Name: idx_projets_presidentiels_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projets_presidentiels_status ON public.projets_presidentiels USING btree (status);


--
-- Name: idx_protocol_procedures_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_protocol_procedures_category ON public.protocol_procedures USING btree (category);


--
-- Name: idx_surveillance_targets_last_update; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_surveillance_targets_last_update ON public.surveillance_targets USING btree (last_update DESC);


--
-- Name: idx_surveillance_targets_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_surveillance_targets_priority ON public.surveillance_targets USING btree (priority);


--
-- Name: idx_surveillance_targets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_surveillance_targets_status ON public.surveillance_targets USING btree (status);


--
-- Name: idx_surveillance_targets_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_surveillance_targets_type ON public.surveillance_targets USING btree (type);


--
-- Name: idx_system_config_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_config_key ON public.system_config USING btree (key);


--
-- Name: idx_system_settings_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_settings_key ON public.system_settings USING btree (setting_key);


--
-- Name: idx_system_settings_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_settings_type ON public.system_settings USING btree (setting_type);


--
-- Name: idx_threat_indicators_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threat_indicators_level ON public.threat_indicators USING btree (level);


--
-- Name: idx_threat_indicators_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threat_indicators_timestamp ON public.threat_indicators USING btree ("timestamp" DESC);


--
-- Name: idx_threat_indicators_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threat_indicators_type ON public.threat_indicators USING btree (type);


--
-- Name: idx_vip_contacts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vip_contacts_user_id ON public.vip_contacts USING btree (user_id);


--
-- Name: idx_voice_presets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voice_presets_user_id ON public.voice_presets USING btree (user_id);


--
-- Name: intelligence_items_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX intelligence_items_category_idx ON public.intelligence_items USING btree (category);


--
-- Name: intelligence_items_embedding_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX intelligence_items_embedding_idx ON public.intelligence_items USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');


--
-- Name: intelligence_items_published_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX intelligence_items_published_at_idx ON public.intelligence_items USING btree (published_at DESC);


--
-- Name: intelligence_items_sentiment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX intelligence_items_sentiment_idx ON public.intelligence_items USING btree (sentiment);


--
-- Name: conversation_sessions conversation_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER conversation_sessions_updated_at BEFORE UPDATE ON public.conversation_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: intelligence_scraping_config intelligence_scraping_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER intelligence_scraping_config_updated_at BEFORE UPDATE ON public.intelligence_scraping_config FOR EACH ROW EXECUTE FUNCTION public.update_intelligence_scraping_config_updated_at();


--
-- Name: intelligence_items on_intelligence_item_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_intelligence_item_insert AFTER INSERT ON public.intelligence_items FOR EACH ROW EXECUTE FUNCTION public.trigger_process_intelligence();


--
-- Name: chantiers update_chantiers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chantiers_updated_at BEFORE UPDATE ON public.chantiers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: conseil_ministres_sessions update_conseil_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_conseil_sessions_updated_at BEFORE UPDATE ON public.conseil_ministres_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: decrets_ordonnances update_decrets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_decrets_updated_at BEFORE UPDATE ON public.decrets_ordonnances FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: generated_documents update_generated_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_generated_documents_updated_at BEFORE UPDATE ON public.generated_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: iasted_config update_iasted_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_iasted_config_updated_at BEFORE UPDATE ON public.iasted_config FOR EACH ROW EXECUTE FUNCTION public.update_iasted_config_updated_at();


--
-- Name: incoming_mails update_incoming_mails_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_incoming_mails_updated_at BEFORE UPDATE ON public.incoming_mails FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: intelligence_items update_intelligence_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_intelligence_items_updated_at BEFORE UPDATE ON public.intelligence_items FOR EACH ROW EXECUTE FUNCTION public.update_intelligence_updated_at();


--
-- Name: intelligence_reports update_intelligence_reports_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_intelligence_reports_updated_at BEFORE UPDATE ON public.intelligence_reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: intelligence_sources update_intelligence_sources_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_intelligence_sources_updated_at BEFORE UPDATE ON public.intelligence_sources FOR EACH ROW EXECUTE FUNCTION public.update_intelligence_updated_at();


--
-- Name: knowledge_base update_knowledge_base_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: nominations update_nominations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_nominations_updated_at BEFORE UPDATE ON public.nominations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: personal_correspondence update_personal_correspondence_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_personal_correspondence_updated_at BEFORE UPDATE ON public.personal_correspondence FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: private_audiences update_private_audiences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_private_audiences_updated_at BEFORE UPDATE ON public.private_audiences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: private_trips update_private_trips_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_private_trips_updated_at BEFORE UPDATE ON public.private_trips FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: projets_etat update_projets_etat_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projets_etat_updated_at BEFORE UPDATE ON public.projets_etat FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: projets_presidentiels update_projets_presidentiels_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projets_presidentiels_updated_at BEFORE UPDATE ON public.projets_presidentiels FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: signalements update_signalements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_signalements_updated_at BEFORE UPDATE ON public.signalements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: surveillance_targets update_surveillance_targets_last_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_surveillance_targets_last_update BEFORE UPDATE ON public.surveillance_targets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: system_config update_system_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: system_settings update_system_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: vip_contacts update_vip_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vip_contacts_updated_at BEFORE UPDATE ON public.vip_contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_preferences user_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: voice_presets voice_presets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER voice_presets_updated_at BEFORE UPDATE ON public.voice_presets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: analytics_voice_events analytics_voice_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_voice_events
    ADD CONSTRAINT analytics_voice_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.conversation_sessions(id) ON DELETE CASCADE;


--
-- Name: conversation_messages conversation_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.conversation_sessions(id) ON DELETE CASCADE;


--
-- Name: decret_comments decret_comments_decret_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decret_comments
    ADD CONSTRAINT decret_comments_decret_id_fkey FOREIGN KEY (decret_id) REFERENCES public.decrets_ordonnances(id) ON DELETE CASCADE;


--
-- Name: decret_signatures decret_signatures_decret_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decret_signatures
    ADD CONSTRAINT decret_signatures_decret_id_fkey FOREIGN KEY (decret_id) REFERENCES public.decrets_ordonnances(id) ON DELETE CASCADE;


--
-- Name: document_folder_items document_folder_items_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folder_items
    ADD CONSTRAINT document_folder_items_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: document_folder_items document_folder_items_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folder_items
    ADD CONSTRAINT document_folder_items_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.document_folders(id) ON DELETE CASCADE;


--
-- Name: document_folders document_folders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folders
    ADD CONSTRAINT document_folders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: document_history document_history_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_history
    ADD CONSTRAINT document_history_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: document_history document_history_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_history
    ADD CONSTRAINT document_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: documents documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: encrypted_messages encrypted_messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encrypted_messages
    ADD CONSTRAINT encrypted_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: encrypted_messages encrypted_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encrypted_messages
    ADD CONSTRAINT encrypted_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: generated_documents generated_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: guest_lists guest_lists_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_lists
    ADD CONSTRAINT guest_lists_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.official_events(id) ON DELETE CASCADE;


--
-- Name: intelligence_items intelligence_items_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_items
    ADD CONSTRAINT intelligence_items_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.intelligence_sources(id) ON DELETE SET NULL;


--
-- Name: intelligence_processing_logs intelligence_processing_logs_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_processing_logs
    ADD CONSTRAINT intelligence_processing_logs_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.intelligence_items(id) ON DELETE CASCADE;


--
-- Name: intelligence_reports intelligence_reports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_reports
    ADD CONSTRAINT intelligence_reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: mail_ai_analysis mail_ai_analysis_mail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_ai_analysis
    ADD CONSTRAINT mail_ai_analysis_mail_id_fkey FOREIGN KEY (mail_id) REFERENCES public.mails(id) ON DELETE CASCADE;


--
-- Name: mail_attachments mail_attachments_mail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_attachments
    ADD CONSTRAINT mail_attachments_mail_id_fkey FOREIGN KEY (mail_id) REFERENCES public.mails(id) ON DELETE CASCADE;


--
-- Name: mail_routing mail_routing_mail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_routing
    ADD CONSTRAINT mail_routing_mail_id_fkey FOREIGN KEY (mail_id) REFERENCES public.mails(id) ON DELETE CASCADE;


--
-- Name: mails mails_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mails
    ADD CONSTRAINT mails_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: ordre_du_jour ordre_du_jour_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordre_du_jour
    ADD CONSTRAINT ordre_du_jour_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.conseil_ministres_sessions(id) ON DELETE CASCADE;


--
-- Name: personal_correspondence personal_correspondence_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_correspondence
    ADD CONSTRAINT personal_correspondence_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: presidential_decisions presidential_decisions_president_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presidential_decisions
    ADD CONSTRAINT presidential_decisions_president_user_id_fkey FOREIGN KEY (president_user_id) REFERENCES auth.users(id);


--
-- Name: presidential_decisions presidential_decisions_signalement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presidential_decisions
    ADD CONSTRAINT presidential_decisions_signalement_id_fkey FOREIGN KEY (signalement_id) REFERENCES public.signalements(id) ON DELETE CASCADE;


--
-- Name: private_audiences private_audiences_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_audiences
    ADD CONSTRAINT private_audiences_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: private_audiences private_audiences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_audiences
    ADD CONSTRAINT private_audiences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: private_trips private_trips_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_trips
    ADD CONSTRAINT private_trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: signalements signalements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signalements
    ADD CONSTRAINT signalements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: surveillance_targets surveillance_targets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveillance_targets
    ADD CONSTRAINT surveillance_targets_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: threat_indicators threat_indicators_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threat_indicators
    ADD CONSTRAINT threat_indicators_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vip_contacts vip_contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_contacts
    ADD CONSTRAINT vip_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: opinion_publique Admin can manage opinion publique; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage opinion publique" ON public.opinion_publique TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: intelligence_scraping_config Admin can update scraping config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update scraping config" ON public.intelligence_scraping_config FOR UPDATE USING (true);


--
-- Name: intelligence_scraping_config Admin can view scraping config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view scraping config" ON public.intelligence_scraping_config FOR SELECT USING (true);


--
-- Name: role_feedback Admins and president can view all feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and president can view all feedback" ON public.role_feedback FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'president'::public.app_role)));


--
-- Name: document_templates Admins can do everything on document_templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can do everything on document_templates" ON public.document_templates USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: service_document_settings Admins can do everything on service_document_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can do everything on service_document_settings" ON public.service_document_settings USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: user_profiles Admins can manage all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: intelligence_sources Admins can manage intelligence sources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage intelligence sources" ON public.intelligence_sources USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'dgss'::public.app_role]))))));


--
-- Name: knowledge_base Admins can manage knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: signalements Admins can manage signalements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage signalements" ON public.signalements USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_config Admins can manage system config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage system config" ON public.system_config USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_settings Admins can manage system settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage system settings" ON public.system_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: iasted_config Admins can update iasted config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update iasted config" ON public.iasted_config FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: audit_logs Admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: intelligence_items Admins can view intelligence items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view intelligence items" ON public.intelligence_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'dgss'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: intelligence_processing_logs Admins can view processing logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view processing logs" ON public.intelligence_processing_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'dgss'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: official_decrees All authenticated can view decrees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "All authenticated can view decrees" ON public.official_decrees FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: protocol_procedures All authenticated can view procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "All authenticated can view procedures" ON public.protocol_procedures FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: legal_reviews All authenticated can view reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "All authenticated can view reviews" ON public.legal_reviews FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: conseil_ministres_sessions Allow admin to manage sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin to manage sessions" ON public.conseil_ministres_sessions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'sec_gen'::public.app_role]))))));


--
-- Name: decret_comments Allow creating comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow creating comments" ON public.decret_comments FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: decret_signatures Allow creating signatures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow creating signatures" ON public.decret_signatures FOR INSERT TO authenticated WITH CHECK ((auth.uid() = signed_by));


--
-- Name: iasted_config Allow edge function to insert config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow edge function to insert config" ON public.iasted_config FOR INSERT WITH CHECK (true);


--
-- Name: ordre_du_jour Allow managing agenda items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow managing agenda items" ON public.ordre_du_jour TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'sec_gen'::public.app_role]))))));


--
-- Name: budget_national Allow managing budget; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow managing budget" ON public.budget_national TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: chantiers Allow managing chantiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow managing chantiers" ON public.chantiers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: decrets_ordonnances Allow managing decrets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow managing decrets" ON public.decrets_ordonnances TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'sec_gen'::public.app_role]))))));


--
-- Name: nominations Allow managing nominations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow managing nominations" ON public.nominations TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: projets_presidentiels Allow managing presidential projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow managing presidential projects" ON public.projets_presidentiels TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: projets_etat Allow managing state projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow managing state projects" ON public.projets_etat TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'president'::public.app_role]))))));


--
-- Name: conseil_ministres_sessions Allow president and admin to view sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow president and admin to view sessions" ON public.conseil_ministres_sessions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'dgr'::public.app_role, 'sec_gen'::public.app_role]))))));


--
-- Name: ordre_du_jour Allow viewing agenda items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing agenda items" ON public.ordre_du_jour FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'dgr'::public.app_role, 'sec_gen'::public.app_role]))))));


--
-- Name: budget_national Allow viewing budget; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing budget" ON public.budget_national FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'dgr'::public.app_role]))))));


--
-- Name: chantiers Allow viewing chantiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing chantiers" ON public.chantiers FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'dgr'::public.app_role]))))));


--
-- Name: decret_comments Allow viewing comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing comments" ON public.decret_comments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'sec_gen'::public.app_role, 'dgr'::public.app_role]))))));


--
-- Name: decrets_ordonnances Allow viewing decrets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing decrets" ON public.decrets_ordonnances FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'sec_gen'::public.app_role, 'dgr'::public.app_role]))))));


--
-- Name: nominations Allow viewing nominations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing nominations" ON public.nominations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'dgr'::public.app_role]))))));


--
-- Name: projets_presidentiels Allow viewing presidential projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing presidential projects" ON public.projets_presidentiels FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'dgr'::public.app_role]))))));


--
-- Name: decret_signatures Allow viewing signatures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing signatures" ON public.decret_signatures FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'sec_gen'::public.app_role, 'dgr'::public.app_role]))))));


--
-- Name: projets_etat Allow viewing state projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow viewing state projects" ON public.projets_etat FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['president'::public.app_role, 'admin'::public.app_role, 'dgr'::public.app_role]))))));


--
-- Name: iasted_config Anyone can read iasted config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read iasted config" ON public.iasted_config FOR SELECT USING (true);


--
-- Name: role_feedback Anyone can submit role feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit role feedback" ON public.role_feedback FOR INSERT WITH CHECK (true);


--
-- Name: mail_attachments Authenticated users can create attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create attachments" ON public.mail_attachments FOR INSERT WITH CHECK (true);


--
-- Name: mail_ai_analysis Authenticated users can create mail analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create mail analysis" ON public.mail_ai_analysis FOR INSERT WITH CHECK (true);


--
-- Name: mails Authenticated users can create mails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create mails" ON public.mails FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: mail_routing Authenticated users can create routing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create routing" ON public.mail_routing FOR INSERT WITH CHECK (true);


--
-- Name: knowledge_base Authenticated users can read knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read knowledge base" ON public.knowledge_base FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: system_config Authenticated users can read system config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read system config" ON public.system_config FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: mail_attachments Authenticated users can view attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view attachments" ON public.mail_attachments FOR SELECT USING (true);


--
-- Name: mail_ai_analysis Authenticated users can view mail analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view mail analysis" ON public.mail_ai_analysis FOR SELECT USING (true);


--
-- Name: mails Authenticated users can view mails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view mails" ON public.mails FOR SELECT TO authenticated USING (true);


--
-- Name: mail_routing Authenticated users can view routing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view routing" ON public.mail_routing FOR SELECT USING (true);


--
-- Name: interministerial_coordination Cabinet and Admin can view coordination; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cabinet and Admin can view coordination" ON public.interministerial_coordination FOR SELECT USING ((public.has_role(auth.uid(), 'dgr'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: council_preparations Cabinet and Admin can view council prep; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cabinet and Admin can view council prep" ON public.council_preparations FOR SELECT USING ((public.has_role(auth.uid(), 'dgr'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: presidential_instructions Cabinet and Admin can view instructions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cabinet and Admin can view instructions" ON public.presidential_instructions FOR SELECT USING ((public.has_role(auth.uid(), 'dgr'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: ministerial_projects Cabinet and Admin can view projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cabinet and Admin can view projects" ON public.ministerial_projects FOR SELECT USING ((public.has_role(auth.uid(), 'dgr'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: interministerial_coordination Cabinet can manage coordination; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cabinet can manage coordination" ON public.interministerial_coordination USING ((public.has_role(auth.uid(), 'dgr'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: council_preparations Cabinet can manage council prep; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cabinet can manage council prep" ON public.council_preparations USING ((public.has_role(auth.uid(), 'dgr'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: presidential_instructions Cabinet can manage instructions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cabinet can manage instructions" ON public.presidential_instructions USING ((public.has_role(auth.uid(), 'dgr'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: ministerial_projects Cabinet can manage projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cabinet can manage projects" ON public.ministerial_projects USING ((public.has_role(auth.uid(), 'dgr'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: incoming_mails Courrier service can manage mails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Courrier service can manage mails" ON public.incoming_mails USING ((public.has_role(auth.uid(), 'courrier'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: incoming_mails Courrier service can view mails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Courrier service can view mails" ON public.incoming_mails FOR SELECT USING ((public.has_role(auth.uid(), 'courrier'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: intelligence_reports DGSS and Admin can create intelligence reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can create intelligence reports" ON public.intelligence_reports FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: surveillance_targets DGSS and Admin can create surveillance targets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can create surveillance targets" ON public.surveillance_targets FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: threat_indicators DGSS and Admin can create threat indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can create threat indicators" ON public.threat_indicators FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: intelligence_reports DGSS and Admin can delete intelligence reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can delete intelligence reports" ON public.intelligence_reports FOR DELETE USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: surveillance_targets DGSS and Admin can delete surveillance targets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can delete surveillance targets" ON public.surveillance_targets FOR DELETE USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: threat_indicators DGSS and Admin can delete threat indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can delete threat indicators" ON public.threat_indicators FOR DELETE USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: intelligence_reports DGSS and Admin can update intelligence reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can update intelligence reports" ON public.intelligence_reports FOR UPDATE USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: surveillance_targets DGSS and Admin can update surveillance targets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can update surveillance targets" ON public.surveillance_targets FOR UPDATE USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: threat_indicators DGSS and Admin can update threat indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can update threat indicators" ON public.threat_indicators FOR UPDATE USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: intelligence_reports DGSS and Admin can view intelligence reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can view intelligence reports" ON public.intelligence_reports FOR SELECT USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: surveillance_targets DGSS and Admin can view surveillance targets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can view surveillance targets" ON public.surveillance_targets FOR SELECT USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: threat_indicators DGSS and Admin can view threat indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "DGSS and Admin can view threat indicators" ON public.threat_indicators FOR SELECT USING ((public.has_role(auth.uid(), 'dgss'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: document_templates Everyone can read document_templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can read document_templates" ON public.document_templates FOR SELECT USING (true);


--
-- Name: service_document_settings Everyone can read service_document_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can read service_document_settings" ON public.service_document_settings FOR SELECT USING (true);


--
-- Name: institution_performance No user modifications on institution_performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No user modifications on institution_performance" ON public.institution_performance USING (false) WITH CHECK (false);


--
-- Name: national_kpis No user modifications on national_kpis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No user modifications on national_kpis" ON public.national_kpis USING (false) WITH CHECK (false);


--
-- Name: opinion_publique No user modifications on opinion_publique; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No user modifications on opinion_publique" ON public.opinion_publique USING (false) WITH CHECK (false);


--
-- Name: presidential_decisions Only president can create decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only president can create decisions" ON public.presidential_decisions FOR INSERT WITH CHECK (public.is_president(auth.uid()));


--
-- Name: opinion_publique President and admin can view opinion publique; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "President and admin can view opinion publique" ON public.opinion_publique FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'president'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles President can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "President can view all roles" ON public.user_roles FOR SELECT USING (public.is_president(auth.uid()));


--
-- Name: audit_logs President can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "President can view audit logs" ON public.audit_logs FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: presidential_decisions President sees all decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "President sees all decisions" ON public.presidential_decisions FOR SELECT USING (public.is_president(auth.uid()));


--
-- Name: national_kpis President sees all kpis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "President sees all kpis" ON public.national_kpis FOR SELECT USING (public.is_president(auth.uid()));


--
-- Name: signalements President sees all signalements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "President sees all signalements" ON public.signalements FOR SELECT USING (public.is_president(auth.uid()));


--
-- Name: institution_performance President sees institution performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "President sees institution performance" ON public.institution_performance FOR SELECT USING (public.is_president(auth.uid()));


--
-- Name: opinion_publique President sees opinion; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "President sees opinion" ON public.opinion_publique FOR SELECT USING (public.is_president(auth.uid()));


--
-- Name: protocol_procedures Protocol can manage procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Protocol can manage procedures" ON public.protocol_procedures USING ((public.has_role(auth.uid(), 'protocol'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: official_events Protocol service can manage events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Protocol service can manage events" ON public.official_events USING ((public.has_role(auth.uid(), 'protocol'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: guest_lists Protocol service can manage guests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Protocol service can manage guests" ON public.guest_lists USING ((public.has_role(auth.uid(), 'protocol'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: official_events Protocol service can view events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Protocol service can view events" ON public.official_events FOR SELECT USING ((public.has_role(auth.uid(), 'protocol'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: guest_lists Protocol service can view guests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Protocol service can view guests" ON public.guest_lists FOR SELECT USING ((public.has_role(auth.uid(), 'protocol'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_president(auth.uid())));


--
-- Name: encrypted_messages Recipients can update read status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Recipients can update read status" ON public.encrypted_messages FOR UPDATE USING ((recipient_id = auth.uid()));


--
-- Name: administrative_archives Secretariat can manage archives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Secretariat can manage archives" ON public.administrative_archives USING ((public.has_role(auth.uid(), 'sec_gen'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: official_decrees Secretariat can manage decrees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Secretariat can manage decrees" ON public.official_decrees USING ((public.has_role(auth.uid(), 'sec_gen'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: legal_reviews Secretariat can manage reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Secretariat can manage reviews" ON public.legal_reviews USING ((public.has_role(auth.uid(), 'sec_gen'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: institution_performance Service role can manage institution_performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage institution_performance" ON public.institution_performance TO service_role USING (true) WITH CHECK (true);


--
-- Name: intelligence_items Service role can manage items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage items" ON public.intelligence_items USING (true);


--
-- Name: intelligence_processing_logs Service role can manage logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage logs" ON public.intelligence_processing_logs USING (true);


--
-- Name: national_kpis Service role can manage national_kpis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage national_kpis" ON public.national_kpis TO service_role USING (true) WITH CHECK (true);


--
-- Name: opinion_publique Service role can manage opinion publique; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage opinion publique" ON public.opinion_publique TO service_role USING (true) WITH CHECK (true);


--
-- Name: intelligence_sources Service role can manage sources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage sources" ON public.intelligence_sources USING (true);


--
-- Name: mails Service users can update mails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service users can update mails" ON public.mails FOR UPDATE USING (((current_holder_service IN ( SELECT (user_roles.role)::text AS role
   FROM public.user_roles
  WHERE (user_roles.user_id = auth.uid()))) OR (user_id = auth.uid())));


--
-- Name: mails Service users can view mails for their service; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service users can view mails for their service" ON public.mails FOR SELECT USING (((current_holder_service IN ( SELECT (user_roles.role)::text AS role
   FROM public.user_roles
  WHERE (user_roles.user_id = auth.uid()))) OR (user_id = auth.uid())));


--
-- Name: audit_logs System can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);


--
-- Name: document_folder_items Users can add items to their folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add items to their folders" ON public.document_folder_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.document_folders
  WHERE ((document_folders.id = document_folder_items.folder_id) AND (document_folders.created_by = auth.uid())))));


--
-- Name: documents Users can create documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create documents" ON public.documents FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: document_folders Users can create folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create folders" ON public.document_folders FOR INSERT TO authenticated WITH CHECK ((created_by = auth.uid()));


--
-- Name: document_history Users can create history entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create history entries" ON public.document_history FOR INSERT TO authenticated WITH CHECK ((performed_by = auth.uid()));


--
-- Name: conversation_messages Users can create messages in own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create messages in own sessions" ON public.conversation_messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.conversation_sessions
  WHERE ((conversation_sessions.id = conversation_messages.session_id) AND (conversation_sessions.user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid)))));


--
-- Name: analytics_voice_events Users can create own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own analytics" ON public.analytics_voice_events FOR INSERT WITH CHECK ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: voice_presets Users can create own presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own presets" ON public.voice_presets FOR INSERT WITH CHECK ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: conversation_sessions Users can create own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own sessions" ON public.conversation_sessions FOR INSERT WITH CHECK ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: signalements Users can create signalements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create signalements" ON public.signalements FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: private_audiences Users can create their own audiences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own audiences" ON public.private_audiences FOR INSERT WITH CHECK (((user_id = auth.uid()) AND (created_by = auth.uid())));


--
-- Name: vip_contacts Users can create their own contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own contacts" ON public.vip_contacts FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: personal_correspondence Users can create their own correspondence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own correspondence" ON public.personal_correspondence FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: generated_documents Users can create their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own documents" ON public.generated_documents FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: private_trips Users can create their own trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own trips" ON public.private_trips FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: voice_presets Users can delete own presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own presets" ON public.voice_presets FOR DELETE USING ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: private_audiences Users can delete their own audiences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own audiences" ON public.private_audiences FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: vip_contacts Users can delete their own contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own contacts" ON public.vip_contacts FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: personal_correspondence Users can delete their own correspondence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own correspondence" ON public.personal_correspondence FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: generated_documents Users can delete their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own documents" ON public.generated_documents FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: encrypted_messages Users can delete their own sent messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own sent messages" ON public.encrypted_messages FOR DELETE USING ((sender_id = auth.uid()));


--
-- Name: private_trips Users can delete their own trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own trips" ON public.private_trips FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: user_preferences Users can insert own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: user_profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: user_profiles Users can read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own profile" ON public.user_profiles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: system_settings Users can read public settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read public settings" ON public.system_settings FOR SELECT USING (((is_public = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: encrypted_messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.encrypted_messages FOR INSERT WITH CHECK ((sender_id = auth.uid()));


--
-- Name: user_preferences Users can update own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: voice_presets Users can update own presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own presets" ON public.voice_presets FOR UPDATE USING ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: user_profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: conversation_sessions Users can update own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own sessions" ON public.conversation_sessions FOR UPDATE USING ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: documents Users can update their documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their documents" ON public.documents FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: private_audiences Users can update their own audiences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own audiences" ON public.private_audiences FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: vip_contacts Users can update their own contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own contacts" ON public.vip_contacts FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: personal_correspondence Users can update their own correspondence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own correspondence" ON public.personal_correspondence FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: generated_documents Users can update their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own documents" ON public.generated_documents FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: private_trips Users can update their own trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own trips" ON public.private_trips FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: administrative_archives Users can view archives based on access level; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view archives based on access level" ON public.administrative_archives FOR SELECT USING (((access_level = 'public'::text) OR ((access_level = 'restricted'::text) AND (auth.uid() IS NOT NULL)) OR ((access_level = ANY (ARRAY['confidential'::text, 'secret'::text])) AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'sec_gen'::public.app_role) OR public.is_president(auth.uid())))));


--
-- Name: documents Users can view documents they created or are assigned to; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view documents they created or are assigned to" ON public.documents FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (current_holder_service IN ( SELECT (user_roles.role)::text AS role
   FROM public.user_roles
  WHERE (user_roles.user_id = auth.uid())))));


--
-- Name: document_folder_items Users can view folder items for accessible folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view folder items for accessible folders" ON public.document_folder_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.document_folders
  WHERE ((document_folders.id = document_folder_items.folder_id) AND ((document_folders.created_by = auth.uid()) OR (document_folders.service_role IN ( SELECT (user_roles.role)::text AS role
           FROM public.user_roles
          WHERE (user_roles.user_id = auth.uid()))))))));


--
-- Name: document_history Users can view history of accessible documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view history of accessible documents" ON public.document_history FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.documents
  WHERE ((documents.id = document_history.document_id) AND ((documents.user_id = auth.uid()) OR (documents.current_holder_service IN ( SELECT (user_roles.role)::text AS role
           FROM public.user_roles
          WHERE (user_roles.user_id = auth.uid()))))))));


--
-- Name: conversation_messages Users can view messages from own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages from own sessions" ON public.conversation_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.conversation_sessions
  WHERE ((conversation_sessions.id = conversation_messages.session_id) AND (conversation_sessions.user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid)))));


--
-- Name: encrypted_messages Users can view messages they sent or received; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages they sent or received" ON public.encrypted_messages FOR SELECT USING (((sender_id = auth.uid()) OR (recipient_id = auth.uid())));


--
-- Name: analytics_voice_events Users can view own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own analytics" ON public.analytics_voice_events FOR SELECT USING ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: user_preferences Users can view own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: voice_presets Users can view own presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own presets" ON public.voice_presets FOR SELECT USING ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: conversation_sessions Users can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sessions" ON public.conversation_sessions FOR SELECT USING ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))::uuid));


--
-- Name: document_folders Users can view their folders or role folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their folders or role folders" ON public.document_folders FOR SELECT TO authenticated USING (((created_by = auth.uid()) OR (service_role IN ( SELECT (user_roles.role)::text AS role
   FROM public.user_roles
  WHERE (user_roles.user_id = auth.uid()))) OR (service_role IS NULL)));


--
-- Name: private_audiences Users can view their own audiences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own audiences" ON public.private_audiences FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: vip_contacts Users can view their own contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own contacts" ON public.vip_contacts FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: personal_correspondence Users can view their own correspondence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own correspondence" ON public.personal_correspondence FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: generated_documents Users can view their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own documents" ON public.generated_documents FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: role_feedback Users can view their own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own feedback" ON public.role_feedback FOR SELECT USING ((user_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)));


--
-- Name: private_trips Users can view their own trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own trips" ON public.private_trips FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: administrative_archives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.administrative_archives ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_voice_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_voice_events ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_national; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.budget_national ENABLE ROW LEVEL SECURITY;

--
-- Name: chantiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chantiers ENABLE ROW LEVEL SECURITY;

--
-- Name: conseil_ministres_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conseil_ministres_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: conversation_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: conversation_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: council_preparations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.council_preparations ENABLE ROW LEVEL SECURITY;

--
-- Name: decret_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.decret_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: decret_signatures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.decret_signatures ENABLE ROW LEVEL SECURITY;

--
-- Name: decrets_ordonnances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.decrets_ordonnances ENABLE ROW LEVEL SECURITY;

--
-- Name: document_folder_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_folder_items ENABLE ROW LEVEL SECURITY;

--
-- Name: document_folders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

--
-- Name: document_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;

--
-- Name: document_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: encrypted_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.encrypted_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: generated_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_lists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_lists ENABLE ROW LEVEL SECURITY;

--
-- Name: iasted_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.iasted_config ENABLE ROW LEVEL SECURITY;

--
-- Name: incoming_mails; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incoming_mails ENABLE ROW LEVEL SECURITY;

--
-- Name: institution_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.institution_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: intelligence_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.intelligence_items ENABLE ROW LEVEL SECURITY;

--
-- Name: intelligence_processing_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.intelligence_processing_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: intelligence_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.intelligence_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: intelligence_scraping_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.intelligence_scraping_config ENABLE ROW LEVEL SECURITY;

--
-- Name: intelligence_sources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.intelligence_sources ENABLE ROW LEVEL SECURITY;

--
-- Name: interministerial_coordination; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.interministerial_coordination ENABLE ROW LEVEL SECURITY;

--
-- Name: knowledge_base; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

--
-- Name: legal_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.legal_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: mail_ai_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mail_ai_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: mail_attachments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mail_attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: mail_routing; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mail_routing ENABLE ROW LEVEL SECURITY;

--
-- Name: mails; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mails ENABLE ROW LEVEL SECURITY;

--
-- Name: ministerial_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ministerial_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: national_kpis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.national_kpis ENABLE ROW LEVEL SECURITY;

--
-- Name: nominations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;

--
-- Name: official_decrees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.official_decrees ENABLE ROW LEVEL SECURITY;

--
-- Name: official_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.official_events ENABLE ROW LEVEL SECURITY;

--
-- Name: opinion_publique; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.opinion_publique ENABLE ROW LEVEL SECURITY;

--
-- Name: ordre_du_jour; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ordre_du_jour ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_correspondence; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.personal_correspondence ENABLE ROW LEVEL SECURITY;

--
-- Name: presidential_decisions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.presidential_decisions ENABLE ROW LEVEL SECURITY;

--
-- Name: presidential_instructions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.presidential_instructions ENABLE ROW LEVEL SECURITY;

--
-- Name: private_audiences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.private_audiences ENABLE ROW LEVEL SECURITY;

--
-- Name: private_trips; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.private_trips ENABLE ROW LEVEL SECURITY;

--
-- Name: projets_etat; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projets_etat ENABLE ROW LEVEL SECURITY;

--
-- Name: projets_presidentiels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projets_presidentiels ENABLE ROW LEVEL SECURITY;

--
-- Name: protocol_procedures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.protocol_procedures ENABLE ROW LEVEL SECURITY;

--
-- Name: role_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.role_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: service_document_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_document_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: signalements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.signalements ENABLE ROW LEVEL SECURITY;

--
-- Name: surveillance_targets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.surveillance_targets ENABLE ROW LEVEL SECURITY;

--
-- Name: system_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

--
-- Name: system_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: threat_indicators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;

--
-- Name: user_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: vip_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vip_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_presets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_presets ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


