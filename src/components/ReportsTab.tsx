import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Users, Star, Globe, RefreshCcw, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { useToast } from '../contexts/ToastContext';

// ----- Types matching the SQL RPC return shapes -----

interface DailyRow {
  day: string;
  total_requests: number;
  pending_count: number;
  in_progress_count: number;
  completed_count: number;
  cancelled_count: number;
  daily_revenue: number;
  avg_turnaround_days: number | null;
}

interface FunnelRow {
  stage: 'new' | 'contacted' | 'qualified' | 'converted';
  count: number;
  pct_total: number;
}

interface LangPairRow {
  source_language: string | null;
  target_language: string | null;
  pair_label: string;
  request_count: number;
  total_revenue: number;
  avg_revenue: number;
}

interface ReviewDistRow {
  total_reviews: number;
  approved_reviews: number;
  average_rating: number;
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_stars: number;
}

// ----- Visual constants -----

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const FUNNEL_COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#34d399'];
const RATING_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

const Card: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; icon?: React.ReactNode }> = ({
  title,
  subtitle,
  children,
  icon,
}) => (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
    <div className="flex items-center gap-3 mb-4">
      {icon && <div className="text-white/60">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-white/50 text-sm">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const ReportsTab: React.FC = () => {
  const toast = useToast();
  const [range, setRange] = useState<Range>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [langPairs, setLangPairs] = useState<LangPairRow[]>([]);
  const [reviews, setReviews] = useState<ReviewDistRow | null>(null);

  const loadAll = async (rangeDays: Range) => {
    setIsLoading(true);
    try {
      const [dailyRes, funnelRes, langRes, reviewsRes] = await Promise.all([
        supabase.rpc('get_translation_daily_stats', { p_days: rangeDays }),
        supabase.rpc('get_lead_funnel'),
        supabase.rpc('get_revenue_by_language_pair', { p_limit: 10 }),
        supabase.rpc('get_review_distribution'),
      ]);

      if (dailyRes.error) throw dailyRes.error;
      if (funnelRes.error) throw funnelRes.error;
      if (langRes.error) throw langRes.error;
      if (reviewsRes.error) throw reviewsRes.error;

      setDaily((dailyRes.data ?? []) as DailyRow[]);
      setFunnel((funnelRes.data ?? []) as FunnelRow[]);
      setLangPairs((langRes.data ?? []) as LangPairRow[]);
      setReviews(((reviewsRes.data as ReviewDistRow[] | null) ?? [])[0] ?? null);
    } catch (error) {
      logger.error('Reports load error:', error);
      toast.error('Could not load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const refreshMatview = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.rpc('refresh_translation_daily_stats');
      if (error) throw error;
      await loadAll(range);
      toast.success('Reports refreshed');
    } catch (error) {
      logger.error('Refresh failed:', error);
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  // Derived data for the rating-distribution donut.
  const ratingPie = useMemo(() => {
    if (!reviews) return [];
    return [
      { name: '5★', value: reviews.five_stars },
      { name: '4★', value: reviews.four_stars },
      { name: '3★', value: reviews.three_stars },
      { name: '2★', value: reviews.two_stars },
      { name: '1★', value: reviews.one_stars },
    ].filter((r) => r.value > 0);
  }, [reviews]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Reports
          </h1>
          <p className="text-white/70">Operational, commercial and customer analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/10 rounded-lg p-1 flex">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  range === r ? 'bg-blue-600 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={refreshMatview}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily volume + revenue */}
          <Card
            title="Daily translations"
            subtitle="Volume and revenue, status breakdown"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.5)"
                  tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  fontSize={11}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                <Area type="monotone" dataKey="completed_count" name="Completed" stackId="1" stroke="#22c55e" fill="url(#completedGrad)" />
                <Area type="monotone" dataKey="pending_count" name="Pending" stackId="1" stroke="#eab308" fill="url(#pendingGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Daily revenue trend */}
          <Card
            title="Daily revenue"
            subtitle="Sum of completed translations per day"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.5)"
                  tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  fontSize={11}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tickFormatter={(v) => `$${v}`}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                  formatter={(v: number) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="daily_revenue" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Lead funnel */}
          <Card title="Lead funnel" subtitle="Snapshot of all leads across the pipeline" icon={<Users className="w-5 h-5" />}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis dataKey="stage" type="category" stroke="rgba(255,255,255,0.6)" width={90} fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                  formatter={(v: number, _name, props) => [`${v} (${props.payload.pct_total}%)`, 'Leads']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnel.map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue by language pair */}
          <Card title="Revenue by language pair" subtitle="Top 10 completed-translation pairs" icon={<Globe className="w-5 h-5" />}>
            {langPairs.length === 0 ? (
              <p className="text-white/50 text-sm py-12 text-center">No completed translations with language pairs yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={langPairs} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" tickFormatter={(v) => `$${v}`} fontSize={11} />
                  <YAxis dataKey="pair_label" type="category" stroke="rgba(255,255,255,0.6)" width={120} fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                    formatter={(v: number) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="total_revenue" fill="#a78bfa" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Review distribution */}
          <Card title="Reviews" subtitle={reviews ? `Average rating ${reviews.average_rating}/5 · ${reviews.approved_reviews} approved` : ''} icon={<Star className="w-5 h-5" />}>
            {ratingPie.length === 0 ? (
              <p className="text-white/50 text-sm py-12 text-center">No approved reviews yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={ratingPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {ratingPie.map((_, i) => (
                      <Cell key={i} fill={RATING_COLORS[i % RATING_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
