import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Search, RefreshCcw, Phone, Clock, Calendar,
  TrendingUp, Users, ChevronRight, Filter, Download, X, AlertCircle,
  CheckCircle, BarChart3, Activity, Loader
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Client {
  phone_number: string;
  message_count: number;
  last_message_at: string;
  first_message_at: string;
}

interface Message {
  id: string;
  session_id: string;
  message: string;
  created_at: string;
  message_type?: string;
  sender?: string;
  metadata?: any;
}

interface Statistics {
  totals: {
    total_messages: number;
    total_clients: number;
  };
  daily: Array<{ date: string; message_count: number }>;
  top_clients: Array<{ phone_number: string; message_count: number }>;
  hourly: Array<{ hour: number; message_count: number }>;
}

const WhatsAppChatHistory: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'chat' | 'stats'>('list');
  const [error, setError] = useState<string | null>(null);
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  useEffect(() => {
    if (hasConfig && activeView === 'list') {
      loadClients();
    } else if (hasConfig && activeView === 'stats') {
      loadStatistics();
    }
  }, [hasConfig, activeView]);

  const checkConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_database_config')
        .select('id, is_active')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setHasConfig(!!data);

      if (!data) {
        setError('No active n8n database configuration found. Please configure it in Settings.');
      }
    } catch (err) {
      console.error('Error checking configuration:', err);
      setError('Failed to check configuration');
    }
  };

  const callEdgeFunction = async (action: string, params: Record<string, string> = {}) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    const queryParams = new URLSearchParams({ action, ...params });
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-chat-proxy?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data;
  };

  const loadClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await callEdgeFunction('get_clients', {
        limit: '50',
        offset: '0',
        search: searchTerm,
      });
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err.message || 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (client: Client) => {
    setIsLoading(true);
    setError(null);
    setSelectedClient(client);
    setActiveView('chat');
    try {
      const data = await callEdgeFunction('get_conversation', {
        phone_number: client.phone_number,
        limit: '100',
        offset: '0',
      });
      setMessages(data);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err.message || 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const data = await callEdgeFunction('get_statistics', {
        start_date: startDate,
        end_date: endDate,
      });
      setStatistics(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!hasConfig && !isLoading) {
    return (
      <div className="p-8">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Configuration Required</h2>
          <p className="text-white/70 mb-6">
            Please configure the n8n database connection in the Settings tab to access WhatsApp chat history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">WhatsApp AI Agent</h1>
          <p className="text-white/70">Monitor and analyze customer conversations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              activeView === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clients</span>
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              activeView === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistics</span>
          </button>
          <button
            onClick={activeView === 'list' ? loadClients : loadStatistics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-300 hover:text-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clients List View */}
      {activeView === 'list' && (
        <>
          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadClients()}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clients Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-white">Loading clients...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <button
                  key={client.phone_number}
                  onClick={() => loadConversation(client)}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-400" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {formatPhoneNumber(client.phone_number)}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-white/70">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {client.message_count} messages
                    </div>
                    <div className="flex items-center text-white/70">
                      <Clock className="w-4 h-4 mr-2" />
                      Last: {formatDate(client.last_message_at)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {clients.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No clients found</p>
            </div>
          )}
        </>
      )}

      {/* Chat View */}
      {activeView === 'chat' && selectedClient && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white/5 border-b border-white/20 p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setActiveView('list');
                  setSelectedClient(null);
                  setMessages([]);
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-xl">
                  {formatPhoneNumber(selectedClient.phone_number)}
                </h2>
                <p className="text-white/60 text-sm">
                  {selectedClient.message_count} messages
                </p>
              </div>
            </div>
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-white">Loading conversation...</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isBot = message.sender === 'bot' || message.sender === 'agent';
                return (
                  <div
                    key={message.id || index}
                    className={`flex ${isBot ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        isBot
                          ? 'bg-blue-500/20 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <p className="text-sm mb-2">{message.message}</p>
                      <p className="text-xs text-white/60">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No messages found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics View */}
      {activeView === 'stats' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-white">Loading statistics...</p>
            </div>
          ) : statistics ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {statistics.totals.total_messages.toLocaleString()}
                  </div>
                  <div className="text-white/60 text-sm">Total Messages</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {statistics.totals.total_clients.toLocaleString()}
                  </div>
                  <div className="text-white/60 text-sm">Total Clients</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {(statistics.totals.total_messages / statistics.totals.total_clients).toFixed(1)}
                  </div>
                  <div className="text-white/60 text-sm">Avg Messages/Client</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {statistics.daily[statistics.daily.length - 1]?.message_count || 0}
                  </div>
                  <div className="text-white/60 text-sm">Messages Today</div>
                </div>
              </div>

              {/* Top Clients */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Most Active Clients</h3>
                <div className="space-y-3">
                  {statistics.top_clients.slice(0, 10).map((client, index) => (
                    <div
                      key={client.phone_number}
                      className="flex items-center justify-between bg-white/5 rounded-xl p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">#{index + 1}</span>
                        </div>
                        <span className="text-white font-medium">
                          {formatPhoneNumber(client.phone_number)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-white/60" />
                        <span className="text-white font-semibold">
                          {client.message_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Activity Chart (Simple Bar Chart) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Daily Activity (Last 30 Days)</h3>
                <div className="space-y-2">
                  {statistics.daily.slice(-15).map((day) => {
                    const maxCount = Math.max(...statistics.daily.map(d => d.message_count));
                    const width = (day.message_count / maxCount) * 100;
                    return (
                      <div key={day.date} className="flex items-center space-x-3">
                        <span className="text-white/60 text-sm w-24">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 bg-white/5 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full flex items-center justify-end pr-3"
                            style={{ width: `${width}%` }}
                          >
                            <span className="text-white text-sm font-semibold">
                              {day.message_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hourly Activity */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Activity by Hour</h3>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 24 }, (_, i) => {
                    const hourData = statistics.hourly.find(h => h.hour === i);
                    const count = hourData?.message_count || 0;
                    const maxCount = Math.max(...statistics.hourly.map(h => h.message_count));
                    const opacity = count > 0 ? (count / maxCount) * 0.8 + 0.2 : 0.1;

                    return (
                      <div
                        key={i}
                        className="text-center p-3 rounded-lg"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                        }}
                      >
                        <div className="text-white text-xs mb-1">{i}:00</div>
                        <div className="text-white font-semibold text-sm">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No statistics available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppChatHistory;
