import { getDetailedAnalytics } from '../actions'
import { 
  TrendingUp, Users, ShoppingCart, DollarSign, MousePointer2, 
  BarChart3, ArrowUpRight, ArrowDownRight, Activity, ShieldCheck,
  Zap, Globe
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// Define the interface so TypeScript understands the 'data' structure
interface AnalyticsData {
  users: number;
  orders: number;
  visits: number;
  revenue: number;
  topProducts: Array<{ name: string; clicks: number }>;
  adStats: Array<{ title: string; clicks: number; impressions: number }>;
}

export default async function AnalyticsPage() {
  const response = await getDetailedAnalytics();
  
  // Extract the data safely from the ActionResponse
  // We cast it to our interface to satisfy the compiler
  const stats = response.success ? (response.data as AnalyticsData) : null;
  
  // Safe Fallbacks using the extracted stats
  const visits = stats?.visits ?? 1; 
  const orders = stats?.orders ?? 0;
  const revenue = stats?.revenue ?? 0;
  const topProducts = stats?.topProducts ?? [];
  const adStats = stats?.adStats ?? [];
  const users = stats?.users ?? 0;

  // Calculate specific KPIs safely
  const conversionRate = ((orders / (visits || 1)) * 100).toFixed(2);
  const totalRevenue = revenue.toLocaleString();
  
  return (
    <div className="min-h-screen bg-[#020203] text-white p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">System_Status: Operational</p>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
              Intelligence_<span className="text-purple-600">Report</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-right">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Global Rank</p>
                <p className="text-xs font-bold font-mono">#1,204</p>
              </div>
              <Globe size={16} className="text-purple-500" />
            </div>
          </div>
        </header>

        {/* TOP LEVEL KPIS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Gross Revenue', value: `KSh ${totalRevenue}`, icon: DollarSign, trend: '+12.5%', color: 'text-green-500', bg: 'bg-green-500/5' },
            { label: 'Active Sessions', value: visits, icon: Users, trend: '+5.2%', color: 'text-purple-500', bg: 'bg-purple-500/5' },
            { label: 'Conv. Rate', value: `${conversionRate}%`, icon: Zap, trend: '+1.1%', color: 'text-blue-500', bg: 'bg-blue-500/5' },
            { label: 'Total Assets', value: orders, icon: ShoppingCart, trend: '+8.4%', color: 'text-amber-500', bg: 'bg-amber-500/5' },
          ].map((kpi, i) => (
            <div key={i} className="group bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-8 hover:border-white/20 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 ${kpi.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                  <kpi.icon size={20} className={kpi.color} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black ${String(kpi.trend).startsWith('+') ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    {kpi.trend} {String(kpi.trend).startsWith('+') ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                  </span>
                  <p className="text-[8px] text-gray-600 font-bold uppercase mt-1">vs Last 7d</p>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black italic tracking-tighter">{kpi.value}</h3>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PRODUCT PERFORMANCE */}
          <div className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 size={120} />
            </div>
            
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
              <Activity size={16} className="text-purple-500" /> Asset_Volume_Distribution
            </h3>
            
            <div className="space-y-8 relative z-10">
              {topProducts.map((product: any, i: number) => {
                const maxClicks = Math.max(...topProducts.map((p: any) => p.clicks), 1);
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-gray-700">0{i+1}</span>
                        <p className="text-sm font-black uppercase italic">{product.name}</p>
                      </div>
                      <p className="text-xs font-black text-purple-500">{product.clicks} UNITS</p>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${(product.clicks / maxClicks) * 100}%` }} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <span>Data Refreshed: Just Now</span>
                <span className="flex items-center gap-2 text-green-500"><ShieldCheck size={12}/> Verified Secure</span>
            </div>
          </div>

          {/* ADVERT & ROI ANALYSIS */}
          <div className="flex flex-col gap-8">
            <div className="bg-[#0a0a0c] border border-white/5 rounded-[3rem] p-8 h-full">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <MousePointer2 size={16} className="text-blue-500" /> Campaign_Pulse
              </h3>
              <div className="space-y-4">
                {adStats.map((ad: any, i: number) => (
                  <div key={i} className="p-5 bg-white/[0.02] rounded-3xl border border-white/5 hover:bg-white/[0.05] transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black uppercase text-gray-400 max-w-[120px] truncate">{ad.title}</p>
                        <span className="text-[8px] font-black text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">Active</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-lg font-black italic tracking-tighter">{(ad.clicks / (ad.impressions || 1) * 100).toFixed(1)}%</p>
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Click-Through Rate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-green-500">+{ad.clicks} Hits</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}