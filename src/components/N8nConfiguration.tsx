import React, { useState, useEffect } from 'react';
import {
  Database, Save, TestTube, AlertCircle, CheckCircle, Loader,
  Eye, EyeOff, Info, Lock, Server, Key
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ConfigData {
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  schema: string;
  table_name: string;
}

const N8nConfiguration: React.FC = () => {
  const [config, setConfig] = useState<ConfigData>({
    host: 'localhost',
    port: 5432,
    database_name: '',
    username: '',
    password: '',
    schema: 'public',
    table_name: 'n8n_chat_histories',
  });
  const [existingConfigId, setExistingConfigId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    recordCount?: number;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadExistingConfiguration();
  }, []);

  const loadExistingConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_database_config')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingConfigId(data.id);
        setConfig({
          host: data.host,
          port: data.port,
          database_name: data.database_name,
          username: data.username,
          password: data.password,
          schema: data.schema,
          table_name: data.table_name,
        });
      }
    } catch (err) {
      console.error('Error loading configuration:', err);
    }
  };

  const handleInputChange = (field: keyof ConfigData, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
    setSaveMessage(null);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // First save the config temporarily to test it
      let configId = existingConfigId;

      if (!configId) {
        const { data, error } = await supabase
          .from('n8n_database_config')
          .insert({
            ...config,
            is_active: false,
          })
          .select()
          .single();

        if (error) throw error;
        configId = data.id;
        setExistingConfigId(configId);
      } else {
        const { error } = await supabase
          .from('n8n_database_config')
          .update(config)
          .eq('id', configId);

        if (error) throw error;
      }

      // Now test the connection via edge function
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-chat-proxy?action=test_connection`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: result.data.message,
          recordCount: result.data.record_count,
        });

        // Update last_tested_at
        await supabase
          .from('n8n_database_config')
          .update({ last_tested_at: new Date().toISOString() })
          .eq('id', configId);
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Connection test failed',
        });
      }
    } catch (err) {
      console.error('Error testing connection:', err);
      setTestResult({
        success: false,
        message: err.message || 'Failed to test connection',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      if (existingConfigId) {
        // Update existing configuration
        const { error } = await supabase
          .from('n8n_database_config')
          .update({
            ...config,
            is_active: true,
          })
          .eq('id', existingConfigId);

        if (error) throw error;
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from('n8n_database_config')
          .insert({
            ...config,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        setExistingConfigId(data.id);
      }

      setSaveMessage({
        type: 'success',
        text: 'Configuration saved successfully!',
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setSaveMessage({
        type: 'error',
        text: err.message || 'Failed to save configuration',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      config.host &&
      config.port &&
      config.database_name &&
      config.username &&
      config.password &&
      config.schema &&
      config.table_name
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">N8N Database Configuration</h2>
            <p className="text-white/60 text-sm">
              Configure connection to your n8n chat histories database
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">Important Information</p>
            <p>
              This configuration allows the admin panel to connect to your PostgreSQL database
              where n8n stores WhatsApp chat histories. Ensure the database is accessible from
              this server and credentials are correct.
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-6">
          {/* Host */}
          <div>
            <label className="flex items-center text-white font-medium mb-2">
              <Server className="w-4 h-4 mr-2" />
              Database Host
            </label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => handleInputChange('host', e.target.value)}
              placeholder="localhost or IP address"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-white/60 text-sm mt-1">
              The hostname or IP address of your PostgreSQL server
            </p>
          </div>

          {/* Port */}
          <div>
            <label className="flex items-center text-white font-medium mb-2">
              <Server className="w-4 h-4 mr-2" />
              Port
            </label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 5432)}
              placeholder="5432"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-white/60 text-sm mt-1">
              PostgreSQL port (default: 5432)
            </p>
          </div>

          {/* Database Name */}
          <div>
            <label className="flex items-center text-white font-medium mb-2">
              <Database className="w-4 h-4 mr-2" />
              Database Name
            </label>
            <input
              type="text"
              value={config.database_name}
              onChange={(e) => handleInputChange('database_name', e.target.value)}
              placeholder="n8n"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-white/60 text-sm mt-1">
              The name of your PostgreSQL database
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="flex items-center text-white font-medium mb-2">
              <Key className="w-4 h-4 mr-2" />
              Username
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="postgres"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-white/60 text-sm mt-1">
              Database user with read access to chat histories
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center text-white font-medium mb-2">
              <Lock className="w-4 h-4 mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Database password (stored encrypted)
            </p>
          </div>

          {/* Schema */}
          <div>
            <label className="flex items-center text-white font-medium mb-2">
              <Database className="w-4 h-4 mr-2" />
              Schema
            </label>
            <input
              type="text"
              value={config.schema}
              onChange={(e) => handleInputChange('schema', e.target.value)}
              placeholder="public"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-white/60 text-sm mt-1">
              Database schema (usually "public")
            </p>
          </div>

          {/* Table Name */}
          <div>
            <label className="flex items-center text-white font-medium mb-2">
              <Database className="w-4 h-4 mr-2" />
              Table Name
            </label>
            <input
              type="text"
              value={config.table_name}
              onChange={(e) => handleInputChange('table_name', e.target.value)}
              placeholder="n8n_chat_histories"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-white/60 text-sm mt-1">
              The table where chat histories are stored
            </p>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-start space-x-3 ${
              testResult.success
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  testResult.success ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {testResult.message}
              </p>
              {testResult.success && testResult.recordCount !== undefined && (
                <p className="text-green-400/80 text-sm mt-1">
                  Found {testResult.recordCount} records in the table
                </p>
              )}
            </div>
          </div>
        )}

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-center space-x-3 ${
              saveMessage.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p
              className={`font-semibold ${
                saveMessage.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {saveMessage.text}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 mt-8">
          <button
            onClick={testConnection}
            disabled={!isFormValid() || isTesting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors font-semibold"
          >
            {isTesting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <TestTube className="w-5 h-5" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <button
            onClick={saveConfiguration}
            disabled={!isFormValid() || isSaving || !testResult?.success}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors font-semibold"
          >
            {isSaving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>

        <p className="text-white/60 text-sm text-center mt-4">
          Test the connection first to ensure credentials are correct before saving
        </p>
      </div>
    </div>
  );
};

export default N8nConfiguration;
