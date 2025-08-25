import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Plus, Edit, Calendar, Users, DollarSign, Clock, 
  CheckCircle2, AlertCircle, TrendingUp, Target, FileText, 
  ChevronDown, ChevronRight, Star, User
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Project {
  id: string;
  lead_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  project_name: string;
  project_description: string;
  service_type: string;
  project_scope: string;
  status: string;
  priority: string;
  start_date: string;
  planned_delivery_date: string;
  actual_delivery_date: string;
  progress_percentage: number;
  current_phase: string;
  next_milestone: string;
  estimated_value: number;
  actual_cost: number;
  billing_status: string;
  client_satisfaction_score: number;
  created_at: string;
  delivery_status: string;
  progress_status: string;
  project_duration_days: number;
}

interface ProjectStats {
  total_projects: number;
  planning_projects: number;
  development_projects: number;
  testing_projects: number;
  delivery_projects: number;
  completed_projects: number;
  overdue_projects: number;
  average_progress: number;
  total_estimated_value: number;
  total_actual_cost: number;
  average_satisfaction: number;
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  status: string;
  estimated_value: number;
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [qualifiedLeads, setQualifiedLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadProjectsData();
  }, []);

  const loadProjectsData = async () => {
    setIsLoading(true);
    try {
      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects_admin_view')
        .select('*');

      if (projectsError) throw projectsError;

      // Load project stats
      const { data: statsData, error: statsError } = await supabase
        .from('projects_stats')
        .select('*')
        .single();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      // Load qualified leads that can be converted to projects
      const { data: leadsData, error: leadsError } = await supabase
        .from('contact_leads')
        .select('*')
        .in('status', ['qualified', 'contacted'])
        .in('service', ['consulting', 'development', 'security', 'cloud', 'data', 'automation'])
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      setProjects(projectsData || []);
      setStats(statsData);
      setQualifiedLeads(leadsData || []);

    } catch (error) {
      console.error('Error loading projects data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      development: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      testing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      delivery: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
      on_hold: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-300';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'text-red-400',
      high: 'text-orange-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-400';
  };

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const updates: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add timestamps for status changes
      if (newStatus === 'completed') {
        updates.actual_delivery_date = new Date().toISOString();
        updates.progress_percentage = 100;
      }

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;

      loadProjectsData();
      alert('Project status updated successfully!');

    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Error updating project status');
    }
  };

  const updateProjectProgress = async (projectId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          progress_percentage: newProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      loadProjectsData();

    } catch (error) {
      console.error('Error updating project progress:', error);
      alert('Error updating project progress');
    }
  };

  const convertLeadToProject = async (lead: Lead) => {
    const projectName = prompt('Enter project name:', `${lead.service} project for ${lead.company || lead.full_name}`);
    if (!projectName) return;

    const description = prompt('Enter project description:', lead.message);
    if (!description) return;

    try {
      const { data, error } = await supabase
        .rpc('convert_lead_to_project', {
          p_lead_id: lead.id,
          p_project_name: projectName,
          p_project_description: description,
          p_estimated_value: lead.estimated_value || 5000
        });

      if (error) throw error;

      setShowNewProjectModal(false);
      setSelectedLead(null);
      loadProjectsData();
      alert('Lead converted to project successfully!');

    } catch (error) {
      console.error('Error converting lead to project:', error);
      alert('Error converting lead to project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-300">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Project Management</h2>
            <p className="text-slate-400">Manage and track active projects</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Projects</p>
                <p className="text-2xl font-bold text-white">{stats.total_projects}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Projects</p>
                <p className="text-2xl font-bold text-white">
                  {stats.development_projects + stats.testing_projects + stats.delivery_projects}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Average Progress</p>
                <p className="text-2xl font-bold text-white">{stats.average_progress}%</p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-white">${stats.total_estimated_value?.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white">Active Projects</h3>
        </div>
        
        <div className="overflow-x-auto">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No projects yet</p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="space-y-2 p-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-slate-600/50 rounded-lg border border-slate-500">
                  {/* Project Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-slate-600/70 transition-colors"
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {expandedProject === project.id ? 
                          <ChevronDown className="w-5 h-5 text-slate-400" /> : 
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        }
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-white">{project.project_name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority} priority
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {project.client_name}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Due: {new Date(project.planned_delivery_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ${project.estimated_value?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Progress Bar */}
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white">{project.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Status Update */}
                        <select
                          value={project.status}
                          onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-slate-600 border border-slate-500 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="planning">Planning</option>
                          <option value="development">Development</option>
                          <option value="testing">Testing</option>
                          <option value="delivery">Delivery</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Project Details */}
                  {expandedProject === project.id && (
                    <div className="px-4 pb-4 border-t border-slate-500">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                        {/* Project Details */}
                        <div className="lg:col-span-2 space-y-4">
                          <div>
                            <h5 className="font-medium text-white mb-2">Description</h5>
                            <p className="text-slate-300 text-sm">{project.project_description}</p>
                          </div>
                          
                          {project.project_scope && (
                            <div>
                              <h5 className="font-medium text-white mb-2">Scope</h5>
                              <p className="text-slate-300 text-sm">{project.project_scope}</p>
                            </div>
                          )}
                          
                          <div>
                            <h5 className="font-medium text-white mb-2">Current Phase</h5>
                            <p className="text-slate-300 text-sm">{project.current_phase || 'Not specified'}</p>
                          </div>

                          {/* Progress Update */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-white">Progress</h5>
                              <span className="text-slate-300 text-sm">{project.progress_percentage}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={project.progress_percentage}
                              onChange={(e) => updateProjectProgress(project.id, parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        </div>

                        {/* Project Metadata */}
                        <div className="space-y-4">
                          <div className="bg-slate-600/50 rounded-lg p-4">
                            <h5 className="font-medium text-white mb-3">Timeline</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Started:</span>
                                <span className="text-white">{new Date(project.start_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Due:</span>
                                <span className="text-white">{new Date(project.planned_delivery_date).toLocaleDateString()}</span>
                              </div>
                              {project.actual_delivery_date && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Delivered:</span>
                                  <span className="text-green-300">{new Date(project.actual_delivery_date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-slate-600/50 rounded-lg p-4">
                            <h5 className="font-medium text-white mb-3">Financial</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Estimated:</span>
                                <span className="text-white">${project.estimated_value?.toLocaleString()}</span>
                              </div>
                              {project.actual_cost && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Actual Cost:</span>
                                  <span className="text-white">${project.actual_cost?.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-400">Billing:</span>
                                <span className={`capitalize ${
                                  project.billing_status === 'paid' ? 'text-green-300' : 
                                  project.billing_status === 'overdue' ? 'text-red-300' : 'text-yellow-300'
                                }`}>
                                  {project.billing_status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {project.client_satisfaction_score && (
                            <div className="bg-slate-600/50 rounded-lg p-4">
                              <h5 className="font-medium text-white mb-2">Client Satisfaction</h5>
                              <div className="flex items-center space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= project.client_satisfaction_score
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-slate-500'
                                    }`}
                                  />
                                ))}
                                <span className="text-white text-sm">{project.client_satisfaction_score}/5</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Convert Lead to Project</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Qualified Leads Ready for Conversion:</h4>
              
              {qualifiedLeads.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">No qualified leads available for conversion</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {qualifiedLeads.map((lead) => (
                    <div 
                      key={lead.id}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-white">{lead.full_name}</span>
                            <span className="text-slate-400">({lead.email})</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>{lead.company}</span>
                            <span className="capitalize">{lead.service}</span>
                            <span>${lead.estimated_value?.toLocaleString()}</span>
                          </div>
                          <p className="text-slate-300 text-sm mt-2">{lead.message.substring(0, 100)}...</p>
                        </div>
                        
                        <button
                          onClick={() => convertLeadToProject(lead)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                          Convert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;