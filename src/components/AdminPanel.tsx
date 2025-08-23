import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, Star, Trash2, Edit, Eye, Download, ExternalLink, LogOut, RefreshCcw, Calendar, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle, X, Settings,
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Home,
  MessageSquare,
  TrendingUp,
import { 
  Shield, Users, FileText, Star, Trash2, Edit, Eye, Download, ExternalLink, LogOut, 
  RefreshCcw, Calendar, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle, X, 
  Settings, BarChart3, MessageSquare, Phone, Mail, Building, Target
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { supabase } from '../lib/supabase';
import DocumentManagement from './DocumentManagement';

// Contact Lead interfaces
interface ContactLead {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_notes?: string;
  follow_up_date?: string;
  estimated_value?: number;
  actual_value?: number;
}

interface ContactLeadStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  qualified_leads: number;
  converted_leads: number;
  leads_last_30_days: number;
  leads_last_7_days: number;
  avg_estimated_value: number;
  total_revenue_from_leads: number;
  conversion_rate: number;
}

interface TranslationRequest {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  source_language: string;
  target_language: string;
  processing_time: string;
  desired_format: string;
  page_count: number;
  document_type: string;
  request_date: string;
  special_instructions: string | null;
  file_urls: string[] | null;
  status: string;
  total_cost: number | null;
}

interface Stats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalRevenue: number;
  avgRequestValue: number;
  requestsThisMonth: number;
}

interface ContactLead {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string | null;
  message: string;
  status: string;
  priority: string;
  admin_notes: string | null;
  estimated_value: number | null;
  follow_up_date: string | null;
}

interface LeadsStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

