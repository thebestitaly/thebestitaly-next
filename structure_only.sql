--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Postgres.app)
-- Dumped by pg_dump version 16.8 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.titles_translations DROP CONSTRAINT IF EXISTS titles_translations_titles_id_foreign;
ALTER TABLE IF EXISTS ONLY public.titles_translations DROP CONSTRAINT IF EXISTS titles_translations_languages_code_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_webhooks DROP CONSTRAINT IF EXISTS directus_webhooks_migrated_flow_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_versions DROP CONSTRAINT IF EXISTS directus_versions_user_updated_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_versions DROP CONSTRAINT IF EXISTS directus_versions_user_created_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_versions DROP CONSTRAINT IF EXISTS directus_versions_collection_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_users DROP CONSTRAINT IF EXISTS directus_users_role_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_shares DROP CONSTRAINT IF EXISTS directus_shares_user_created_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_shares DROP CONSTRAINT IF EXISTS directus_shares_role_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_shares DROP CONSTRAINT IF EXISTS directus_shares_collection_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_settings DROP CONSTRAINT IF EXISTS directus_settings_storage_default_folder_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_settings DROP CONSTRAINT IF EXISTS directus_settings_public_registration_role_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_settings DROP CONSTRAINT IF EXISTS directus_settings_public_foreground_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_settings DROP CONSTRAINT IF EXISTS directus_settings_public_favicon_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_settings DROP CONSTRAINT IF EXISTS directus_settings_public_background_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_settings DROP CONSTRAINT IF EXISTS directus_settings_project_logo_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_sessions DROP CONSTRAINT IF EXISTS directus_sessions_user_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_sessions DROP CONSTRAINT IF EXISTS directus_sessions_share_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_roles DROP CONSTRAINT IF EXISTS directus_roles_parent_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_revisions DROP CONSTRAINT IF EXISTS directus_revisions_version_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_revisions DROP CONSTRAINT IF EXISTS directus_revisions_parent_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_revisions DROP CONSTRAINT IF EXISTS directus_revisions_activity_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_presets DROP CONSTRAINT IF EXISTS directus_presets_user_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_presets DROP CONSTRAINT IF EXISTS directus_presets_role_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_permissions DROP CONSTRAINT IF EXISTS directus_permissions_policy_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_panels DROP CONSTRAINT IF EXISTS directus_panels_user_created_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_panels DROP CONSTRAINT IF EXISTS directus_panels_dashboard_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_operations DROP CONSTRAINT IF EXISTS directus_operations_user_created_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_operations DROP CONSTRAINT IF EXISTS directus_operations_resolve_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_operations DROP CONSTRAINT IF EXISTS directus_operations_reject_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_operations DROP CONSTRAINT IF EXISTS directus_operations_flow_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_notifications DROP CONSTRAINT IF EXISTS directus_notifications_sender_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_notifications DROP CONSTRAINT IF EXISTS directus_notifications_recipient_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_folders DROP CONSTRAINT IF EXISTS directus_folders_parent_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_flows DROP CONSTRAINT IF EXISTS directus_flows_user_created_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_files DROP CONSTRAINT IF EXISTS directus_files_uploaded_by_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_files DROP CONSTRAINT IF EXISTS directus_files_modified_by_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_files DROP CONSTRAINT IF EXISTS directus_files_folder_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_dashboards DROP CONSTRAINT IF EXISTS directus_dashboards_user_created_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_comments DROP CONSTRAINT IF EXISTS directus_comments_user_updated_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_comments DROP CONSTRAINT IF EXISTS directus_comments_user_created_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_collections DROP CONSTRAINT IF EXISTS directus_collections_group_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_access DROP CONSTRAINT IF EXISTS directus_access_user_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_access DROP CONSTRAINT IF EXISTS directus_access_role_foreign;
ALTER TABLE IF EXISTS ONLY public.directus_access DROP CONSTRAINT IF EXISTS directus_access_policy_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations_translations DROP CONSTRAINT IF EXISTS destinations_translations_languages_code_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations_translations DROP CONSTRAINT IF EXISTS destinations_translations_destinations_id_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations DROP CONSTRAINT IF EXISTS destinations_region_id_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations DROP CONSTRAINT IF EXISTS destinations_province_id_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations DROP CONSTRAINT IF EXISTS destinations_image_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations_files DROP CONSTRAINT IF EXISTS destinations_files_directus_files_id_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations_files DROP CONSTRAINT IF EXISTS destinations_files_destinations_id_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations_articles DROP CONSTRAINT IF EXISTS destinations_articles_destinations_id_foreign;
ALTER TABLE IF EXISTS ONLY public.destinations_articles DROP CONSTRAINT IF EXISTS destinations_articles_articles_id_foreign;
ALTER TABLE IF EXISTS ONLY public.company_categories_translations DROP CONSTRAINT IF EXISTS company_categories_translations_languages_code_foreign;
ALTER TABLE IF EXISTS ONLY public.company_categories_translations DROP CONSTRAINT IF EXISTS company_categories_translations_company_ca__4ee84e6b_foreign;
ALTER TABLE IF EXISTS ONLY public.company_categories DROP CONSTRAINT IF EXISTS company_categories_image_foreign;
ALTER TABLE IF EXISTS ONLY public.companies_translations DROP CONSTRAINT IF EXISTS companies_translations_languages_code_foreign;
ALTER TABLE IF EXISTS ONLY public.companies_translations DROP CONSTRAINT IF EXISTS companies_translations_companies_id_foreign;
ALTER TABLE IF EXISTS ONLY public.companies_files DROP CONSTRAINT IF EXISTS companies_files_directus_files_id_foreign;
ALTER TABLE IF EXISTS ONLY public.companies_files DROP CONSTRAINT IF EXISTS companies_files_companies_id_foreign;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_featured_image_foreign;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_destination_id_foreign;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.categorias_translations DROP CONSTRAINT IF EXISTS categorias_translations_languages_code_foreign;
ALTER TABLE IF EXISTS ONLY public.categorias_translations DROP CONSTRAINT IF EXISTS categorias_translations_categorias_id_foreign;
ALTER TABLE IF EXISTS ONLY public.categorias DROP CONSTRAINT IF EXISTS categorias_image_foreign;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_user_updated_foreign;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_user_created_foreign;
ALTER TABLE IF EXISTS ONLY public.articles_translations DROP CONSTRAINT IF EXISTS articles_translations_languages_code_foreign;
ALTER TABLE IF EXISTS ONLY public.articles_translations DROP CONSTRAINT IF EXISTS articles_translations_articles_id_foreign;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_image_foreign;
ALTER TABLE IF EXISTS ONLY public.articles_files DROP CONSTRAINT IF EXISTS articles_files_directus_files_id_foreign;
ALTER TABLE IF EXISTS ONLY public.articles_files DROP CONSTRAINT IF EXISTS articles_files_articles_id_foreign;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_destination_id_foreign;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_category_id_foreign;
DROP INDEX IF EXISTS public.destinations_region_id_index;
DROP INDEX IF EXISTS public.destinations_province_id_index;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.translations DROP CONSTRAINT IF EXISTS translations_pkey;
ALTER TABLE IF EXISTS ONLY public.titles_translations DROP CONSTRAINT IF EXISTS titles_translations_pkey;
ALTER TABLE IF EXISTS ONLY public.titles DROP CONSTRAINT IF EXISTS titles_pkey;
ALTER TABLE IF EXISTS ONLY public.languages DROP CONSTRAINT IF EXISTS languages_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_webhooks DROP CONSTRAINT IF EXISTS directus_webhooks_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_versions DROP CONSTRAINT IF EXISTS directus_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_users DROP CONSTRAINT IF EXISTS directus_users_token_unique;
ALTER TABLE IF EXISTS ONLY public.directus_users DROP CONSTRAINT IF EXISTS directus_users_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_users DROP CONSTRAINT IF EXISTS directus_users_external_identifier_unique;
ALTER TABLE IF EXISTS ONLY public.directus_users DROP CONSTRAINT IF EXISTS directus_users_email_unique;
ALTER TABLE IF EXISTS ONLY public.directus_translations DROP CONSTRAINT IF EXISTS directus_translations_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_shares DROP CONSTRAINT IF EXISTS directus_shares_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_settings DROP CONSTRAINT IF EXISTS directus_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_sessions DROP CONSTRAINT IF EXISTS directus_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_roles DROP CONSTRAINT IF EXISTS directus_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_revisions DROP CONSTRAINT IF EXISTS directus_revisions_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_relations DROP CONSTRAINT IF EXISTS directus_relations_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_presets DROP CONSTRAINT IF EXISTS directus_presets_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_policies DROP CONSTRAINT IF EXISTS directus_policies_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_permissions DROP CONSTRAINT IF EXISTS directus_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_panels DROP CONSTRAINT IF EXISTS directus_panels_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_operations DROP CONSTRAINT IF EXISTS directus_operations_resolve_unique;
ALTER TABLE IF EXISTS ONLY public.directus_operations DROP CONSTRAINT IF EXISTS directus_operations_reject_unique;
ALTER TABLE IF EXISTS ONLY public.directus_operations DROP CONSTRAINT IF EXISTS directus_operations_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_notifications DROP CONSTRAINT IF EXISTS directus_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_migrations DROP CONSTRAINT IF EXISTS directus_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_folders DROP CONSTRAINT IF EXISTS directus_folders_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_flows DROP CONSTRAINT IF EXISTS directus_flows_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_flows DROP CONSTRAINT IF EXISTS directus_flows_operation_unique;
ALTER TABLE IF EXISTS ONLY public.directus_files DROP CONSTRAINT IF EXISTS directus_files_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_fields DROP CONSTRAINT IF EXISTS directus_fields_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_extensions DROP CONSTRAINT IF EXISTS directus_extensions_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_dashboards DROP CONSTRAINT IF EXISTS directus_dashboards_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_comments DROP CONSTRAINT IF EXISTS directus_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_collections DROP CONSTRAINT IF EXISTS directus_collections_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_activity DROP CONSTRAINT IF EXISTS directus_activity_pkey;
ALTER TABLE IF EXISTS ONLY public.directus_access DROP CONSTRAINT IF EXISTS directus_access_pkey;
ALTER TABLE IF EXISTS ONLY public.destinations_translations DROP CONSTRAINT IF EXISTS destinations_translations_pkey;
ALTER TABLE IF EXISTS ONLY public.destinations DROP CONSTRAINT IF EXISTS destinations_pkey;
ALTER TABLE IF EXISTS ONLY public.destinations_files DROP CONSTRAINT IF EXISTS destinations_files_pkey;
ALTER TABLE IF EXISTS ONLY public.destinations_articles DROP CONSTRAINT IF EXISTS destinations_articles_pkey;
ALTER TABLE IF EXISTS ONLY public.company_categories_translations DROP CONSTRAINT IF EXISTS company_categories_translations_pkey;
ALTER TABLE IF EXISTS ONLY public.company_categories DROP CONSTRAINT IF EXISTS company_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.companies_translations DROP CONSTRAINT IF EXISTS companies_translations_pkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_pkey;
ALTER TABLE IF EXISTS ONLY public.companies_files DROP CONSTRAINT IF EXISTS companies_files_pkey;
ALTER TABLE IF EXISTS ONLY public.categorias_translations DROP CONSTRAINT IF EXISTS categorias_translations_pkey;
ALTER TABLE IF EXISTS ONLY public.categorias DROP CONSTRAINT IF EXISTS categorias_pkey;
ALTER TABLE IF EXISTS ONLY public.articles_translations DROP CONSTRAINT IF EXISTS articles_translations_pkey;
ALTER TABLE IF EXISTS ONLY public.articles DROP CONSTRAINT IF EXISTS articles_pkey;
ALTER TABLE IF EXISTS ONLY public.articles_files DROP CONSTRAINT IF EXISTS articles_files_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.translations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.titles_translations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.titles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_webhooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_revisions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_relations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_presets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_fields ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.directus_activity ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.destinations_translations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.destinations_files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.destinations_articles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.destinations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.company_categories_translations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.company_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.companies_translations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.companies_files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.companies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categorias_translations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categorias ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.articles_translations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.articles_files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.articles ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.translations_id_seq;
DROP TABLE IF EXISTS public.translations;
DROP SEQUENCE IF EXISTS public.titles_translations_id_seq;
DROP TABLE IF EXISTS public.titles_translations;
DROP SEQUENCE IF EXISTS public.titles_id_seq;
DROP TABLE IF EXISTS public.titles;
DROP TABLE IF EXISTS public.languages;
DROP SEQUENCE IF EXISTS public.directus_webhooks_id_seq;
DROP TABLE IF EXISTS public.directus_webhooks;
DROP TABLE IF EXISTS public.directus_versions;
DROP TABLE IF EXISTS public.directus_users;
DROP TABLE IF EXISTS public.directus_translations;
DROP TABLE IF EXISTS public.directus_shares;
DROP SEQUENCE IF EXISTS public.directus_settings_id_seq;
DROP TABLE IF EXISTS public.directus_settings;
DROP TABLE IF EXISTS public.directus_sessions;
DROP TABLE IF EXISTS public.directus_roles;
DROP SEQUENCE IF EXISTS public.directus_revisions_id_seq;
DROP TABLE IF EXISTS public.directus_revisions;
DROP SEQUENCE IF EXISTS public.directus_relations_id_seq;
DROP TABLE IF EXISTS public.directus_relations;
DROP SEQUENCE IF EXISTS public.directus_presets_id_seq;
DROP TABLE IF EXISTS public.directus_presets;
DROP TABLE IF EXISTS public.directus_policies;
DROP SEQUENCE IF EXISTS public.directus_permissions_id_seq;
DROP TABLE IF EXISTS public.directus_permissions;
DROP TABLE IF EXISTS public.directus_panels;
DROP TABLE IF EXISTS public.directus_operations;
DROP SEQUENCE IF EXISTS public.directus_notifications_id_seq;
DROP TABLE IF EXISTS public.directus_notifications;
DROP TABLE IF EXISTS public.directus_migrations;
DROP TABLE IF EXISTS public.directus_folders;
DROP TABLE IF EXISTS public.directus_flows;
DROP TABLE IF EXISTS public.directus_files;
DROP SEQUENCE IF EXISTS public.directus_fields_id_seq;
DROP TABLE IF EXISTS public.directus_fields;
DROP TABLE IF EXISTS public.directus_extensions;
DROP TABLE IF EXISTS public.directus_dashboards;
DROP TABLE IF EXISTS public.directus_comments;
DROP TABLE IF EXISTS public.directus_collections;
DROP SEQUENCE IF EXISTS public.directus_activity_id_seq;
DROP TABLE IF EXISTS public.directus_activity;
DROP TABLE IF EXISTS public.directus_access;
DROP SEQUENCE IF EXISTS public.destinations_translations_id_seq;
DROP TABLE IF EXISTS public.destinations_translations;
DROP SEQUENCE IF EXISTS public.destinations_id_seq;
DROP SEQUENCE IF EXISTS public.destinations_files_id_seq;
DROP TABLE IF EXISTS public.destinations_files;
DROP SEQUENCE IF EXISTS public.destinations_articles_id_seq;
DROP TABLE IF EXISTS public.destinations_articles;
DROP TABLE IF EXISTS public.destinations;
DROP SEQUENCE IF EXISTS public.company_categories_translations_id_seq;
DROP TABLE IF EXISTS public.company_categories_translations;
DROP SEQUENCE IF EXISTS public.company_categories_id_seq;
DROP TABLE IF EXISTS public.company_categories;
DROP SEQUENCE IF EXISTS public.companies_translations_id_seq;
DROP TABLE IF EXISTS public.companies_translations;
DROP SEQUENCE IF EXISTS public.companies_id_seq;
DROP SEQUENCE IF EXISTS public.companies_files_id_seq;
DROP TABLE IF EXISTS public.companies_files;
DROP TABLE IF EXISTS public.companies;
DROP SEQUENCE IF EXISTS public.categorias_translations_id_seq;
DROP TABLE IF EXISTS public.categorias_translations;
DROP SEQUENCE IF EXISTS public.categorias_id_seq;
DROP TABLE IF EXISTS public.categorias;
DROP SEQUENCE IF EXISTS public.articles_translations_id_seq;
DROP TABLE IF EXISTS public.articles_translations;
DROP SEQUENCE IF EXISTS public.articles_id_seq;
DROP SEQUENCE IF EXISTS public.articles_files_id_seq;
DROP TABLE IF EXISTS public.articles_files;
DROP TABLE IF EXISTS public.articles;
DROP EXTENSION IF EXISTS postgis;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: thebest_italy_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO thebest_italy_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: thebest_italy_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    sort integer,
    user_created uuid,
    date_created timestamp with time zone,
    user_updated uuid,
    date_updated timestamp with time zone,
    image uuid,
    category_id integer,
    destination_id integer,
    featured_status character varying(255) DEFAULT 'none'::character varying
);


