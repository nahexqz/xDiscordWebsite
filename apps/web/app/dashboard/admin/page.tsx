"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Package, Ticket, Shield,
  Tag, Megaphone, Bot, FileText, LogOut, Bell,
  Search, Crown, TrendingUp, DollarSign, Activity, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";
import {
  AdminUsersTab, AdminProductsTab, AdminTicketsTab,
  AdminCouponsTab, AdminAnnouncementsTab, AdminBotTab, AdminLogsTab,
} from "@/components/admin/admin-tabs";
import { AdminVerificationsTab } from "@/components/admin/verifications-tab";

const SIDEBAR_ITEMS = [
  { id: "overview",      label: "Overview",      icon: LayoutDashboard },
  { id: "users",         label: "Users",          icon: Users           },
  { id: "products",      label: "Products",       icon: Package         },
  { id: "tickets",       label: "Tickets",        icon: Ticket          },
  { id: "verifications", label: "Verifications",  icon: Shield          },
  { id: "coupons",       label: "Coupons",        icon: Tag             },
  { id: "announcements", label: "Announcements",  icon: Megaphone       },
  { id: "bot",           label: "Discord Bot",    icon: Bot             },
  { id: "logs",          label: "Audit Logs",     icon: FileText        },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user)         { router.push("/login"); return; }
    if (!user.isAdmin) { router.push("/");      return; }
    axios.get("/api/admin/stats")
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, router]);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":      return <OverviewTab stats={stats} loading={loading} />;
      case "users":         return <AdminUsersTab />;
      case "products":      return <AdminProductsTab />;
      case "tickets":       return <AdminTicketsTab />;
      case "verifications": return <AdminVerificationsTab />;
      case "coupons":       return <AdminCouponsTab />;
      case "announcements": return <AdminAnnouncementsTab />;
      case "bot":           return <AdminBotTab />;
      case "logs":          return <AdminLogsTab />;
      default:              return null;
    }
  };

  const pendingCount = (stats?.openTickets || 0) + (stats?.pendingVerifications || 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#07070f]">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.25 }}
        className="relative flex flex-shrink-0 flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden"
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-800">
            <Crown className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="font-display text-xs font-bold text-white">LEGENDARY</p>
              <p className="font-display text-xs text-purple-400">ADMIN</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen((o) => !o)} className="ml-auto text-white/40 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {sidebarOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`admin-sidebar-link w-full ${activeTab === id ? "active" : ""}`}>
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">{label}</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/5 p-2">
          <button onClick={logout} className="admin-sidebar-link w-full text-red-400 hover:text-red-300">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/5 bg-black/20 px-6 gap-4">
          <h1 className="font-display text-base font-bold text-white capitalize">
            {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input type="text" placeholder="Search..." className="h-9 w-48 rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500" />
            </div>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition-colors">
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}

function OverviewTab({ stats, loading }: { stats: any; loading: boolean }) {
  const CARDS = [
    { label: "Total Users",   value: stats?.totalUsers?.toLocaleString() || "0",                       sub: `+${stats?.newUsersToday||0} today`, icon: Users,       color: "from-blue-500 to-blue-700"   },
    { label: "Revenue",       value: `฿${((stats?.totalRevenue||0)/100).toLocaleString()}`,            sub: `฿${((stats?.revenueToday||0)/100).toFixed(0)} today`, icon: DollarSign, color: "from-green-500 to-green-700"  },
    { label: "Open Tickets",  value: String(stats?.openTickets||0),                                     sub: "Need attention",                    icon: Ticket,      color: "from-orange-500 to-orange-700"},
    { label: "Pending Verif", value: String(stats?.pendingVerifications||0),                            sub: "Awaiting review",                   icon: Shield,      color: "from-purple-500 to-purple-700"},
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((c, i) => (
          <motion.div key={c.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="glass-card neon-border p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color}`}><c.icon className="h-5 w-5 text-white"/></div>
            </div>
            {loading ? <div className="skeleton h-8 w-24 mb-1"/> : <p className="font-display text-2xl font-black text-white">{c.value}</p>}
            <p className="text-xs text-white/40">{c.label}</p>
            <p className="text-xs text-white/30 mt-0.5">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="glass-card neon-border p-6 lg:col-span-2">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-purple-400"/>Revenue — Last 30 Days</h3>
          {loading ? <div className="skeleton h-48 w-full"/> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.revenueChart||[]}>
                <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9333ea" stopOpacity={0.35}/><stop offset="95%" stopColor="#9333ea" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="date" tick={{fill:"rgba(255,255,255,0.3)",fontSize:11}}/>
                <YAxis tick={{fill:"rgba(255,255,255,0.3)",fontSize:11}}/>
                <Tooltip contentStyle={{background:"#0d0920",border:"1px solid rgba(147,51,234,0.3)",borderRadius:"12px"}} labelStyle={{color:"rgba(255,255,255,0.7)"}}/>
                <Area type="monotone" dataKey="revenue" stroke="#9333ea" fill="url(#rg)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="glass-card neon-border p-6">
          <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-purple-400"/>Top Products</h3>
          {loading ? <div className="space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="skeleton h-9 w-full"/>)}</div> : (
            <div className="space-y-3">
              {(stats?.topProducts||[]).slice(0,5).map((p:any,i:number)=>(
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-white/30 font-mono flex-shrink-0">#{i+1}</span>
                  <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{p.name}</p><p className="text-xs text-white/40">{p.soldCount} sold</p></div>
                  <p className="text-sm font-bold text-purple-400 flex-shrink-0">฿{(p.revenue/100).toFixed(0)}</p>
                </div>
              ))}
              {!stats?.topProducts?.length && <p className="text-sm text-white/30 text-center py-4">No sales yet</p>}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="glass-card neon-border p-6">
        <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-purple-400"/>Daily Orders — Last 30 Days</h3>
        {loading ? <div className="skeleton h-36 w-full"/> : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats?.revenueChart||[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="date" tick={{fill:"rgba(255,255,255,0.3)",fontSize:11}}/>
              <YAxis tick={{fill:"rgba(255,255,255,0.3)",fontSize:11}}/>
              <Tooltip contentStyle={{background:"#0d0920",border:"1px solid rgba(147,51,234,0.3)",borderRadius:"12px"}}/>
              <Bar dataKey="orders" fill="#9333ea" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
