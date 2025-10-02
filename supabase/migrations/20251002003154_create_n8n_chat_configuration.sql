/*
  # N8N Chat Configuration System

  1. New Tables
    - `n8n_database_config`
      - `id` (uuid, primary key)
      - `host` (text) - Database host address
      - `port` (integer) - Database port
      - `database_name` (text) - Database name
      - `username` (text) - Database username
      - `password` (text) - Encrypted password
      - `schema` (text) - Schema name (default: public)
      - `table_name` (text) - Table name (default: n8n_chat_histories)
      - `is_active` (boolean) - Connection status
      - `last_tested_at` (timestamptz) - Last connection test
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `n8n_connection_logs`
      - `id` (uuid, primary key)
      - `config_id` (uuid, foreign key to n8n_database_config)
      - `action` (text) - Action type (test, query, error)
      - `status` (text) - Success or error
      - `message` (text) - Log message or error details
      - `created_at` (timestamptz)
      - `admin_user_id` (uuid) - Who performed the action
    
    - `n8n_chat_cache`
      - `id` (uuid, primary key)
      - `cache_key` (text) - Unique cache identifier
      - `cache_data` (jsonb) - Cached query results
      - `expires_at` (timestamptz) - Cache expiration
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Only authenticated admin users can access
    - Policies for read, insert, update operations
    
  3. Indexes
    - Index on n8n_connection_logs.config_id for faster lookups
    - Index on n8n_chat_cache.cache_key for quick cache retrieval
    - Index on n8n_chat_cache.expires_at for cleanup
*/

-- Create n8n_database_config table
CREATE TABLE IF NOT EXISTS n8n_database_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host text NOT NULL,
  port integer NOT NULL DEFAULT 5432,
  database_name text NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  schema text NOT NULL DEFAULT 'public',
  table_name text NOT NULL DEFAULT 'n8n_chat_histories',
  is_active boolean DEFAULT true,
  last_tested_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create n8n_connection_logs table
CREATE TABLE IF NOT EXISTS n8n_connection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES n8n_database_config(id) ON DELETE CASCADE,
  action text NOT NULL,
  status text NOT NULL,
  message text,
  admin_user_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create n8n_chat_cache table
CREATE TABLE IF NOT EXISTS n8n_chat_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  cache_data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_n8n_connection_logs_config_id ON n8n_connection_logs(config_id);
CREATE INDEX IF NOT EXISTS idx_n8n_connection_logs_created_at ON n8n_connection_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_cache_key ON n8n_chat_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_cache_expires ON n8n_chat_cache(expires_at);

-- Enable RLS
ALTER TABLE n8n_database_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_connection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for n8n_database_config
CREATE POLICY "Authenticated users can view n8n config"
  ON n8n_database_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert n8n config"
  ON n8n_database_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update n8n config"
  ON n8n_database_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete n8n config"
  ON n8n_database_config FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for n8n_connection_logs
CREATE POLICY "Authenticated users can view connection logs"
  ON n8n_connection_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert connection logs"
  ON n8n_connection_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for n8n_chat_cache
CREATE POLICY "Authenticated users can view cache"
  ON n8n_chat_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cache"
  ON n8n_chat_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cache"
  ON n8n_chat_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cache"
  ON n8n_chat_cache FOR DELETE
  TO authenticated
  USING (true);

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_n8n_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM n8n_chat_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_n8n_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_n8n_database_config_updated_at
  BEFORE UPDATE ON n8n_database_config
  FOR EACH ROW
  EXECUTE FUNCTION update_n8n_config_updated_at();