ALTER TABLE public.articles OWNER TO thebest_italy_user;

--
-- Name: articles_files; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.articles_files (
    id integer NOT NULL,
    articles_id integer,
    directus_files_id uuid
);


ALTER TABLE public.articles_files OWNER TO thebest_italy_user;

--
-- Name: articles_files_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.articles_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_files_id_seq OWNER TO thebest_italy_user;

--
-- Name: articles_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.articles_files_id_seq OWNED BY public.articles_files.id;


--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO thebest_italy_user;

--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: articles_translations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.articles_translations (
    id integer NOT NULL,
    articles_id integer,
    languages_code character varying(255),
    titolo_articolo character varying(255),
    seo_summary text,
    description text,
    slug_permalink character varying(255)
);


ALTER TABLE public.articles_translations OWNER TO thebest_italy_user;

--
-- Name: articles_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.articles_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_translations_id_seq OWNER TO thebest_italy_user;

--
-- Name: articles_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.articles_translations_id_seq OWNED BY public.articles_translations.id;


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nome_categoria character varying(255) NOT NULL,
    image uuid,
    visible boolean
);


ALTER TABLE public.categorias OWNER TO thebest_italy_user;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO thebest_italy_user;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: categorias_translations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.categorias_translations (
    id integer NOT NULL,
    categorias_id integer,
    languages_code character varying(255),
    nome_categoria character varying(255),
    seo_title character varying(255),
    seo_summary text,
    slug_permalink character varying(255)
);


