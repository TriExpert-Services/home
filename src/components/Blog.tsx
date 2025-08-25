import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, User, Eye, Heart, ArrowLeft, Clock, 
  Tag, Share2, Search, Filter, ChevronRight, Star, TrendingUp 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

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

interface BlogProps {
  onBack: () => void;
}

const Blog: React.FC<BlogProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBlogPosts();
    loadLikedPosts();
  }, []);

  const loadBlogPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLikedPosts = () => {
    const liked = localStorage.getItem('triexpert-liked-posts');
    if (liked) {
      setLikedPosts(new Set(JSON.parse(liked)));
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const clientIP = '192.168.1.1'; // In production, get real IP
      
      const { data, error } = await supabase
        .rpc('toggle_blog_like', {
          p_blog_post_id: postId,
          p_ip_address: clientIP
        });

      if (error) throw error;

      // Update local state
      const newLikedPosts = new Set(likedPosts);
      if (data) {
        newLikedPosts.add(postId);
      } else {
        newLikedPosts.delete(postId);
      }
      
      setLikedPosts(newLikedPosts);
      localStorage.setItem('triexpert-liked-posts', JSON.stringify([...newLikedPosts]));
      
      // Update post like count locally
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, like_count: post.like_count + (data ? 1 : -1) }
          : post
      ));

      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          like_count: selectedPost.like_count + (data ? 1 : -1)
        });
      }

    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleViewPost = async (post: BlogPost) => {
    // Increment view count
    try {
      await supabase.rpc('increment_blog_view', { p_blog_post_id: post.id });
      
      // Update local state
      setPosts(posts.map(p => 
        p.id === post.id 
          ? { ...p, view_count: p.view_count + 1 }
          : p
      ));
    } catch (error) {
      console.error('Error incrementing view:', error);
    }

    setSelectedPost(post);
  };

  const getTitle = (post: BlogPost) => language === 'es' ? post.title_es : post.title_en;
  const getContent = (post: BlogPost) => language === 'es' ? post.content_es : post.content_en;
  const getExcerpt = (post: BlogPost) => language === 'es' ? post.excerpt_es : post.excerpt_en;

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: { en: string, es: string } } = {
      ai: { en: 'Artificial Intelligence', es: 'Inteligencia Artificial' },
      automation: { en: 'Automation', es: 'Automatización' },
      consulting: { en: 'Consulting', es: 'Consultoría' },
      security: { en: 'Security', es: 'Seguridad' },
      cloud: { en: 'Cloud Computing', es: 'Computación en la Nube' },
      development: { en: 'Development', es: 'Desarrollo' },
      translations: { en: 'Translations', es: 'Traducciones' },
      technology: { en: 'Technology', es: 'Tecnología' }
    };
    return categories[category]?.[language] || category;
  };

  const getDifficultyColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-300',
      intermediate: 'bg-yellow-500/20 text-yellow-300',
      advanced: 'bg-red-500/20 text-red-300'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500/20 text-gray-300';
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = getTitle(post).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getContent(post).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(posts.map(post => post.category))];

  // Single Post View
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-slate-900 py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => setSelectedPost(null)}
            className="mb-6 flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Volver al Blog' : 'Back to Blog'}
          </button>

          {/* Post Header */}
          <article className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedPost.difficulty_level)}`}>
                  {selectedPost.difficulty_level}
                </span>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                  {getCategoryName(selectedPost.category)}
                </span>
                <div className="flex items-center text-slate-400 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedPost.read_time_minutes} {language === 'es' ? 'min lectura' : 'min read'}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {getTitle(selectedPost)}
              </h1>

              <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {selectedPost.author_name}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(selectedPost.published_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {selectedPost.view_count}
                  </div>
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      likedPosts.has(selectedPost.id) 
                        ? 'text-red-400 hover:text-red-300' 
                        : 'text-slate-400 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedPosts.has(selectedPost.id) ? 'fill-red-400' : ''}`} />
                    <span>{selectedPost.like_count}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 leading-relaxed">
                {selectedPost.content_type === 'html' ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: getContent(selectedPost) }}
                    className="prose prose-invert prose-slate max-w-none 
                               prose-headings:text-slate-200 prose-p:text-slate-300 
                               prose-strong:text-white prose-a:text-blue-400 
                               prose-blockquote:border-blue-500 prose-blockquote:text-slate-400
                               prose-code:bg-slate-800 prose-code:text-blue-300
                               prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-600"
                  />
                ) : (
                  <div className="whitespace-pre-line">
                    {getContent(selectedPost)}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-700">
                <div className="flex items-center space-x-2 flex-wrap">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {selectedPost.tags.map((tag, index) => (
                    <span key={index} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      likedPosts.has(selectedPost.id)
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedPosts.has(selectedPost.id) ? 'fill-white' : ''}`} />
                    <span>{language === 'es' ? 'Me Gusta' : 'Like'}</span>
                    <span>({selectedPost.like_count})</span>
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: getTitle(selectedPost),
                      text: getExcerpt(selectedPost),
                      url: window.location.href
                    }) || navigator.clipboard.writeText(window.location.href);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{language === 'es' ? 'Compartir' : 'Share'}</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // Blog List View
  return (
    <div className="min-h-screen bg-slate-900 py-8 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {language === 'es' ? 'Blog de TriExpert' : 'TriExpert Blog'}
            </h1>
            <p className="text-slate-300">
              {language === 'es' 
                ? 'Insights sobre tecnología, automatización y transformación digital' 
                : 'Insights on technology, automation, and digital transformation'
              }
            </p>
          </div>
          
          <div></div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'es' ? 'Buscar posts...' : 'Search posts...'}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">{language === 'es' ? 'Todas las Categorías' : 'All Categories'}</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">{language === 'es' ? 'Cargando posts...' : 'Loading posts...'}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">
              {language === 'es' ? 'No se encontraron posts' : 'No posts found'}
            </p>
            <p className="text-slate-500">
              {language === 'es' 
                ? 'Prueba con diferentes términos de búsqueda o categorías' 
                : 'Try different search terms or categories'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                  {/* Featured Badge */}
                  {post.featured && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full self-start mb-4">
                      <Star className="w-3 h-3 inline mr-1" />
                      {language === 'es' ? 'Destacado' : 'Featured'}
                    </div>
                  )}

                  {/* Post Image Placeholder */}
                  <div className="w-full h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl mb-4 flex items-center justify-center border border-orange-500/30">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Category and Difficulty */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs font-medium">
                      {getCategoryName(post.category)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(post.difficulty_level)}`}>
                      {post.difficulty_level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-300 transition-colors line-clamp-2">
                    {getTitle(post)}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-slate-400 mb-4 flex-1 line-clamp-3">
                    {getExcerpt(post)}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.published_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.read_time_minutes} {language === 'es' ? 'min' : 'min'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.view_count}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        className={`flex items-center transition-colors ${
                          likedPosts.has(post.id) 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${likedPosts.has(post.id) ? 'fill-red-400' : ''}`} />
                        {post.like_count}
                      </button>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <button
                    onClick={() => handleViewPost(post)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center space-x-2 group/btn"
                  >
                    <span>{language === 'es' ? 'Leer Más' : 'Read More'}</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <TrendingUp className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              {language === 'es' ? '¿Necesitas Ayuda con Tecnología?' : 'Need Help with Technology?'}
            </h3>
            <p className="text-slate-300 mb-6">
              {language === 'es'
                ? 'Nuestros expertos están listos para transformar tu negocio con soluciones profesionales'
                : 'Our experts are ready to transform your business with professional solutions'
              }
            </p>
            <button
              onClick={() => {
                onBack();
                setTimeout(() => {
                  const element = document.getElementById('contacto');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300"
            >
              {language === 'es' ? 'Contáctanos' : 'Contact Us'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;