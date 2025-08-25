import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Edit, Trash2, Eye, Heart, Calendar, 
  User, Save, X, Tag, Star, BarChart3, TrendingUp,
  FileText, Globe, Clock, Target
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title_en: string;
  title_es: string;
  content_en: string;
  content_es: string;
  excerpt_en: string;
  excerpt_es: string;
  category: string;
  tags: string[];
  slug: string;
  featured_image_url: string;
  status: string;
  published_at: string;
  featured: boolean;
  author_name: string;
  view_count: number;
  like_count: number;
  read_time_minutes: number;
  difficulty_level: string;
  created_at: string;
}

interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  featured_posts: number;
  total_views: number;
  total_likes: number;
  avg_views_per_post: number;
  avg_likes_per_post: number;
}

interface PostForm {
  title_en: string;
  title_es: string;
  content_en: string;
  content_es: string;
  excerpt_en: string;
  excerpt_es: string;
  category: string;
  tags: string;
  slug: string;
  featured: boolean;
  read_time_minutes: number;
  difficulty_level: string;
  status: string;
  featuredVideo: string;
  featuredImage: string;
  allowHtml: boolean;
}

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState<PostForm>({
    title_en: '',
    title_es: '',
    content_en: '',
    content_es: '',
    excerpt_en: '',
    excerpt_es: '',
    category: 'technology',
    tags: '',
    slug: '',
    featured: false,
    read_time_minutes: 5,
    difficulty_level: 'beginner',
    status: 'draft',
    featuredVideo: '',
    featuredImage: '',
    allowHtml: true
  });

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    setIsLoading(true);
    try {
      // Load posts
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Load stats
      const { data: statsData, error: statsError } = await supabase
        .from('blog_stats')
        .select('*')
        .single();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      setPosts(postsData || []);
      setStats(statsData);

    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleFormChange = (field: keyof PostForm, value: string | boolean) => {
    const updatedForm = { ...postForm, [field]: value };
    
    // Auto-generate slug from English title
    if (field === 'title_en' && typeof value === 'string') {
      updatedForm.slug = generateSlug(value);
    }
    
    setPostForm(updatedForm);
  };

  const savePost = async (publishNow: boolean = false) => {
    try {
      const postData = {
        title_en: postForm.title_en,
        title_es: postForm.title_es,
        content_en: postForm.content_en,
        content_es: postForm.content_es,
        excerpt_en: postForm.excerpt_en,
        excerpt_es: postForm.excerpt_es,
        category: postForm.category,
        tags: postForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        slug: postForm.slug,
        featured: postForm.featured,
        read_time_minutes: postForm.read_time_minutes,
        difficulty_level: postForm.difficulty_level,
        status: publishNow ? 'published' : postForm.status,
        published_at: publishNow ? new Date().toISOString() : null,
        author_name: 'TriExpert Services',
        content_type: 'html',
        allow_html: true,
        featured_video_url: postForm.featuredVideo || null,
        featured_image_url: postForm.featuredImage || null
      };

      console.log('Saving post with data:', postData);

      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        alert('Post updated successfully!');
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        alert(publishNow ? 'Post published successfully!' : 'Post saved as draft!');
      }

      setShowEditor(false);
      setEditingPost(null);
      resetForm();
      loadBlogData();

    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      console.log('Post saved successfully');
      loadBlogData();
      alert('Post deleted successfully!');

    } catch (error) {
      console.error('Error deleting post:', error);
      alert(`Error deleting post: ${error.message}`);
    }
  };

  const editPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      title_en: post.title_en,
      title_es: post.title_es,
      content_en: post.content_en,
      content_es: post.content_es,
      excerpt_en: post.excerpt_en,
      excerpt_es: post.excerpt_es,
      category: post.category,
      tags: post.tags.join(', '),
      slug: post.slug,
      featured: post.featured,
      read_time_minutes: post.read_time_minutes,
      difficulty_level: post.difficulty_level,
      status: post.status,
      featuredVideo: '',
      featuredImage: '',
      allowHtml: true
    });
    setShowEditor(true);
  };

  const togglePostStatus = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const updateData: any = { status: newStatus };
    
    if (newStatus === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;
      loadBlogData();

    } catch (error) {
      console.error('Error updating post status:', error);
      alert(`Error updating post status: ${error.message}`);
    }
  };

  const resetForm = () => {
    setPostForm({
      title_en: '',
      title_es: '',
      content_en: '',
      content_es: '',
      excerpt_en: '',
      excerpt_es: '',
      category: 'technology',
      tags: '',
      slug: '',
      featured: false,
      read_time_minutes: 5,
      difficulty_level: 'beginner',
      status: 'draft',
      featuredVideo: '',
      featuredImage: '',
      allowHtml: true
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      published: 'bg-green-500/20 text-green-300',
      draft: 'bg-yellow-500/20 text-yellow-300',
      archived: 'bg-gray-500/20 text-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-300">Loading blog data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Blog Management</h2>
            <p className="text-slate-400">Create and manage blog posts</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setEditingPost(null);
            setShowEditor(true);
          }}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-white">{stats.total_posts}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Published</p>
                <p className="text-2xl font-bold text-white">{stats.published_posts}</p>
              </div>
              <Globe className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-white">{stats.total_views}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Likes</p>
                <p className="text-2xl font-bold text-white">{stats.total_likes}</p>
              </div>
              <Heart className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white">Blog Posts</h3>
        </div>
        
        <div className="overflow-x-auto">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No blog posts yet</p>
              <button
                onClick={() => setShowEditor(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all"
              >
                Create First Post
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-slate-600/50 rounded-lg p-4 border border-slate-500">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white">{post.title_en}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                          {post.featured && (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {post.author_name}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
                          </span>
                          <span className="capitalize bg-slate-700 px-2 py-1 rounded text-xs">
                            {post.category}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {post.view_count}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {post.like_count}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editPost(post)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => togglePostStatus(post.id, post.status)}
                          className={`px-3 py-2 rounded-lg transition-all ${
                            post.status === 'published'
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {post.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        
                        <button
                          onClick={() => deletePost(post.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h3>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingPost(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6">
              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    value={postForm.title_en}
                    onChange={(e) => handleFormChange('title_en', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title (Español) *
                  </label>
                  <input
                    type="text"
                    value={postForm.title_es}
                    onChange={(e) => handleFormChange('title_es', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Excerpts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Excerpt (English)
                  </label>
                  <textarea
                    value={postForm.excerpt_en}
                    onChange={(e) => handleFormChange('excerpt_en', e.target.value)}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Excerpt (Español)
                  </label>
                  <textarea
                    value={postForm.excerpt_es}
                    onChange={(e) => handleFormChange('excerpt_es', e.target.value)}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Content (English) * - HTML Supported
                  </label>
                  <textarea
                    value={postForm.content_en}
                    onChange={(e) => handleFormChange('content_en', e.target.value)}
                    rows={15}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Enter HTML content. Supports: videos, images, tables, code blocks, etc."
                    required
                  />
                  <div className="mt-2 text-xs text-slate-400 space-y-1">
                    <div>💡 HTML Tags supported: h1-h6, p, div, img, iframe, table, ul, ol, blockquote, code, pre</div>
                    <div>🎥 YouTube: &lt;iframe src="https://youtube.com/embed/VIDEO_ID"&gt;</div>
                    <div>🎨 Use Tailwind classes for styling</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Content (Español) * - HTML Soportado
                  </label>
                  <textarea
                    value={postForm.content_es}
                    onChange={(e) => handleFormChange('content_es', e.target.value)}
                    rows={15}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Contenido HTML. Soporta: videos, imágenes, tablas, bloques de código, etc."
                    required
                  />
                  <div className="mt-2 text-xs text-slate-400 space-y-1">
                    <div>💡 Tags HTML soportados: h1-h6, p, div, img, iframe, table, ul, ol, blockquote, code, pre</div>
                    <div>🎥 YouTube: &lt;iframe src="https://youtube.com/embed/VIDEO_ID"&gt;</div>
                    <div>🎨 Usa clases de Tailwind para estilos</div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={postForm.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ai">AI & Machine Learning</option>
                    <option value="automation">Automation</option>
                    <option value="consulting">Consulting</option>
                    <option value="security">Security</option>
                    <option value="cloud">Cloud Computing</option>
                    <option value="development">Development</option>
                    <option value="translations">Translations</option>
                    <option value="technology">Technology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={postForm.difficulty_level}
                    onChange={(e) => handleFormChange('difficulty_level', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={postForm.read_time_minutes}
                    onChange={(e) => handleFormChange('read_time_minutes', parseInt(e.target.value))}
                    min="1"
                    max="60"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Rich Content Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Featured Video URL (optional)
                  </label>
                  <input
                    type="url"
                    value={postForm.featuredVideo || ''}
                    onChange={(e) => handleFormChange('featuredVideo', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://youtube.com/embed/VIDEO_ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Featured Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={postForm.featuredImage || ''}
                    onChange={(e) => handleFormChange('featuredImage', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://images.pexels.com/..."
                  />
                </div>
              </div>

              {/* Slug and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={postForm.slug}
                    onChange={(e) => handleFormChange('slug', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="auto-generated-from-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={postForm.tags}
                    onChange={(e) => handleFormChange('tags', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ai, automation, business"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={postForm.featured}
                    onChange={(e) => handleFormChange('featured', e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-slate-300">Featured Post</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={postForm.allowHtml || true}
                    onChange={(e) => handleFormChange('allowHtml', e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-slate-300">Allow HTML Content</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-6 border-t border-slate-600">
                <button
                  type="button"
                  onClick={() => savePost(false)}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => savePost(true)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Publish Now</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false);
                    setEditingPost(null);
                    resetForm();
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;