ALTER TABLE public.categorias_translations OWNER TO thebest_italy_user;

--
-- Name: categorias_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.categorias_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_translations_id_seq OWNER TO thebest_italy_user;

--
-- Name: categorias_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.categorias_translations_id_seq OWNED BY public.categorias_translations.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    website character varying(255),
    email character varying(255),
    phone character varying(50),
    category_id integer,
    active boolean DEFAULT true,
    featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    socials jsonb,
    featured_image uuid,
    company_name character varying(255),
    slug_permalink character varying(255),
    destination_id integer,
    lat character varying(255),
    long character varying(255),
    featured_status character varying(255)
);


ALTER TABLE public.companies OWNER TO thebest_italy_user;

--
-- Name: companies_files; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.companies_files (
    id integer NOT NULL,
    companies_id integer,
    directus_files_id uuid
);


ALTER TABLE public.companies_files OWNER TO thebest_italy_user;

--
-- Name: companies_files_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.companies_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_files_id_seq OWNER TO thebest_italy_user;

--
-- Name: companies_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.companies_files_id_seq OWNED BY public.companies_files.id;


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO thebest_italy_user;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: companies_translations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.companies_translations (
    id integer NOT NULL,
    companies_id integer,
    languages_code character varying(255),
    seo_title character varying(255),
    seo_summary text,
    description text
);


ALTER TABLE public.companies_translations OWNER TO thebest_italy_user;

--
-- Name: companies_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.companies_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_translations_id_seq OWNER TO thebest_italy_user;

--
-- Name: companies_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.companies_translations_id_seq OWNED BY public.companies_translations.id;


--
-- Name: company_categories; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.company_categories (
    id integer NOT NULL,
    sort integer,
    image uuid,
    visible boolean,
    parent_id integer
);


ALTER TABLE public.company_categories OWNER TO thebest_italy_user;

--
-- Name: company_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.company_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_categories_id_seq OWNER TO thebest_italy_user;

--
-- Name: company_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.company_categories_id_seq OWNED BY public.company_categories.id;


--
-- Name: company_categories_translations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.company_categories_translations (
    id integer NOT NULL,
    company_categories_id integer,
    languages_code character varying(255),
    name character varying(255),
    seo_summary text,
    seo_title character varying(255),
    slug_permalink character varying(255)
);


ALTER TABLE public.company_categories_translations OWNER TO thebest_italy_user;

--
-- Name: company_categories_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.company_categories_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_categories_translations_id_seq OWNER TO thebest_italy_user;

--
-- Name: company_categories_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.company_categories_translations_id_seq OWNED BY public.company_categories_translations.id;


--
-- Name: destinations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.destinations (
    id integer NOT NULL,
    province_id integer,
    region_id integer,
    lat character varying(255),
    long character varying(255),
    image uuid,
    type character varying(255),
    featured_status character varying(255),
    featured_sort integer
);