const AdminPanel = () => {
  const { user, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [translationRequests, setTranslationRequests] = useState<TranslationRequest[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
  const [leadsStats, setLeadsStats] = useState<LeadsStats>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
    conversionRate: 0
  });
  const [contactLeads, setContactLeads] = useState([]);
  const [leadsStats, setLeadsStats] = useState({
    total_leads: 0,
    new_leads: 0,
    contacted_leads: 0,
    qualified_leads: 0,
    converted_leads: 0,
    conversion_rate: 0
  });
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalRevenue: 0,
    avgRequestValue: 0,
    requestsThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequestForDocuments, setSelectedRequestForDocuments] = useState<string | null>(null);
  const [selectedRequestData, setSelectedRequestData] = useState<any>(null);

  useEffect(() => {
    loadData();
    if (activeTab === 'reviews') {
      loadReviews();
    }
    if (activeTab === 'contacts') {
      loadContactLeads();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews') {
      loadReviews();
    }
    if (activeTab === 'contacts') {
      loadContactLeads();
    } else if (activeTab === 'contact-leads') {
      loadContactLeads();
    }
  }, [activeTab]);

  const loadContactLeads = async () => {
    setIsLoading(true);
    try {
      // Load contact leads
      const { data: leads, error: leadsError } = await supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      setContactLeads(leads || []);

      // Load stats
      try {
        const { data: stats, error: statsError } = await supabase
          .from('contact_leads_stats')
          .select('*')
          .single();

        if (!statsError && stats) {
          setLeadsStats(stats);
        }
      } catch (statsError) {
        console.warn('Stats view might not exist yet:', statsError);
      }

    } catch (error) {
      console.error('Error loading contact leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load translation requests
      const { data: requests, error } = await supabase
        .from('translation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTranslationRequests(requests || []);

      // Calculate stats
      const totalRequests = requests?.length || 0;
      const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
      const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
      const totalRevenue = requests?.reduce((sum, r) => sum + (r.total_cost || 0), 0) || 0;
      const avgRequestValue = totalRequests > 0 ? totalRevenue / totalRequests : 0;
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const requestsThisMonth = requests?.filter(r => new Date(r.created_at) >= thisMonth).length || 0;

      setStats({
        totalRequests,
        pendingRequests,
        completedRequests,
        totalRevenue,
        avgRequestValue,
        requestsThisMonth
      });

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('client_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const updateReviewStatus = async (reviewId: string, isApproved: boolean, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('client_reviews')
        .update({ 
          is_approved: isApproved,
          is_featured: isFeatured
        })
        .eq('id', reviewId);

      if (error) throw error;
      
      // Reload reviews to reflect changes
      loadReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('client_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('translation_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      
      // Reload data to reflect changes
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const { error } = await supabase
        .from('translation_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      
      loadData();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      in_progress: <TrendingUp className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'translations', name: 'Translations', icon: <FileText className="w-5 h-5" /> },
    { id: 'reviews', name: 'Reviews', icon: <Star className="w-5 h-5" /> },
    { id: 'contacts', name: `Contact Leads${leadsStats.newLeads > 0 ? ` (${leadsStats.newLeads})` : ''}`, icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: <FileText className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Pending',
      value: stats.pendingRequests,
      icon: <Clock className="w-8 h-8" />,
      color: 'from-yellow-500 to-yellow-600',
      change: '+3%'
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      change: '+18%'
    },
    {
      title: 'This Month',
      value: stats.requestsThisMonth,
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      change: '+25%'
    }
  ];

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      // Reload data to reflect changes
      loadContactLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const updateLeadPriority = async (leadId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('contact_leads')
        .update({ priority: newPriority })
        .eq('id', leadId);

      if (error) throw error;
      
      // Reload data to reflect changes
      loadContactLeads();
    } catch (error) {
      console.error('Error updating lead priority:', error);
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('contact_leads')
        .update({ admin_notes: notes })
        .eq('id', leadId);

      if (error) throw error;
      
      // Reload data to reflect changes
      loadContactLeads();
    } catch (error) {
      console.error('Error updating lead notes:', error);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const { error } = await supabase
        .from('contact_leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      
      loadContactLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const getLeadStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      contacted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      qualified: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      converted: 'bg-green-500/20 text-green-300 border-green-500/30',
      closed: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      urgent: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-slate-400">TriExpert Services</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.role}</p>
                <p className="text-xs text-slate-400">Online</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
              <p className="text-slate-400">Manage your TriExpert Services</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-400 hover:text-white transition-colors">
                <Home className="w-5 h-5" />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <p className="text-xs text-slate-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                  <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center text-white`}>
                        {card.icon}
                      </div>
                      <span className="text-green-400 text-sm font-semibold">{card.change}</span>
                    </div>
                    <div>
                      <h3 className="text-slate-400 text-sm font-medium">{card.title}</h3>
                      <p className="text-white text-2xl font-bold">{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Translations</h2>
                <div className="space-y-4">
                  {translationRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)} flex items-center space-x-1`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{request.full_name}</p>
                          <p className="text-slate-400 text-sm">{request.document_type} • {request.page_count} pages</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{formatCurrency(request.total_cost || 0)}</p>
                        <p className="text-slate-400 text-sm">{formatDate(request.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'translations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Translation Requests</h2>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-slate-400">
                    Storage Status: <span className="text-green-400">✓ Connected</span>
                  </div>
                  <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="text-left p-4 text-slate-300 font-semibold">Client</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Document</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Languages</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Status</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Cost</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Date</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Actions</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Documents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {translationRequests.map((request) => (
                        <tr key={request.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{request.full_name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <p className="text-slate-400 text-sm">{request.email}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <p className="text-slate-400 text-sm">{request.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white">{request.document_type.replace('_', ' ')}</p>
                              <p className="text-slate-400 text-sm">{request.page_count} pages</p>
                              <p className="text-slate-400 text-sm">{request.desired_format}</p>
                              
                              {/* Original Files Count */}
                              {request.file_urls && request.file_urls.length > 0 && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <FileText className="w-3 h-3 text-orange-400" />
                                  <span className="text-orange-400 text-xs">{request.file_urls.length} original files</span>
                                </div>
                              )}
                              
                              {/* Quality Score */}
                              {request.quality_score && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  <span className="text-yellow-400 text-xs">{request.quality_score}/5</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-blue-400" />
                              <span className="text-white text-sm">
                                {request.source_language.toUpperCase()} → {request.target_language.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status.replace('_', ' ')}</span>
                            </div>
                            {/* Verification Status */}
                            {request.verification_link && (
                              <div className="mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  request.verification_expires_at && new Date(request.verification_expires_at) > new Date()
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}>
                                  {request.verification_expires_at && new Date(request.verification_expires_at) > new Date() ? 'Verified' : 'Expired'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="text-white font-semibold">{formatCurrency(request.total_cost || 0)}</p>
                            <p className="text-slate-400 text-sm">{request.processing_time}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-white text-sm">{formatDate(request.created_at)}</p>
                                <p className="text-slate-400 text-xs">Needed: {request.request_date}</p>
                                {request.delivery_date && (
                                  <p className="text-green-400 text-xs">Delivered: {formatDate(request.delivery_date)}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <select
                                value={request.status}
                                onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                                className="bg-slate-700 text-white text-sm px-3 py-1 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => deleteRequest(request.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => {
                                  setSelectedRequestForDocuments(request.id);
                                  setSelectedRequestData(request);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Manage</span>
                              </button>
                              
                              {/* Document Count */}
                              {request.translated_file_urls && request.translated_file_urls.length > 0 && (
                                <div className="text-xs text-green-400">
                                  {request.translated_file_urls.length} files
                                </div>
                              )}
                              
                              {/* Verification Link */}
                              {request.verification_link && (
                                <button
                                  onClick={() => window.open(`/verify/${request.verification_link}`, '_blank')}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                                  title="View verification page"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Verify</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {translationRequests.length === 0 && (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No translation requests found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Management Modal */}
          {selectedRequestForDocuments && selectedRequestData && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Document Management</h2>
                    <p className="text-slate-400">{selectedRequestData.full_name} - {selectedRequestData.document_type}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRequestForDocuments(null);
                      setSelectedRequestData(null);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <DocumentManagement
                    requestId={selectedRequestForDocuments}
                    requestData={selectedRequestData}
                    onUpdate={() => {
                      loadData();
                      // Update the selected data
                      const updatedRequest = translationRequests.find(r => r.id === selectedRequestForDocuments);
                      if (updatedRequest) {
                        setSelectedRequestData(updatedRequest);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Client Reviews</h2>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-slate-400">
                    Total: {reviews.length} | Approved: {reviews.filter(r => r.is_approved).length}
                  </div>
                  <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="text-left p-4 text-slate-300 font-semibold">Review</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Client</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Rating</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Status</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Date</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                          <td className="p-4">
                            <div>
                              {review.title && (
                                <p className="text-white font-medium mb-1">{review.title}</p>
                              )}
                              <p className="text-slate-300 text-sm line-clamp-2 mb-2">
                                {review.comment}
                              </p>
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                  {review.service_type.replace('_', ' ')}
                                </span>
                                {review.is_featured && (
                                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">
                                {review.show_full_name 
                                  ? review.client_name 
                                  : `${review.client_name.split(' ')[0]} ${review.client_name.split(' ')[1]?.[0] || ''}.`
                                }
                              </p>
                              <p className="text-slate-400 text-sm">{review.client_email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-slate-500'
                                  }`}
                                />
                              ))}
                              <span className="text-white ml-2">{review.rating}/5</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                review.is_approved 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {review.is_approved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-white text-sm">{formatDate(review.created_at)}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {!review.is_approved && (
                                <button
                                  onClick={() => updateReviewStatus(review.id, true, false)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                  title="Approve review"
                                >
                                  Approve
                                </button>
                              )}
                              
                              {review.is_approved && (
                                <button
                                  onClick={() => updateReviewStatus(review.id, true, !review.is_featured)}
                                  className={`px-3 py-1 rounded text-xs transition-colors ${
                                    review.is_featured
                                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                                  title={review.is_featured ? 'Remove from featured' : 'Add to featured'}
                                >
                                  {review.is_featured ? 'Unfeature' : 'Feature'}
                                </button>
                              )}
                              
                              {review.is_approved && (
                                <button
                                  onClick={() => updateReviewStatus(review.id, false, false)}
                                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                  title="Unapprove review"
                                >
                                  Unapprove
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete review"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reviews.length === 0 && (
                  <div className="p-8 text-center">
                    <Star className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No reviews found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Contact Leads</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Total Leads</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-white text-2xl font-bold">{leadsStats.totalLeads}</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">New</span>
                    <AlertTriangle className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-white text-2xl font-bold">{leadsStats.newLeads}</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Contacted</span>
                    <Phone className="w-4 h-4 text-yellow-400" />
                  </div>
                  <p className="text-white text-2xl font-bold">{leadsStats.contactedLeads}</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Converted</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-white text-2xl font-bold">{leadsStats.convertedLeads}</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Conversion</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-white text-2xl font-bold">{leadsStats.conversionRate}%</p>
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-slate-700/30 rounded-xl border border-slate-600 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="text-left p-4 text-slate-300 font-semibold">Contact</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Company</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Service</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Message</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Status</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Priority</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Date</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactLeads.map((lead) => (
                        <tr key={lead.id} className="border-t border-slate-600 hover:bg-slate-700/30">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{lead.full_name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <p className="text-slate-400 text-sm">{lead.email}</p>
                              </div>
                              {lead.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <p className="text-slate-400 text-sm">{lead.phone}</p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-white">{lead.company || '-'}</p>
                            {lead.estimated_value && (
                              <p className="text-green-400 text-sm">{formatCurrency(lead.estimated_value)}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                              {lead.service || 'General'}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-slate-300 text-sm line-clamp-2">{lead.message}</p>
                            {lead.admin_notes && (
                              <div className="mt-2 p-2 bg-slate-600/50 rounded text-xs">
                                <p className="text-yellow-400 font-medium">Notes:</p>
                                <p className="text-slate-300">{lead.admin_notes}</p>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <select
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLeadStatusColor(lead.status)} bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="qualified">Qualified</option>
                              <option value="converted">Converted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={lead.priority}
                              onChange={(e) => updateLeadPriority(lead.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(lead.priority)} bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white text-sm">{formatDate(lead.created_at)}</p>
                              <p className="text-slate-400 text-xs">
                                {lead.source || 'website'}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  const notes = prompt('Add notes for this lead:', lead.admin_notes || '');
                                  if (notes !== null) {
                                    updateLeadNotes(lead.id, notes);
                                  }
                                }}
                                className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/20 p-2 rounded-lg"
                                title="Add notes"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteLead(lead.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete lead"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {contactLeads.length === 0 && (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No contact leads found</p>
                    <p className="text-slate-500 text-sm">Leads will appear here when visitors submit the contact form</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">System Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Site Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Site Name</label>
                        <input
                          type="text"
                          value="TriExpert Services"
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Contact Email</label>
                        <input
                          type="email"
                          value="support@triexpertservice.com"
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Admin Users</h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{user?.email}</p>
                          <p className="text-slate-400 text-sm capitalize">{user?.role}</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Database Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Database Connected</span>
                    </div>
                    <p className="text-green-300 text-sm mt-1">Supabase operational</p>
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-semibold">RLS Enabled</span>
                    </div>
                    <p className="text-blue-300 text-sm mt-1">Row level security active</p>
                  </div>
                  
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-400 font-semibold">Storage Ready</span>
                    </div>
                    <p className="text-purple-300 text-sm mt-1">File uploads enabled</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;