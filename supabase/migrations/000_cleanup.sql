-- ============================================================================
-- Comprehensive Cleanup Script: Drop all existing policies and triggers
-- This script is idempotent and safe to run multiple times
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies from all tables in public schema
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
    END LOOP;

    -- Drop all triggers from all tables in public schema
    FOR r IN (
        SELECT trigger_schema, event_object_table, trigger_name
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I',
            r.trigger_name, r.trigger_schema, r.event_object_table);
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if tables don't exist yet
        RAISE NOTICE 'Cleanup error (ignoring): %', SQLERRM;
END $$;