ALTER TABLE public.destinations OWNER TO thebest_italy_user;

--
-- Name: destinations_articles; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.destinations_articles (
    id integer NOT NULL,
    destinations_id integer,
    articles_id integer
);


ALTER TABLE public.destinations_articles OWNER TO thebest_italy_user;

--
-- Name: destinations_articles_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.destinations_articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinations_articles_id_seq OWNER TO thebest_italy_user;

--
-- Name: destinations_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.destinations_articles_id_seq OWNED BY public.destinations_articles.id;


--
-- Name: destinations_files; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.destinations_files (
    id integer NOT NULL,
    destinations_id integer,
    directus_files_id uuid
);


ALTER TABLE public.destinations_files OWNER TO thebest_italy_user;

--
-- Name: destinations_files_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.destinations_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinations_files_id_seq OWNER TO thebest_italy_user;

--
-- Name: destinations_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.destinations_files_id_seq OWNED BY public.destinations_files.id;


--
-- Name: destinations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.destinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinations_id_seq OWNER TO thebest_italy_user;

--
-- Name: destinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.destinations_id_seq OWNED BY public.destinations.id;


--
-- Name: destinations_translations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.destinations_translations (
    id integer NOT NULL,
    destinations_id integer,
    languages_code character varying(255),
    seo_title character varying(255),
    seo_summary text,
    description text,
    slug_permalink character varying(255),
    destination_name character varying(255)
);


ALTER TABLE public.destinations_translations OWNER TO thebest_italy_user;

--
-- Name: destinations_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.destinations_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinations_translations_id_seq OWNER TO thebest_italy_user;

--
-- Name: destinations_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.destinations_translations_id_seq OWNED BY public.destinations_translations.id;


--
-- Name: directus_access; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_access (
    id uuid NOT NULL,
    role uuid,
    "user" uuid,
    policy uuid NOT NULL,
    sort integer
);


ALTER TABLE public.directus_access OWNER TO thebest_italy_user;

--
-- Name: directus_activity; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_activity (
    id integer NOT NULL,
    action character varying(45) NOT NULL,
    "user" uuid,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip character varying(50),
    user_agent text,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    origin character varying(255)
);


ALTER TABLE public.directus_activity OWNER TO thebest_italy_user;

--
-- Name: directus_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_activity_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_activity_id_seq OWNED BY public.directus_activity.id;


--
-- Name: directus_collections; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_collections (
    collection character varying(64) NOT NULL,
    icon character varying(64),
    note text,
    display_template character varying(255),
    hidden boolean DEFAULT false NOT NULL,
    singleton boolean DEFAULT false NOT NULL,
    translations json,
    archive_field character varying(64),
    archive_app_filter boolean DEFAULT true NOT NULL,
    archive_value character varying(255),
    unarchive_value character varying(255),
    sort_field character varying(64),
    accountability character varying(255) DEFAULT 'all'::character varying,
    color character varying(255),
    item_duplication_fields json,
    sort integer,
    "group" character varying(64),
    collapse character varying(255) DEFAULT 'open'::character varying NOT NULL,
    preview_url character varying(255),
    versioning boolean DEFAULT false NOT NULL
);


ALTER TABLE public.directus_collections OWNER TO thebest_italy_user;

--
-- Name: directus_comments; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_comments (
    id uuid NOT NULL,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    comment text NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    user_updated uuid
);


ALTER TABLE public.directus_comments OWNER TO thebest_italy_user;

--
-- Name: directus_dashboards; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_dashboards (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(64) DEFAULT 'dashboard'::character varying NOT NULL,
    note text,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    color character varying(255)
);


ALTER TABLE public.directus_dashboards OWNER TO thebest_italy_user;

--
-- Name: directus_extensions; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_extensions (
    enabled boolean DEFAULT true NOT NULL,
    id uuid NOT NULL,
    folder character varying(255) NOT NULL,
    source character varying(255) NOT NULL,
    bundle uuid
);


ALTER TABLE public.directus_extensions OWNER TO thebest_italy_user;

--
-- Name: directus_fields; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_fields (
    id integer NOT NULL,
    collection character varying(64) NOT NULL,
    field character varying(64) NOT NULL,
    special character varying(64),
    interface character varying(64),
    options json,
    display character varying(64),
    display_options json,
    readonly boolean DEFAULT false NOT NULL,
    hidden boolean DEFAULT false NOT NULL,
    sort integer,
    width character varying(30) DEFAULT 'full'::character varying,
    translations json,
    note text,
    conditions json,
    required boolean DEFAULT false,
    "group" character varying(64),
    validation json,
    validation_message text
);


ALTER TABLE public.directus_fields OWNER TO thebest_italy_user;

--
-- Name: directus_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_fields_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_fields_id_seq OWNED BY public.directus_fields.id;


--
-- Name: directus_files; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_files (
    id uuid NOT NULL,
    storage character varying(255) NOT NULL,
    filename_disk character varying(255),
    filename_download character varying(255) NOT NULL,
    title character varying(255),
    type character varying(255),
    folder uuid,
    uploaded_by uuid,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by uuid,
    modified_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    charset character varying(50),
    filesize bigint,
    width integer,
    height integer,
    duration integer,
    embed character varying(200),
    description text,
    location text,
    tags text,
    metadata json,
    focal_point_x integer,
    focal_point_y integer,
    tus_id character varying(64),
    tus_data json,
    uploaded_on timestamp with time zone
);


ALTER TABLE public.directus_files OWNER TO thebest_italy_user;

