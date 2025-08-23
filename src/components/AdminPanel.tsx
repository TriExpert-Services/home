import React, { useState, useEffect } from 'react';
import {
  Shield, Users, FileText, Settings, Home, Edit, Eye, Download, Trash2, ExternalLink,
  LogOut, RefreshCcw, Star, AlertCircle, CheckCircle, X, XCircle, AlertTriangle,
  Calendar, Clock, DollarSign, TrendingUp, BarChart3, Plus, Search, Filter,
  SortAsc, SortDesc, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MessageSquare, Phone, Mail, Send, Building, Target, Globe, MapPin, User
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { supabase } from '../lib/supabase';
import DocumentManagement from './DocumentManagement';

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
  translated_file_urls: string[] | null;
  verification_link: string | null;
  translator_notes: string | null;
  quality_score: number | null;
  delivery_date: string | null;
  is_verified: boolean;
  verification_expires_at: string | null;
}

interface Review {
  id: string;
  created_at: string;
  rating: number;
  title: string | null;
  comment: string;
  client_name: string;
  service_type: string;
  is_approved: boolean;
  is_featured: boolean;
  show_full_name: boolean;
  translation_request_id: string;
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
}

const AdminPanel: React.FC = () => {
  const { user, logout } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [translationRequests, setTranslationRequests] = useState<TranslationRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsStats, setReviewsStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    conversionRate: 0
  });
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
  const [leadsStats, setLeadsStats] = useState({
    total_leads: 0,
    new_leads: 0,
    contacted_leads: 0,
    qualified_leads: 0,
    converted_leads: 0,
    conversion_rate: 0
  });

  // Load initial data
  useEffect(() => {
    console.log('AdminPanel mounted, loading initial data...');
    loadAllData();
  }, []);

  // Add refresh interval for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'overview') {
        loadOverviewData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  // Load data when component mounts or tab changes
  useEffect(() => {
    if (activeTab === 'translations') {
      loadTranslationRequests();
    } else if (activeTab === 'reviews') {
      loadReviews();
    } else if (activeTab === 'leads') {
      loadContactLeads();
    }
  }, [activeTab]);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    console.log('🔄 Loading dashboard data...');
    
    try {
      // Load translations statistics
      const { data: translationsData, error: translationsError, count: translationsCount } = await supabase
        .from('translation_requests')
        .select('*', { count: 'exact' });

      if (translationsError) {
        console.error('❌ Translations error:', translationsError);
        throw translationsError;
      }

      console.log('✅ Translations loaded:', translationsCount || 0, 'records');

      // Load contact leads
      const { data: leadsData, error: leadsError, count: leadsCount } = await supabase
        .from('contact_leads')
        .select('*', { count: 'exact' });

      if (leadsError) {
        console.warn('⚠️ Leads error (table may not exist):', leadsError);
        // Don't throw error, just log warning
      }

      console.log('✅ Leads loaded:', leadsCount || 0, 'records');

      // Load reviews
      const { data: reviewsData, error: reviewsError, count: reviewsCount } = await supabase
        .from('client_reviews')
        .select('*', { count: 'exact' });

      if (reviewsError) {
        console.warn('⚠️ Reviews error (table may not exist):', reviewsError);
        // Don't throw error, just log warning
      }

      console.log('✅ Reviews loaded:', reviewsCount || 0, 'records');

      // Calculate statistics safely
      const totalTranslations = translationsCount || 0;
      const completedTranslations = translationsData?.filter(t => t.status === 'completed').length || 0;
      const totalReviews = reviewsCount || 0;
      const totalLeads = leadsCount || 0;
      
      // Calculate revenue from completed translations
      const totalRevenue = translationsData?.reduce((sum, t) => {
        return t.status === 'completed' ? sum + (t.total_cost || 0) : sum;
      }, 0) || 0;
      
      // Calculate average rating
      const averageRating = reviewsData && reviewsData.length > 0 
        ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length 
        : 0;
      
      // Calculate conversion rate from leads
      const conversionRate = leadsData && leadsData.length > 0 
        ? (leadsData.filter(l => l.status === 'converted').length / leadsData.length) * 100 
        : 0;

      console.log('📊 Calculated Stats:', {
        totalTranslations,
        completedTranslations,
        totalReviews,
        totalLeads,
        totalRevenue,
        averageRating: averageRating.toFixed(1),
        conversionRate: conversionRate.toFixed(1)
      });

      // Update states
      setStats({
        totalTranslations,
        completedTranslations,
        totalReviews,
        totalLeads,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageRating: parseFloat(averageRating.toFixed(1)),
        conversionRate: parseFloat(conversionRate.toFixed(1))
      });

      setTranslations(translationsData || []);
      setContactLeads(leadsData || []);
      setReviews(reviewsData || []);

      console.log('✅ Dashboard data loaded successfully!');

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setLoadError('Error loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOverviewData = async () => {
    console.log('Loading overview data...');
    try {
      // Get direct counts from translation_requests table
      const { data: translations, error: translationsError } = await supabase
        .from('translation_requests')
        .select('*');

      if (translationsError) {
        console.error('Error loading translations:', translationsError);
      } else {
        console.log('Translations loaded:', translations?.length || 0);
        const totalTranslations = translations?.length || 0;
        const completedTranslations = translations?.filter(t => t.status === 'completed').length || 0;
        const pendingTranslations = translations?.filter(t => t.status === 'pending').length || 0;
        const totalRevenue = translations?.reduce((sum, t) => sum + (t.total_cost || 0), 0) || 0;
        
        setTranslationStats({
          totalRequests: totalTranslations,
          completed: completedTranslations,
          pending: pendingTranslations,
          totalRevenue: totalRevenue
        });
      }

      // Get direct counts from contact_leads table
      const { data: leads, error: leadsError } = await supabase
        .from('contact_leads')
        .select('*');
        
      if (leadsError) {
        console.error('Error loading leads:', leadsError);
      } else {
        console.log('Leads loaded:', leads?.length || 0);
        const totalLeads = leads?.length || 0;
        const newLeads = leads?.filter(l => l.status === 'new').length || 0;
        const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0;
        const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
        
        setLeadsStats({
          total_leads: totalLeads,
          new_leads: newLeads,
          contacted_leads: leads?.filter(l => l.status === 'contacted').length || 0,
          qualified_leads: leads?.filter(l => l.status === 'qualified').length || 0,
          converted_leads: convertedLeads,
          conversion_rate: conversionRate
        });
      }

      // Get reviews stats
      const { data: reviews, error: reviewsError } = await supabase
        .from('client_reviews')
        .select('*');
        
      if (reviewsError) {
        console.error('Error loading reviews:', reviewsError);
      } else {
        console.log('Reviews loaded:', reviews?.length || 0);
        const totalReviews = reviews?.length || 0;
        const avgRating = totalReviews > 0 
          ? Math.round((reviews?.reduce((sum, r) => sum + r.rating, 0) || 0) / totalReviews * 10) / 10
          : 0;
          
        setReviewsStats({
          totalReviews: totalReviews,
          averageRating: avgRating,
          pending: reviews?.filter(r => !r.is_approved).length || 0,
          approved: reviews?.filter(r => r.is_approved).length || 0,
          conversionRate: 0
        });
      }

    } catch (error) {
      console.error('Error loading overview data:', error);
      setError('Error loading dashboard data');
    }
  };

  const loadTranslations = async () => {
    try {
      console.log('Loading translations...');
      const { data, error, count } = await supabase
        .from('translation_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Translations error:', error);
        throw error;
      }

      console.log('✅ Translations loaded successfully:', count || 0, 'translations');
      setTranslations(data || []);
      
      // Calculate and update translation stats
      const totalTranslations = count || 0;
      const completedTranslations = data?.filter(t => t.status === 'completed').length || 0;
      const totalRevenue = data?.reduce((sum, t) => {
        return t.status === 'completed' ? sum + (t.total_cost || 0) : sum;
      }, 0) || 0;
      
      setStats(prev => ({ 
        ...prev, totalTranslations, completedTranslations, totalRevenue: parseFloat(totalRevenue.toFixed(2))
      }));

    } catch (error) {
      console.error('Error loading translations:', error);
      setError('Error loading translations');
    }
  };

  const loadReviews = async () => {
    try {
      console.log('Loading reviews...');
      const { data, error, count } = await supabase
        .from('client_reviews')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Reviews error:', error);
        throw error;
      }

      console.log('✅ Reviews loaded successfully:', count || 0, 'reviews');
      setReviews(data || []);
      
      // Update reviews count in stats
      setStats(prev => ({ ...prev, totalReviews: count || 0 }));

    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Error loading reviews');
    }
  };

  const loadContactLeads = async () => {
    try {
      console.log('Loading contact leads...');
      const { data, error, count } = await supabase
        .from('contact_leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Contact leads error (table may not exist):', error);
        setContactLeads([]);
        return;
      }

      console.log('✅ Contact leads loaded successfully:', count || 0, 'leads');
      setContactLeads(data || []);
      
      // Update leads count in stats
      setStats(prev => ({ ...prev, totalLeads: count || 0 }));

    } catch (error) {
      console.warn('⚠️ Contact leads table might not exist yet:', error);
      setContactLeads([]);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    await loadAllData();
  };

  const loadTranslationRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('translation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTranslationRequests(data || []);
    } catch (error) {
      console.error('Error loading translation requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('translation_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Reload data
      loadTranslationRequests();
      alert(`Request status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating request status');
    }
  };

  const approveReview = async (reviewId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('client_reviews')
        .update({ 
          is_approved: approved,
          approved_at: approved ? new Date().toISOString() : null,
          approved_by: approved ? user?.id : null
        })
        .eq('id', reviewId);

      if (error) throw error;
      
      // Reload reviews
      loadReviews();
      alert(`Review ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error updating review status');
    }
  };

  const toggleFeaturedReview = async (reviewId: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('client_reviews')
        .update({ is_featured: featured })
        .eq('id', reviewId);

      if (error) throw error;
      
      // Reload reviews
      loadReviews();
      alert(`Review ${featured ? 'marked as featured' : 'removed from featured'}`);
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Error updating featured status');
    }
  };

  const updateLeadStatus = async (leadId: string, status: string, notes?: string) => {
    try {
      const updateData: any = {
        status: status
      };
      
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('contact_leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;
      
      // Reload leads
      loadContactLeads();
      alert(`Lead status updated to ${status}`);
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error updating lead status');
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('contact_leads')
        .update({ admin_notes: notes })
        .eq('id', leadId);

      if (error) throw error;
      
      // Reload leads
      loadContactLeads();
      alert('Lead notes updated successfully');
    } catch (error) {
      console.error('Error updating lead notes:', error);
      alert('Error updating lead notes');
    }
  };

  const filteredRequests = translationRequests.filter(request => {
    const matchesSearch = request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'cancelled': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300';
      case 'high': return 'bg-orange-500/20 text-orange-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatCurrency = (amount: number | null) => {
    return amount ? `$${amount.toFixed(2)}` : 'N/A';
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                <p className="text-white/60 text-sm">TriExpert Services</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('translations')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'translations' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Translations</span>
                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {translationRequests.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'reviews' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Reviews</span>
                <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {reviewsStats.pendingReviews}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'leads' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Contact Leads</span>
                <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {leadsStats.new_leads}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center space-x-3 px-4 py-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-white/60 text-xs capitalize">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <div className="text-slate-300 text-sm">
                    Welcome back, {user?.email?.split('@')[0]}
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="bg-slate-700/50 rounded-2xl p-8 text-center mb-6">
                  <RefreshCcw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                  <p className="text-white">Loading dashboard data...</p>
                </div>
              )}
              
              {/* Error State */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-300 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  {error}
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {translationRequests.length}
                  </div>
                  <div className="text-white/60 text-sm">Total Translations</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {translationRequests.filter(r => r.status === 'completed').length}
                  </div>
                  <div className="text-white/60 text-sm">Completed</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {reviewsStats.totalReviews}
                  </div>
                  <div className="text-white/60 text-sm">Customer Reviews</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {leadsStats.total_leads}
                  </div>
                  <div className="text-white/60 text-sm">Contact Leads</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('translations')}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 p-4 rounded-xl transition-all flex items-center space-x-3"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Manage Translations</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 p-4 rounded-xl transition-all flex items-center space-x-3"
                  >
                    <Star className="w-6 h-6" />
                    <span>Review Approval</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-300 p-4 rounded-xl transition-all flex items-center space-x-3"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span>Process Leads</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Translations Tab */}
          {activeTab === 'translations' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Translation Requests</h1>
                  <p className="text-white/70">Manage and track all translation requests</p>
                </div>
                <button
                  onClick={loadTranslationRequests}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="text-white mt-4">Loading...</p>
                </div>
              ) : selectedRequest ? (
                <div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="mb-6 flex items-center text-white/70 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to List
                  </button>
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Translation Request Details</h2>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status}
                        </span>
                        <div className="flex space-x-2">
                          <select
                            value={selectedRequest.status}
                            onChange={(e) => updateRequestStatus(selectedRequest.id, e.target.value)}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Client Information */}
                      <div className="bg-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-400" />
                          Client Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-white/60 text-sm">Name:</label>
                            <p className="text-white font-medium">{selectedRequest.full_name}</p>
                          </div>
                          <div>
                            <label className="text-white/60 text-sm">Email:</label>
                            <p className="text-white font-medium">{selectedRequest.email}</p>
                          </div>
                          <div>
                            <label className="text-white/60 text-sm">Phone:</label>
                            <p className="text-white font-medium">{selectedRequest.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Translation Details */}
                      <div className="bg-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Globe className="w-5 h-5 mr-2 text-green-400" />
                          Translation Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-white/60 text-sm">Languages:</label>
                            <p className="text-white font-medium">{selectedRequest.source_language} → {selectedRequest.target_language}</p>
                          </div>
                          <div>
                            <label className="text-white/60 text-sm">Document Type:</label>
                            <p className="text-white font-medium">{selectedRequest.document_type}</p>
                          </div>
                          <div>
                            <label className="text-white/60 text-sm">Pages:</label>
                            <p className="text-white font-medium">{selectedRequest.page_count}</p>
                          </div>
                          <div>
                            <label className="text-white/60 text-sm">Processing Time:</label>
                            <p className="text-white font-medium">{selectedRequest.processing_time}</p>
                          </div>
                          <div>
                            <label className="text-white/60 text-sm">Format:</label>
                            <p className="text-white font-medium">{selectedRequest.desired_format}</p>
                          </div>
                          <div>
                            <label className="text-white/60 text-sm">Total Cost:</label>
                            <p className="text-white font-medium">{formatCurrency(selectedRequest.total_cost)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {selectedRequest.special_instructions && (
                      <div className="bg-slate-700/50 rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Special Instructions</h3>
                        <p className="text-white/80">{selectedRequest.special_instructions}</p>
                      </div>
                    )}

                    {/* Document Management */}
                    <DocumentManagement 
                      requestId={selectedRequest.id}
                      requestData={selectedRequest}
                      onUpdate={loadTranslationRequests}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-white font-semibold">Client</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Service</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Cost</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-white">{request.full_name}</p>
                                <p className="text-white/60 text-sm">{request.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white">{request.document_type}</p>
                                <p className="text-white/60 text-sm">{request.source_language} → {request.target_language}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white">
                              {formatCurrency(request.total_cost)}
                            </td>
                            <td className="px-6 py-4 text-white/80">
                              {formatDate(request.created_at)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedRequest(request)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredRequests.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">No translation requests found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Customer Reviews</h1>
                  <p className="text-white/70">Manage and moderate customer feedback</p>
                </div>
                <button
                  onClick={loadReviews}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Reviews Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-8 h-8 text-yellow-400" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{reviewsStats.totalReviews}</div>
                      <div className="text-white/60 text-sm">Total Reviews</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{reviewsStats.averageRating.toFixed(1)}</div>
                      <div className="text-white/60 text-sm">Average Rating</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{reviewsStats.pendingReviews}</div>
                      <div className="text-white/60 text-sm">Pending Approval</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{reviews.filter(r => r.is_approved).length}</div>
                      <div className="text-white/60 text-sm">Approved</div>
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="text-white mt-4">Loading reviews...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-slate-500'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-white font-semibold">{review.rating}/5</span>
                            {review.title && (
                              <span className="text-blue-300 font-medium">"{review.title}"</span>
                            )}
                          </div>
                          
                          <p className="text-white/80 mb-3 leading-relaxed">{review.comment}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-white/60">
                            <span>
                              <User className="w-4 h-4 inline mr-1" />
                              {review.show_full_name ? review.client_name : `${review.client_name.split(' ')[0]} ${review.client_name.split(' ')[1]?.[0] || ''}.`}
                            </span>
                            <span>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {formatDate(review.created_at)}
                            </span>
                            <span>
                              <FileText className="w-4 h-4 inline mr-1" />
                              {review.service_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Approval Status */}
                          <div className="flex flex-col space-y-2">
                            {review.is_approved ? (
                              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approved
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Pending
                              </span>
                            )}

                            {review.is_featured && (
                              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center">
                                <Star className="w-4 h-4 mr-1" />
                                Featured
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              {!review.is_approved && (
                                <button
                                  onClick={() => approveReview(review.id, true)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Approve</span>
                                </button>
                              )}
                              
                              {review.is_approved && (
                                <button
                                  onClick={() => approveReview(review.id, false)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => toggleFeaturedReview(review.id, !review.is_featured)}
                              className={`px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1 ${
                                review.is_featured 
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : 'bg-gray-600 hover:bg-gray-700 text-white'
                              }`}
                            >
                              <Star className="w-4 h-4" />
                              <span>{review.is_featured ? 'Unfeature' : 'Feature'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">No reviews found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contact Leads Tab */}
          {activeTab === 'leads' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Contact Leads</h1>
                  <p className="text-white/70">Manage inquiries from potential customers</p>
                </div>
                <button
                  onClick={loadContactLeads}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Leads Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{leadsStats.total_leads}</div>
                    <div className="text-white/60 text-sm">Total Leads</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300">{leadsStats.new_leads}</div>
                    <div className="text-white/60 text-sm">New</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300">{leadsStats.contacted_leads}</div>
                    <div className="text-white/60 text-sm">Contacted</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-300">{leadsStats.qualified_leads}</div>
                    <div className="text-white/60 text-sm">Qualified</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">{leadsStats.converted_leads}</div>
                    <div className="text-white/60 text-sm">Converted</div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="text-white mt-4">Loading leads...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactLeads.map((lead) => (
                    <div key={lead.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">{lead.full_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(lead.priority)}`}>
                              {lead.priority}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-white/80 mb-3">
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {lead.email}
                            </span>
                            {lead.phone && (
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {lead.phone}
                              </span>
                            )}
                            {lead.company && (
                              <span className="flex items-center">
                                <Building className="w-4 h-4 mr-1" />
                                {lead.company}
                              </span>
                            )}
                            {lead.service && (
                              <span className="flex items-center">
                                <Target className="w-4 h-4 mr-1" />
                                {lead.service}
                              </span>
                            )}
                          </div>

                          <p className="text-white/80 mb-3">{lead.message}</p>

                          {lead.admin_notes && (
                            <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
                              <label className="text-white/60 text-sm">Admin Notes:</label>
                              <p className="text-white/80 text-sm">{lead.admin_notes}</p>
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-white/60">
                            <span>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {formatDate(lead.created_at)}
                            </span>
                            {lead.estimated_value && (
                              <span>
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Est. {formatCurrency(lead.estimated_value)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-6">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                          </select>

                          <button
                            onClick={() => {
                              const notes = prompt('Add admin notes:', lead.admin_notes || '');
                              if (notes !== null) {
                                updateLeadNotes(lead.id, notes);
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Notes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {contactLeads.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">No contact leads found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                  <p className="text-white/70">Configure your admin panel preferences</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-white/10">
                    <div>
                      <h3 className="text-white font-semibold">Account Information</h3>
                      <p className="text-white/60 text-sm">Your admin account details</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{user.email}</p>
                      <p className="text-white/60 text-sm capitalize">{user.role} Access</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-white/10">
                    <div>
                      <h3 className="text-white font-semibold">System Status</h3>
                      <p className="text-white/60 text-sm">All systems operational</p>
                    </div>
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Online
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="text-white font-semibold">Data Refresh</h3>
                      <p className="text-white/60 text-sm">Last updated: {formatDate(new Date().toISOString())}</p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      <span>Refresh All Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;