--
-- Name: directus_flows; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_flows (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(64),
    color character varying(255),
    description text,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    trigger character varying(255),
    accountability character varying(255) DEFAULT 'all'::character varying,
    options json,
    operation uuid,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_flows OWNER TO thebest_italy_user;

--
-- Name: directus_folders; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_folders (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    parent uuid
);


ALTER TABLE public.directus_folders OWNER TO thebest_italy_user;

--
-- Name: directus_migrations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_migrations (
    version character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.directus_migrations OWNER TO thebest_italy_user;

--
-- Name: directus_notifications; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_notifications (
    id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(255) DEFAULT 'inbox'::character varying,
    recipient uuid NOT NULL,
    sender uuid,
    subject character varying(255) NOT NULL,
    message text,
    collection character varying(64),
    item character varying(255)
);


ALTER TABLE public.directus_notifications OWNER TO thebest_italy_user;

--
-- Name: directus_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_notifications_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_notifications_id_seq OWNED BY public.directus_notifications.id;


--
-- Name: directus_operations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_operations (
    id uuid NOT NULL,
    name character varying(255),
    key character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    position_x integer NOT NULL,
    position_y integer NOT NULL,
    options json,
    resolve uuid,
    reject uuid,
    flow uuid NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_operations OWNER TO thebest_italy_user;

--
-- Name: directus_panels; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_panels (
    id uuid NOT NULL,
    dashboard uuid NOT NULL,
    name character varying(255),
    icon character varying(64) DEFAULT NULL::character varying,
    color character varying(10),
    show_header boolean DEFAULT false NOT NULL,
    note text,
    type character varying(255) NOT NULL,
    position_x integer NOT NULL,
    position_y integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    options json,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_panels OWNER TO thebest_italy_user;

--
-- Name: directus_permissions; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_permissions (
    id integer NOT NULL,
    collection character varying(64) NOT NULL,
    action character varying(10) NOT NULL,
    permissions json,
    validation json,
    presets json,
    fields text,
    policy uuid NOT NULL
);


ALTER TABLE public.directus_permissions OWNER TO thebest_italy_user;

--
-- Name: directus_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_permissions_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_permissions_id_seq OWNED BY public.directus_permissions.id;


--
-- Name: directus_policies; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_policies (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(64) DEFAULT 'badge'::character varying NOT NULL,
    description text,
    ip_access text,
    enforce_tfa boolean DEFAULT false NOT NULL,
    admin_access boolean DEFAULT false NOT NULL,
    app_access boolean DEFAULT false NOT NULL
);


ALTER TABLE public.directus_policies OWNER TO thebest_italy_user;

--
-- Name: directus_presets; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_presets (
    id integer NOT NULL,
    bookmark character varying(255),
    "user" uuid,
    role uuid,
    collection character varying(64),
    search character varying(100),
    layout character varying(100) DEFAULT 'tabular'::character varying,
    layout_query json,
    layout_options json,
    refresh_interval integer,
    filter json,
    icon character varying(64) DEFAULT 'bookmark'::character varying,
    color character varying(255)
);


ALTER TABLE public.directus_presets OWNER TO thebest_italy_user;

--
-- Name: directus_presets_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_presets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_presets_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_presets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_presets_id_seq OWNED BY public.directus_presets.id;


--
-- Name: directus_relations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_relations (
    id integer NOT NULL,
    many_collection character varying(64) NOT NULL,
    many_field character varying(64) NOT NULL,
    one_collection character varying(64),
    one_field character varying(64),
    one_collection_field character varying(64),
    one_allowed_collections text,
    junction_field character varying(64),
    sort_field character varying(64),
    one_deselect_action character varying(255) DEFAULT 'nullify'::character varying NOT NULL
);


ALTER TABLE public.directus_relations OWNER TO thebest_italy_user;

--
-- Name: directus_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_relations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_relations_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_relations_id_seq OWNED BY public.directus_relations.id;


--
-- Name: directus_revisions; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_revisions (
    id integer NOT NULL,
    activity integer NOT NULL,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    data json,
    delta json,
    parent integer,
    version uuid
);


ALTER TABLE public.directus_revisions OWNER TO thebest_italy_user;

--
-- Name: directus_revisions_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_revisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_revisions_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_revisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_revisions_id_seq OWNED BY public.directus_revisions.id;


--
-- Name: directus_roles; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_roles (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(64) DEFAULT 'supervised_user_circle'::character varying NOT NULL,
    description text,
    parent uuid
);


ALTER TABLE public.directus_roles OWNER TO thebest_italy_user;

--
-- Name: directus_sessions; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_sessions (
    token character varying(64) NOT NULL,
    "user" uuid,
    expires timestamp with time zone NOT NULL,
    ip character varying(255),
    user_agent text,
    share uuid,
    origin character varying(255),
    next_token character varying(64)
);


ALTER TABLE public.directus_sessions OWNER TO thebest_italy_user;

--
-- Name: directus_settings; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_settings (
    id integer NOT NULL,
    project_name character varying(100) DEFAULT 'Directus'::character varying NOT NULL,
    project_url character varying(255),
    project_color character varying(255) DEFAULT '#6644FF'::character varying NOT NULL,
    project_logo uuid,
    public_foreground uuid,
    public_background uuid,
    public_note text,
    auth_login_attempts integer DEFAULT 25,
    auth_password_policy character varying(100),
    storage_asset_transform character varying(7) DEFAULT 'all'::character varying,
    storage_asset_presets json,
    custom_css text,
    storage_default_folder uuid,
    basemaps json,
    mapbox_key character varying(255),
    module_bar json,
    project_descriptor character varying(100),
    default_language character varying(255) DEFAULT 'en-US'::character varying NOT NULL,
    custom_aspect_ratios json,
    public_favicon uuid,
    default_appearance character varying(255) DEFAULT 'auto'::character varying NOT NULL,
    default_theme_light character varying(255),
    theme_light_overrides json,
    default_theme_dark character varying(255),
    theme_dark_overrides json,
    report_error_url character varying(255),
    report_bug_url character varying(255),
    report_feature_url character varying(255),
    public_registration boolean DEFAULT false NOT NULL,
    public_registration_verify_email boolean DEFAULT true NOT NULL,
    public_registration_role uuid,
    public_registration_email_filter json,
    visual_editor_urls json
);


ALTER TABLE public.directus_settings OWNER TO thebest_italy_user;

--
-- Name: directus_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_settings_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_settings_id_seq OWNED BY public.directus_settings.id;


--
-- Name: directus_shares; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_shares (
    id uuid NOT NULL,
    name character varying(255),
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    role uuid,
    password character varying(255),
    user_created uuid,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_start timestamp with time zone,
    date_end timestamp with time zone,
    times_used integer DEFAULT 0,
    max_uses integer
);


ALTER TABLE public.directus_shares OWNER TO thebest_italy_user;

--
-- Name: directus_translations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_translations (
    id uuid NOT NULL,
    language character varying(255) NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.directus_translations OWNER TO thebest_italy_user;

--
-- Name: directus_users; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_users (
    id uuid NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(128),
    password character varying(255),
    location character varying(255),
    title character varying(50),
    description text,
    tags json,
    avatar uuid,
    language character varying(255) DEFAULT NULL::character varying,
    tfa_secret character varying(255),
    status character varying(16) DEFAULT 'active'::character varying NOT NULL,
    role uuid,
    token character varying(255),
    last_access timestamp with time zone,
    last_page character varying(255),
    provider character varying(128) DEFAULT 'default'::character varying NOT NULL,
    external_identifier character varying(255),
    auth_data json,
    email_notifications boolean DEFAULT true,
    appearance character varying(255),
    theme_dark character varying(255),
    theme_light character varying(255),
    theme_light_overrides json,
    theme_dark_overrides json
);


ALTER TABLE public.directus_users OWNER TO thebest_italy_user;

--
-- Name: directus_versions; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_versions (
    id uuid NOT NULL,
    key character varying(64) NOT NULL,
    name character varying(255),
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    hash character varying(255),
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    user_updated uuid,
    delta json
);


ALTER TABLE public.directus_versions OWNER TO thebest_italy_user;

--
-- Name: directus_webhooks; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.directus_webhooks (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    method character varying(10) DEFAULT 'POST'::character varying NOT NULL,
    url character varying(255) NOT NULL,
    status character varying(10) DEFAULT 'active'::character varying NOT NULL,
    data boolean DEFAULT true NOT NULL,
    actions character varying(100) NOT NULL,
    collections character varying(255) NOT NULL,
    headers json,
    was_active_before_deprecation boolean DEFAULT false NOT NULL,
    migrated_flow uuid
);


ALTER TABLE public.directus_webhooks OWNER TO thebest_italy_user;

--
-- Name: directus_webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.directus_webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_webhooks_id_seq OWNER TO thebest_italy_user;

--
-- Name: directus_webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.directus_webhooks_id_seq OWNED BY public.directus_webhooks.id;


--
-- Name: languages; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.languages (
    code character varying(255) NOT NULL,
    name character varying(255),
    direction character varying(255) DEFAULT 'ltr'::character varying,
    sort integer
);


ALTER TABLE public.languages OWNER TO thebest_italy_user;

--
-- Name: titles; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.titles (
    id integer NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    sort integer,
    title character varying(255)
);


ALTER TABLE public.titles OWNER TO thebest_italy_user;

--
-- Name: titles_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.titles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.titles_id_seq OWNER TO thebest_italy_user;

--
-- Name: titles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.titles_id_seq OWNED BY public.titles.id;


--
-- Name: titles_translations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.titles_translations (
    id integer NOT NULL,
    titles_id integer,
    languages_code character varying(255),
    title character varying(255),
    seo_title character varying(255),
    seo_summary text
);


ALTER TABLE public.titles_translations OWNER TO thebest_italy_user;

--
-- Name: titles_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.titles_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.titles_translations_id_seq OWNER TO thebest_italy_user;

--
-- Name: titles_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.titles_translations_id_seq OWNED BY public.titles_translations.id;


--
-- Name: translations; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.translations (
    id integer NOT NULL,
    language character varying(255),
    section character varying(255),
    content text
);


ALTER TABLE public.translations OWNER TO thebest_italy_user;

--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translations_id_seq OWNER TO thebest_italy_user;

--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: thebest_italy_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    username character varying(255)
);


ALTER TABLE public.users OWNER TO thebest_italy_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: thebest_italy_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO thebest_italy_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: thebest_italy_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: articles_files id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles_files ALTER COLUMN id SET DEFAULT nextval('public.articles_files_id_seq'::regclass);


--
-- Name: articles_translations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles_translations ALTER COLUMN id SET DEFAULT nextval('public.articles_translations_id_seq'::regclass);


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: categorias_translations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.categorias_translations ALTER COLUMN id SET DEFAULT nextval('public.categorias_translations_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: companies_files id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies_files ALTER COLUMN id SET DEFAULT nextval('public.companies_files_id_seq'::regclass);


--
-- Name: companies_translations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies_translations ALTER COLUMN id SET DEFAULT nextval('public.companies_translations_id_seq'::regclass);


--
-- Name: company_categories id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.company_categories ALTER COLUMN id SET DEFAULT nextval('public.company_categories_id_seq'::regclass);


--
-- Name: company_categories_translations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.company_categories_translations ALTER COLUMN id SET DEFAULT nextval('public.company_categories_translations_id_seq'::regclass);


--
-- Name: destinations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations ALTER COLUMN id SET DEFAULT nextval('public.destinations_id_seq'::regclass);


--
-- Name: destinations_articles id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_articles ALTER COLUMN id SET DEFAULT nextval('public.destinations_articles_id_seq'::regclass);


--
-- Name: destinations_files id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_files ALTER COLUMN id SET DEFAULT nextval('public.destinations_files_id_seq'::regclass);


--
-- Name: destinations_translations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_translations ALTER COLUMN id SET DEFAULT nextval('public.destinations_translations_id_seq'::regclass);


--
-- Name: directus_activity id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_activity ALTER COLUMN id SET DEFAULT nextval('public.directus_activity_id_seq'::regclass);


--
-- Name: directus_fields id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_fields ALTER COLUMN id SET DEFAULT nextval('public.directus_fields_id_seq'::regclass);


--
-- Name: directus_notifications id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_notifications ALTER COLUMN id SET DEFAULT nextval('public.directus_notifications_id_seq'::regclass);


--
-- Name: directus_permissions id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_permissions ALTER COLUMN id SET DEFAULT nextval('public.directus_permissions_id_seq'::regclass);


--
-- Name: directus_presets id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_presets ALTER COLUMN id SET DEFAULT nextval('public.directus_presets_id_seq'::regclass);


--
-- Name: directus_relations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_relations ALTER COLUMN id SET DEFAULT nextval('public.directus_relations_id_seq'::regclass);


--
-- Name: directus_revisions id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_revisions ALTER COLUMN id SET DEFAULT nextval('public.directus_revisions_id_seq'::regclass);


--
-- Name: directus_settings id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_settings ALTER COLUMN id SET DEFAULT nextval('public.directus_settings_id_seq'::regclass);


--
-- Name: directus_webhooks id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_webhooks ALTER COLUMN id SET DEFAULT nextval('public.directus_webhooks_id_seq'::regclass);


--
-- Name: titles id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.titles ALTER COLUMN id SET DEFAULT nextval('public.titles_id_seq'::regclass);


--
-- Name: titles_translations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.titles_translations ALTER COLUMN id SET DEFAULT nextval('public.titles_translations_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: articles_files articles_files_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles_files
    ADD CONSTRAINT articles_files_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: articles_translations articles_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles_translations
    ADD CONSTRAINT articles_translations_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: categorias_translations categorias_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.categorias_translations
    ADD CONSTRAINT categorias_translations_pkey PRIMARY KEY (id);


--
-- Name: companies_files companies_files_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies_files
    ADD CONSTRAINT companies_files_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies_translations companies_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies_translations
    ADD CONSTRAINT companies_translations_pkey PRIMARY KEY (id);


--
-- Name: company_categories company_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.company_categories
    ADD CONSTRAINT company_categories_pkey PRIMARY KEY (id);


--
-- Name: company_categories_translations company_categories_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.company_categories_translations
    ADD CONSTRAINT company_categories_translations_pkey PRIMARY KEY (id);


--
-- Name: destinations_articles destinations_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_articles
    ADD CONSTRAINT destinations_articles_pkey PRIMARY KEY (id);


--
-- Name: destinations_files destinations_files_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_files
    ADD CONSTRAINT destinations_files_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- Name: destinations_translations destinations_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_translations
    ADD CONSTRAINT destinations_translations_pkey PRIMARY KEY (id);


--
-- Name: directus_access directus_access_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_pkey PRIMARY KEY (id);


--
-- Name: directus_activity directus_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_activity
    ADD CONSTRAINT directus_activity_pkey PRIMARY KEY (id);


--
-- Name: directus_collections directus_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_collections
    ADD CONSTRAINT directus_collections_pkey PRIMARY KEY (collection);


--
-- Name: directus_comments directus_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_pkey PRIMARY KEY (id);


--
-- Name: directus_dashboards directus_dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_dashboards
    ADD CONSTRAINT directus_dashboards_pkey PRIMARY KEY (id);


--
-- Name: directus_extensions directus_extensions_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_extensions
    ADD CONSTRAINT directus_extensions_pkey PRIMARY KEY (id);


--
-- Name: directus_fields directus_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_fields
    ADD CONSTRAINT directus_fields_pkey PRIMARY KEY (id);


--
-- Name: directus_files directus_files_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_pkey PRIMARY KEY (id);


--
-- Name: directus_flows directus_flows_operation_unique; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_operation_unique UNIQUE (operation);


--
-- Name: directus_flows directus_flows_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_pkey PRIMARY KEY (id);


--
-- Name: directus_folders directus_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_folders
    ADD CONSTRAINT directus_folders_pkey PRIMARY KEY (id);


--
-- Name: directus_migrations directus_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_migrations
    ADD CONSTRAINT directus_migrations_pkey PRIMARY KEY (version);


--
-- Name: directus_notifications directus_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_pkey PRIMARY KEY (id);


--
-- Name: directus_operations directus_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_pkey PRIMARY KEY (id);


--
-- Name: directus_operations directus_operations_reject_unique; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_reject_unique UNIQUE (reject);


--
-- Name: directus_operations directus_operations_resolve_unique; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_resolve_unique UNIQUE (resolve);


--
-- Name: directus_panels directus_panels_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_pkey PRIMARY KEY (id);


--
-- Name: directus_permissions directus_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_permissions
    ADD CONSTRAINT directus_permissions_pkey PRIMARY KEY (id);


--
-- Name: directus_policies directus_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_policies
    ADD CONSTRAINT directus_policies_pkey PRIMARY KEY (id);


--
-- Name: directus_presets directus_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_pkey PRIMARY KEY (id);


--
-- Name: directus_relations directus_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_relations
    ADD CONSTRAINT directus_relations_pkey PRIMARY KEY (id);


--
-- Name: directus_revisions directus_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_pkey PRIMARY KEY (id);


--
-- Name: directus_roles directus_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_roles
    ADD CONSTRAINT directus_roles_pkey PRIMARY KEY (id);


--
-- Name: directus_sessions directus_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_pkey PRIMARY KEY (token);


--
-- Name: directus_settings directus_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_pkey PRIMARY KEY (id);


--
-- Name: directus_shares directus_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_pkey PRIMARY KEY (id);


--
-- Name: directus_translations directus_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_translations
    ADD CONSTRAINT directus_translations_pkey PRIMARY KEY (id);


--
-- Name: directus_users directus_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_email_unique UNIQUE (email);


--
-- Name: directus_users directus_users_external_identifier_unique; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_external_identifier_unique UNIQUE (external_identifier);


--
-- Name: directus_users directus_users_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_pkey PRIMARY KEY (id);


--
-- Name: directus_users directus_users_token_unique; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_token_unique UNIQUE (token);


--
-- Name: directus_versions directus_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_pkey PRIMARY KEY (id);


--
-- Name: directus_webhooks directus_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_webhooks
    ADD CONSTRAINT directus_webhooks_pkey PRIMARY KEY (id);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (code);


--
-- Name: titles titles_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.titles
    ADD CONSTRAINT titles_pkey PRIMARY KEY (id);


--
-- Name: titles_translations titles_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.titles_translations
    ADD CONSTRAINT titles_translations_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: destinations_province_id_index; Type: INDEX; Schema: public; Owner: thebest_italy_user
--

CREATE INDEX destinations_province_id_index ON public.destinations USING btree (province_id);


--
-- Name: destinations_region_id_index; Type: INDEX; Schema: public; Owner: thebest_italy_user
--

CREATE INDEX destinations_region_id_index ON public.destinations USING btree (region_id);


--
-- Name: articles articles_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- Name: articles articles_destination_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_destination_id_foreign FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE SET NULL;


--
-- Name: articles_files articles_files_articles_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles_files
    ADD CONSTRAINT articles_files_articles_id_foreign FOREIGN KEY (articles_id) REFERENCES public.articles(id) ON DELETE SET NULL;


--
-- Name: articles_files articles_files_directus_files_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles_files
    ADD CONSTRAINT articles_files_directus_files_id_foreign FOREIGN KEY (directus_files_id) REFERENCES public.directus_files(id) ON DELETE SET NULL;


--
-- Name: articles articles_image_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_image_foreign FOREIGN KEY (image) REFERENCES public.directus_files(id) ON DELETE SET NULL;


--
-- Name: articles_translations articles_translations_articles_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles_translations
    ADD CONSTRAINT articles_translations_articles_id_foreign FOREIGN KEY (articles_id) REFERENCES public.articles(id) ON DELETE SET NULL;


--
-- Name: articles_translations articles_translations_languages_code_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles_translations
    ADD CONSTRAINT articles_translations_languages_code_foreign FOREIGN KEY (languages_code) REFERENCES public.languages(code) ON DELETE SET NULL;


--
-- Name: articles articles_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id);


--
-- Name: articles articles_user_updated_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_user_updated_foreign FOREIGN KEY (user_updated) REFERENCES public.directus_users(id);


--
-- Name: categorias categorias_image_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_image_foreign FOREIGN KEY (image) REFERENCES public.directus_files(id) ON DELETE SET NULL;


--
-- Name: categorias_translations categorias_translations_categorias_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.categorias_translations
    ADD CONSTRAINT categorias_translations_categorias_id_foreign FOREIGN KEY (categorias_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- Name: categorias_translations categorias_translations_languages_code_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.categorias_translations
    ADD CONSTRAINT categorias_translations_languages_code_foreign FOREIGN KEY (languages_code) REFERENCES public.languages(code) ON DELETE SET NULL;


--
-- Name: companies companies_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.company_categories(id);


--
-- Name: companies companies_destination_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_destination_id_foreign FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE SET NULL;


--
-- Name: companies companies_featured_image_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_featured_image_foreign FOREIGN KEY (featured_image) REFERENCES public.directus_files(id) ON DELETE SET NULL;


--
-- Name: companies_files companies_files_companies_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies_files
    ADD CONSTRAINT companies_files_companies_id_foreign FOREIGN KEY (companies_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: companies_files companies_files_directus_files_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies_files
    ADD CONSTRAINT companies_files_directus_files_id_foreign FOREIGN KEY (directus_files_id) REFERENCES public.directus_files(id) ON DELETE SET NULL;


--
-- Name: companies_translations companies_translations_companies_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies_translations
    ADD CONSTRAINT companies_translations_companies_id_foreign FOREIGN KEY (companies_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: companies_translations companies_translations_languages_code_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.companies_translations
    ADD CONSTRAINT companies_translations_languages_code_foreign FOREIGN KEY (languages_code) REFERENCES public.languages(code) ON DELETE SET NULL;


--
-- Name: company_categories company_categories_image_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.company_categories
    ADD CONSTRAINT company_categories_image_foreign FOREIGN KEY (image) REFERENCES public.directus_files(id) ON DELETE SET NULL;


--
-- Name: company_categories_translations company_categories_translations_company_ca__4ee84e6b_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.company_categories_translations
    ADD CONSTRAINT company_categories_translations_company_ca__4ee84e6b_foreign FOREIGN KEY (company_categories_id) REFERENCES public.company_categories(id) ON DELETE SET NULL;


--
-- Name: company_categories_translations company_categories_translations_languages_code_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.company_categories_translations
    ADD CONSTRAINT company_categories_translations_languages_code_foreign FOREIGN KEY (languages_code) REFERENCES public.languages(code) ON DELETE SET NULL;


--
-- Name: destinations_articles destinations_articles_articles_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_articles
    ADD CONSTRAINT destinations_articles_articles_id_foreign FOREIGN KEY (articles_id) REFERENCES public.articles(id) ON DELETE SET NULL;


--
-- Name: destinations_articles destinations_articles_destinations_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_articles
    ADD CONSTRAINT destinations_articles_destinations_id_foreign FOREIGN KEY (destinations_id) REFERENCES public.destinations(id) ON DELETE SET NULL;


--
-- Name: destinations_files destinations_files_destinations_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_files
    ADD CONSTRAINT destinations_files_destinations_id_foreign FOREIGN KEY (destinations_id) REFERENCES public.destinations(id) ON DELETE SET NULL;


--
-- Name: destinations_files destinations_files_directus_files_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_files
    ADD CONSTRAINT destinations_files_directus_files_id_foreign FOREIGN KEY (directus_files_id) REFERENCES public.directus_files(id) ON DELETE SET NULL;


--
-- Name: destinations destinations_image_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_image_foreign FOREIGN KEY (image) REFERENCES public.directus_files(id) ON DELETE SET NULL;


--
-- Name: destinations destinations_province_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_province_id_foreign FOREIGN KEY (province_id) REFERENCES public.destinations(id);


--
-- Name: destinations destinations_region_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_region_id_foreign FOREIGN KEY (region_id) REFERENCES public.destinations(id);


--
-- Name: destinations_translations destinations_translations_destinations_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_translations
    ADD CONSTRAINT destinations_translations_destinations_id_foreign FOREIGN KEY (destinations_id) REFERENCES public.destinations(id) ON DELETE SET NULL;


--
-- Name: destinations_translations destinations_translations_languages_code_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.destinations_translations
    ADD CONSTRAINT destinations_translations_languages_code_foreign FOREIGN KEY (languages_code) REFERENCES public.languages(code) ON DELETE SET NULL;


--
-- Name: directus_access directus_access_policy_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_policy_foreign FOREIGN KEY (policy) REFERENCES public.directus_policies(id) ON DELETE CASCADE;


--
-- Name: directus_access directus_access_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_access directus_access_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_collections directus_collections_group_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_collections
    ADD CONSTRAINT directus_collections_group_foreign FOREIGN KEY ("group") REFERENCES public.directus_collections(collection);


--
-- Name: directus_comments directus_comments_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_comments directus_comments_user_updated_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_user_updated_foreign FOREIGN KEY (user_updated) REFERENCES public.directus_users(id);


--
-- Name: directus_dashboards directus_dashboards_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_dashboards
    ADD CONSTRAINT directus_dashboards_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_files directus_files_folder_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_folder_foreign FOREIGN KEY (folder) REFERENCES public.directus_folders(id) ON DELETE SET NULL;


--
-- Name: directus_files directus_files_modified_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_modified_by_foreign FOREIGN KEY (modified_by) REFERENCES public.directus_users(id);


--
-- Name: directus_files directus_files_uploaded_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_uploaded_by_foreign FOREIGN KEY (uploaded_by) REFERENCES public.directus_users(id);


--
-- Name: directus_flows directus_flows_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_folders directus_folders_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_folders
    ADD CONSTRAINT directus_folders_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_folders(id);


--
-- Name: directus_notifications directus_notifications_recipient_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_recipient_foreign FOREIGN KEY (recipient) REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_notifications directus_notifications_sender_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_sender_foreign FOREIGN KEY (sender) REFERENCES public.directus_users(id);


--
-- Name: directus_operations directus_operations_flow_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_flow_foreign FOREIGN KEY (flow) REFERENCES public.directus_flows(id) ON DELETE CASCADE;


--
-- Name: directus_operations directus_operations_reject_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_reject_foreign FOREIGN KEY (reject) REFERENCES public.directus_operations(id);


--
-- Name: directus_operations directus_operations_resolve_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_resolve_foreign FOREIGN KEY (resolve) REFERENCES public.directus_operations(id);


--
-- Name: directus_operations directus_operations_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_panels directus_panels_dashboard_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_dashboard_foreign FOREIGN KEY (dashboard) REFERENCES public.directus_dashboards(id) ON DELETE CASCADE;


--
-- Name: directus_panels directus_panels_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_permissions directus_permissions_policy_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_permissions
    ADD CONSTRAINT directus_permissions_policy_foreign FOREIGN KEY (policy) REFERENCES public.directus_policies(id) ON DELETE CASCADE;


--
-- Name: directus_presets directus_presets_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_presets directus_presets_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_revisions directus_revisions_activity_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_activity_foreign FOREIGN KEY (activity) REFERENCES public.directus_activity(id) ON DELETE CASCADE;


--
-- Name: directus_revisions directus_revisions_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_revisions(id);


--
-- Name: directus_revisions directus_revisions_version_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_version_foreign FOREIGN KEY (version) REFERENCES public.directus_versions(id) ON DELETE CASCADE;


--
-- Name: directus_roles directus_roles_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_roles
    ADD CONSTRAINT directus_roles_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_roles(id);


--
-- Name: directus_sessions directus_sessions_share_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_share_foreign FOREIGN KEY (share) REFERENCES public.directus_shares(id) ON DELETE CASCADE;


--
-- Name: directus_sessions directus_sessions_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_settings directus_settings_project_logo_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_project_logo_foreign FOREIGN KEY (project_logo) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_background_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_background_foreign FOREIGN KEY (public_background) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_favicon_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_favicon_foreign FOREIGN KEY (public_favicon) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_foreground_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_foreground_foreign FOREIGN KEY (public_foreground) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_registration_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_registration_role_foreign FOREIGN KEY (public_registration_role) REFERENCES public.directus_roles(id) ON DELETE SET NULL;


--
-- Name: directus_settings directus_settings_storage_default_folder_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_storage_default_folder_foreign FOREIGN KEY (storage_default_folder) REFERENCES public.directus_folders(id) ON DELETE SET NULL;


--
-- Name: directus_shares directus_shares_collection_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_collection_foreign FOREIGN KEY (collection) REFERENCES public.directus_collections(collection) ON DELETE CASCADE;


--
-- Name: directus_shares directus_shares_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_shares directus_shares_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_users directus_users_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE SET NULL;


--
-- Name: directus_versions directus_versions_collection_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_collection_foreign FOREIGN KEY (collection) REFERENCES public.directus_collections(collection) ON DELETE CASCADE;


--
-- Name: directus_versions directus_versions_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_versions directus_versions_user_updated_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_user_updated_foreign FOREIGN KEY (user_updated) REFERENCES public.directus_users(id);


--
-- Name: directus_webhooks directus_webhooks_migrated_flow_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.directus_webhooks
    ADD CONSTRAINT directus_webhooks_migrated_flow_foreign FOREIGN KEY (migrated_flow) REFERENCES public.directus_flows(id) ON DELETE SET NULL;


--
-- Name: titles_translations titles_translations_languages_code_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.titles_translations
    ADD CONSTRAINT titles_translations_languages_code_foreign FOREIGN KEY (languages_code) REFERENCES public.languages(code) ON DELETE SET NULL;


--
-- Name: titles_translations titles_translations_titles_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: thebest_italy_user
--

ALTER TABLE ONLY public.titles_translations
    ADD CONSTRAINT titles_translations_titles_id_foreign FOREIGN KEY (titles_id) REFERENCES public.titles(id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: thebest_italy_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

