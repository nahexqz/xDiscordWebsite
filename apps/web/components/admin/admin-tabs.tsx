"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Users, Search, Ban, Crown, Ticket, ChevronDown,
  Package, Edit2, Trash2, Check, X, Loader2,
  Tag, Megaphone, Bot, FileText,
} from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

// ─── ADMIN USERS TAB ─────────────────────────────────────────────────────────
interface AdminUser {
  id: string; discordId: string; username: string; email?: string;
  avatar?: string; isAdmin: boolean; isBanned: boolean; createdAt: string;
  _count: { orders: number; tickets: number };
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = async () => {
    try { setLoading(true); const res = await axios.get("/api/admin/users", { params: { search } }); setUsers(res.data.users || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Users className="h-5 w-5 text-purple-400" /> User Management</h2>
        <div className="relative ml-auto w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="form-input pl-9 text-sm py-2 w-full" />
        </div>
      </div>
      <div className="glass-card neon-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-left text-xs text-white/40 uppercase">
              <th className="px-4 py-3">User</th><th className="px-4 py-3">Discord ID</th>
              <th className="px-4 py-3">Orders</th><th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {loading ? Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-8 w-full" /></td></tr>)) :
              users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-purple-500/20 flex-shrink-0">
                      {u.avatar ? <Image src={`https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.webp?size=64`} alt={u.username} width={32} height={32} /> :
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-purple-300">{u.username[0]}</div>}
                    </div>
                    <div><p className="font-medium text-white">{u.username}</p>{u.isAdmin && <span className="badge-purple text-xs">Admin</span>}</div>
                  </div></td>
                  <td className="px-4 py-3 font-mono text-xs text-white/40">{u.discordId}</td>
                  <td className="px-4 py-3 text-white/60">{u._count.orders}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</td>
                  <td className="px-4 py-3"><span className={u.isBanned ? "badge-red" : "badge-green"}>{u.isBanned ? "Banned" : "Active"}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => axios.patch(`/api/admin/users/${u.id}`, { isBanned: !u.isBanned }).then(fetchUsers)}
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${u.isBanned ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      <Ban className="h-3 w-3" />{u.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button onClick={() => axios.patch(`/api/admin/users/${u.id}`, { isAdmin: !u.isAdmin }).then(fetchUsers)}
                      className="flex items-center gap-1 rounded-lg bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400 hover:bg-purple-500/30 transition-colors">
                      <Crown className="h-3 w-3" />{u.isAdmin ? "Remove Admin" : "Make Admin"}
                    </button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PRODUCTS TAB ──────────────────────────────────────────────────────
export function AdminProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name:"", description:"", price:0, originalPrice:0, roleName:"", roleId:"", stock:null as number|null, duration:null as number|null, benefits:[""], isActive:true, isFeatured:false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchProducts(); }, []);
  const fetchProducts = async () => { try { setLoading(true); const r = await axios.get("/api/admin/products"); setProducts(r.data.products||[]); } catch(e){} finally { setLoading(false); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.roleId || !form.price) { setFormError("Name, Role ID and price are required"); return; }
    try {
      setSubmitting(true); setFormError("");
      const payload = { ...form, price: Math.round(Number(form.price)*100), originalPrice: form.originalPrice ? Math.round(Number(form.originalPrice)*100) : undefined, benefits: form.benefits.filter(Boolean) };
      if (editing) await axios.patch(`/api/admin/products/${editing.id}`, payload);
      else await axios.post("/api/admin/products", payload);
      setShowForm(false); fetchProducts();
    } catch(err:any) { setFormError(err.response?.data?.error||"Failed to save"); } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Package className="h-5 w-5 text-purple-400" /> Product Management</h2>
        <button onClick={() => { setEditing(null); setForm({ name:"", description:"", price:0, originalPrice:0, roleName:"", roleId:"", stock:null, duration:null, benefits:[""], isActive:true, isFeatured:false }); setShowForm(true); setFormError(""); }} className="btn-glow flex items-center gap-2 text-white text-sm py-2 px-4">+ New Product</button>
      </div>

      <AnimatePresence>{showForm && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="glass-card neon-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-white">{editing ? "Edit" : "Create"} Product</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="mb-1.5 block text-sm font-medium text-white/80">Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="form-input" placeholder="VIP Role" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-white/80">Role ID *</label><input value={form.roleId} onChange={e=>setForm({...form,roleId:e.target.value})} className="form-input font-mono text-sm" placeholder="123456789012345678" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-white/80">Role Name *</label><input value={form.roleName} onChange={e=>setForm({...form,roleName:e.target.value})} className="form-input" placeholder="VIP" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-white/80">Price THB *</label><input type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} className="form-input" min="0" step="0.01" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-white/80">Original Price THB</label><input type="number" value={form.originalPrice||""} onChange={e=>setForm({...form,originalPrice:Number(e.target.value)})} className="form-input" min="0" step="0.01" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-white/80">Stock (empty=unlimited)</label><input type="number" value={form.stock??""} onChange={e=>setForm({...form,stock:e.target.value?Number(e.target.value):null})} className="form-input" min="0" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-white/80">Duration days (empty=permanent)</label><input type="number" value={form.duration??""} onChange={e=>setForm({...form,duration:e.target.value?Number(e.target.value):null})} className="form-input" min="1" /></div>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium text-white/80">Description *</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="form-input min-h-20 resize-none" rows={3} /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-white/80">Benefits</label>
                <div className="space-y-2">
                  {form.benefits.map((b,i)=>(
                    <div key={i} className="flex gap-2">
                      <input value={b} onChange={e=>{const a=[...form.benefits];a[i]=e.target.value;setForm({...form,benefits:a});}} className="form-input text-sm flex-1" placeholder={`Benefit ${i+1}`} />
                      {i>0&&<button type="button" onClick={()=>setForm({...form,benefits:form.benefits.filter((_,j)=>j!==i)})} className="text-red-400"><X className="h-4 w-4"/></button>}
                    </div>
                  ))}
                  <button type="button" onClick={()=>setForm({...form,benefits:[...form.benefits,""]})} className="text-xs text-purple-400">+ Add benefit</button>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} className="custom-checkbox" /><span className="text-sm text-white/70">Active</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e=>setForm({...form,isFeatured:e.target.checked})} className="custom-checkbox" /><span className="text-sm text-white/70">Featured</span></label>
              </div>
              {formError&&<div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-glow flex items-center gap-2 px-6 py-2.5 text-white font-semibold">{submitting?<Loader2 className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}{editing?"Save":"Create"}</button>
                <button type="button" onClick={()=>setShowForm(false)} className="rounded-xl border border-white/20 bg-white/5 px-6 py-2.5 text-sm text-white hover:bg-white/10 transition-all">Cancel</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      <div className="glass-card neon-border overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full text-sm"><thead><tr className="border-b border-white/5 text-left text-xs text-white/40 uppercase">
          <th className="px-4 py-3">Product</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Sold</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
        </tr></thead>
        <tbody className="divide-y divide-white/5">
          {loading ? Array.from({length:4}).map((_,i)=><tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 w-full"/></td></tr>) :
          products.map(p=>(
            <tr key={p.id} className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-3"><div className="flex items-center gap-2"><Crown className="h-4 w-4 text-purple-400 flex-shrink-0"/><div><p className="font-medium text-white">{p.name}</p>{p.isFeatured&&<span className="badge-purple text-xs">Featured</span>}</div></div></td>
              <td className="px-4 py-3 font-mono text-xs text-white/60">{p.roleName}</td>
              <td className="px-4 py-3 text-purple-400 font-bold">฿{(p.price/100).toFixed(0)}</td>
              <td className="px-4 py-3 text-white/60">{p.soldCount}</td>
              <td className="px-4 py-3 text-white/60">{p.stock??'∞'}</td>
              <td className="px-4 py-3"><button onClick={()=>axios.patch(`/api/admin/products/${p.id}`,{isActive:!p.isActive}).then(fetchProducts)} className={p.isActive?"badge-green cursor-pointer":"badge-red cursor-pointer"}>{p.isActive?"Active":"Inactive"}</button></td>
              <td className="px-4 py-3"><div className="flex gap-2">
                <button onClick={()=>{setEditing(p);setForm({name:p.name,description:p.description,price:p.price/100,originalPrice:(p.originalPrice||0)/100,roleName:p.roleName,roleId:p.roleId,stock:p.stock??null,duration:p.duration??null,benefits:p.benefits.length>0?p.benefits:[""],isActive:p.isActive,isFeatured:p.isFeatured});setShowForm(true);setFormError("");}} className="flex items-center gap-1 rounded-lg bg-blue-500/20 px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/30 transition-colors"><Edit2 className="h-3 w-3"/>Edit</button>
                <button onClick={()=>{if(confirm("Delete?"))axios.delete(`/api/admin/products/${p.id}`).then(fetchProducts);}} className="flex items-center gap-1 rounded-lg bg-red-500/20 px-2 py-1 text-xs text-red-400 hover:bg-red-500/30 transition-colors"><Trash2 className="h-3 w-3"/>Delete</button>
              </div></td>
            </tr>
          ))}
        </tbody></table>
      </div></div>
    </div>
  );
}

// ─── ADMIN TICKETS TAB ───────────────────────────────────────────────────────
const STATUSES = ["PENDING","IN_PROGRESS","RESOLVED","FAILED","CLOSED"];
const STATUS_COLORS: Record<string,string> = { PENDING:"badge-yellow", IN_PROGRESS:"badge-purple", RESOLVED:"badge-green", FAILED:"badge-red", CLOSED:"badge-red" };

export function AdminTicketsTab() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => { fetchTickets(); }, [filterStatus]);
  const fetchTickets = async () => {
    try { setLoading(true); const r = await axios.get("/api/admin/tickets", { params:{ status: filterStatus!=="all"?filterStatus:undefined } }); setTickets(r.data.tickets||[]); }
    catch(e){} finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Ticket className="h-5 w-5 text-purple-400"/> Ticket Management</h2>
        <div className="flex gap-2 ml-auto flex-wrap">{["all",...STATUSES].map(s=><button key={s} onClick={()=>setFilterStatus(s)} className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${filterStatus===s?"bg-purple-600 text-white":"border border-white/10 bg-white/5 text-white/60 hover:text-white"}`}>{s==="all"?"All":s.replace("_"," ")}</button>)}</div>
      </div>
      {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div> :
       tickets.length===0 ? <div className="py-16 text-center"><Ticket className="mx-auto h-12 w-12 text-white/20 mb-3"/><p className="text-white/50">No tickets found</p></div> :
      <div className="space-y-3">{tickets.map(ticket=>(
        <div key={ticket.id} className="glass-card neon-border overflow-hidden">
          <button onClick={()=>setExpandedId(expandedId===ticket.id?null:ticket.id)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left">
            <div className="flex items-center gap-3"><span className="font-mono text-xs text-white/30">#{ticket.ticketNumber}</span>
              <div><p className="text-sm font-semibold text-white">{ticket.subject}</p><p className="text-xs text-white/40">@{ticket.user.username} • {ticket.category}</p></div>
            </div>
            <div className="flex items-center gap-2"><span className={STATUS_COLORS[ticket.status]}>{ticket.status.replace("_"," ")}</span><ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${expandedId===ticket.id?"rotate-180":""}`}/></div>
          </button>
          {expandedId===ticket.id && (
            <div className="border-t border-white/10 p-4 space-y-4">
              <div className="flex gap-2 flex-wrap">{STATUSES.map(s=><button key={s} onClick={()=>axios.patch(`/api/admin/tickets/${ticket.id}`,{status:s}).then(fetchTickets)} className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${ticket.status===s?"bg-purple-600 text-white":"border border-white/10 bg-white/5 text-white/60 hover:text-white"}`}>{s.replace("_"," ")}</button>)}</div>
              {ticket.replies?.length>0&&<div className="space-y-2">{ticket.replies.map((r:any)=><div key={r.id} className={`rounded-xl p-3 text-sm ${r.isAdmin?"bg-purple-500/10 border border-purple-500/30":"bg-white/5"}`}><p className={`text-xs font-medium mb-1 ${r.isAdmin?"text-purple-300":"text-white/60"}`}>{r.isAdmin?"Admin":r.user.username}</p><p className="text-white/70">{r.message}</p></div>)}</div>}
              <div className="flex gap-2"><input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Reply to user..." className="form-input flex-1 text-sm py-2"/><button onClick={()=>axios.post(`/api/admin/tickets/${ticket.id}/reply`,{message:replyText}).then(()=>{setReplyText("");fetchTickets();})} className="btn-glow px-4 text-sm text-white">Send</button></div>
            </div>
          )}
        </div>
      ))}</div>}
    </div>
  );
}

// ─── ADMIN COUPONS TAB ───────────────────────────────────────────────────────
export function AdminCouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code:"", discountType:"PERCENTAGE", discountValue:10, maxUses:"", expiresAt:"", isActive:true });

  useEffect(() => { fetchCoupons(); }, []);
  const fetchCoupons = async () => { try { setLoading(true); const r=await axios.get("/api/admin/coupons"); setCoupons(r.data.coupons||[]); } catch(e){} finally { setLoading(false); } };
  const handleCreate = async (e:React.FormEvent) => { e.preventDefault(); await axios.post("/api/admin/coupons",{...form,discountValue:Number(form.discountValue),maxUses:form.maxUses?Number(form.maxUses):null}); setShowForm(false); setForm({code:"",discountType:"PERCENTAGE",discountValue:10,maxUses:"",expiresAt:"",isActive:true}); fetchCoupons(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Tag className="h-5 w-5 text-purple-400"/> Coupon Management</h2>
        <button onClick={()=>setShowForm(!showForm)} className="btn-glow text-white text-sm py-2 px-4">+ New Coupon</button>
      </div>
      {showForm&&<form onSubmit={handleCreate} className="glass-card neon-border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-white/80 mb-1 block">Code *</label><input value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} className="form-input" placeholder="SUMMER20"/></div>
          <div><label className="text-sm text-white/80 mb-1 block">Type</label><select value={form.discountType} onChange={e=>setForm({...form,discountType:e.target.value})} className="form-input cursor-pointer"><option value="PERCENTAGE" className="bg-[#0d0920]">Percentage</option><option value="FIXED" className="bg-[#0d0920]">Fixed (THB)</option></select></div>
          <div><label className="text-sm text-white/80 mb-1 block">Value *</label><input type="number" value={form.discountValue} onChange={e=>setForm({...form,discountValue:Number(e.target.value)})} className="form-input"/></div>
          <div><label className="text-sm text-white/80 mb-1 block">Max Uses</label><input type="number" value={form.maxUses} onChange={e=>setForm({...form,maxUses:e.target.value})} className="form-input" placeholder="∞"/></div>
          <div><label className="text-sm text-white/80 mb-1 block">Expires At</label><input type="date" value={form.expiresAt} onChange={e=>setForm({...form,expiresAt:e.target.value})} className="form-input"/></div>
        </div>
        <button type="submit" className="btn-glow text-white text-sm py-2 px-6">Create Coupon</button>
      </form>}
      <div className="glass-card neon-border overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b border-white/5 text-left text-xs text-white/40 uppercase"><th className="px-4 py-3">Code</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Used</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
        <tbody className="divide-y divide-white/5">
          {loading ? Array.from({length:3}).map((_,i)=><tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-8 w-full"/></td></tr>) :
          coupons.map(c=><tr key={c.id} className="hover:bg-white/5 transition-colors">
            <td className="px-4 py-3 font-mono font-bold text-purple-400">{c.code}</td>
            <td className="px-4 py-3 text-white/60">{c.discountType}</td>
            <td className="px-4 py-3 text-white">{c.discountType==="PERCENTAGE"?`${c.discountValue}%`:`฿${(c.discountValue/100).toFixed(0)}`}</td>
            <td className="px-4 py-3 text-white/60">{c.usedCount}{c.maxUses?`/${c.maxUses}`:""}</td>
            <td className="px-4 py-3"><span className={c.isActive?"badge-green":"badge-red"}>{c.isActive?"Active":"Inactive"}</span></td>
            <td className="px-4 py-3"><button onClick={()=>axios.patch(`/api/admin/coupons/${c.id}`,{isActive:!c.isActive}).then(fetchCoupons)} className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${c.isActive?"bg-red-500/20 text-red-400":"bg-green-500/20 text-green-400"}`}>{c.isActive?"Disable":"Enable"}</button></td>
          </tr>)}
        </tbody>
      </table></div>
    </div>
  );
}

// ─── ADMIN ANNOUNCEMENTS TAB ──────────────────────────────────────────────────
export function AdminAnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [form, setForm] = useState({ title:"", message:"", type:"info", isActive:true });

  useEffect(() => { fetchAnnouncements(); }, []);
  const fetchAnnouncements = async () => { try { const r=await axios.get("/api/admin/announcements"); setAnnouncements(r.data.announcements||[]); } catch(e){} };
  const handleCreate = async (e:React.FormEvent) => { e.preventDefault(); await axios.post("/api/admin/announcements",form); setForm({title:"",message:"",type:"info",isActive:true}); fetchAnnouncements(); };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Megaphone className="h-5 w-5 text-purple-400"/> Announcement Manager</h2>
      <form onSubmit={handleCreate} className="glass-card neon-border p-6 space-y-4">
        <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="form-input" placeholder="Announcement title..." />
        <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="form-input resize-none w-full" rows={3} placeholder="Message..." />
        <div className="flex gap-3 items-center">
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="form-input w-auto cursor-pointer">{["info","warning","success","error"].map(t=><option key={t} value={t} className="bg-[#0d0920] capitalize">{t}</option>)}</select>
          <button type="submit" className="btn-glow text-white text-sm py-2 px-6">Publish</button>
        </div>
      </form>
      <div className="space-y-3">{announcements.map(a=>(
        <div key={a.id} className="glass-card neon-border p-4 flex items-start justify-between gap-3">
          <div className="flex-1"><div className="flex items-center gap-2 mb-1"><p className="font-semibold text-white">{a.title}</p><span className={a.isActive?"badge-green":"badge-red"}>{a.isActive?"Active":"Inactive"}</span></div><p className="text-sm text-white/60">{a.message}</p></div>
          <button onClick={()=>axios.patch(`/api/admin/announcements/${a.id}`,{isActive:!a.isActive}).then(fetchAnnouncements)} className={`rounded-lg px-3 py-1 text-xs font-medium flex-shrink-0 transition-colors ${a.isActive?"bg-red-500/20 text-red-400":"bg-green-500/20 text-green-400"}`}>{a.isActive?"Disable":"Enable"}</button>
        </div>
      ))}</div>
    </div>
  );
}

// ─── ADMIN BOT TAB ───────────────────────────────────────────────────────────
export function AdminBotTab() {
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { axios.get("/api/admin/bot-settings").then(r=>setSettings(r.data.settings||{})).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  const handleSave = async () => { try { setSaving(true); await axios.put("/api/admin/bot-settings",{settings}); } catch(e){} finally { setSaving(false); } };

  const KEYS = [
    { key:"welcome_message", label:"Welcome DM" },
    { key:"purchase_success_message", label:"Purchase Success DM" },
    { key:"purchase_failed_message", label:"Purchase Failed DM" },
    { key:"verification_approved_message", label:"Verification Approved DM" },
    { key:"verification_rejected_message", label:"Verification Rejected DM" },
    { key:"ticket_created_message", label:"Ticket Created DM" },
    { key:"ticket_updated_message", label:"Ticket Updated DM" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Bot className="h-5 w-5 text-purple-400"/> Discord Bot Settings</h2>
        <button onClick={handleSave} disabled={saving} className="btn-glow text-white text-sm py-2 px-6">{saving?"Saving...":"Save All"}</button>
      </div>
      <p className="text-sm text-white/50">Variables: <code className="text-purple-400">{"{username}"}</code> <code className="text-purple-400">{"{role}"}</code> <code className="text-purple-400">{"{amount}"}</code> <code className="text-purple-400">{"{level}"}</code> <code className="text-purple-400">{"{reason}"}</code> <code className="text-purple-400">{"{status}"}</code> <code className="text-purple-400">{"{ticket_id}"}</code></p>
      {loading ? <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div> :
      <div className="space-y-4">{KEYS.map(s=>(
        <div key={s.key} className="glass-card neon-border p-4">
          <label className="text-sm font-medium text-white/80 mb-2 block">{s.label}</label>
          <textarea value={settings[s.key]||""} onChange={e=>setSettings({...settings,[s.key]:e.target.value})} className="form-input resize-none w-full" rows={3} placeholder={`Enter ${s.label.toLowerCase()}...`}/>
        </div>
      ))}</div>}
    </div>
  );
}

// ─── ADMIN LOGS TAB ──────────────────────────────────────────────────────────
export function AdminLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { axios.get("/api/admin/logs").then(r=>setLogs(r.data.logs||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><FileText className="h-5 w-5 text-purple-400"/> Audit Logs</h2>
      <div className="glass-card neon-border overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full text-sm"><thead><tr className="border-b border-white/5 text-left text-xs text-white/40 uppercase"><th className="px-4 py-3">Admin</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Time</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {loading ? Array.from({length:5}).map((_,i)=><tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-8 w-full"/></td></tr>) :
            logs.map(log=><tr key={log.id} className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-white font-medium">{log.performer?.username||"System"}</td>
              <td className="px-4 py-3"><span className="badge-purple">{log.action}</span></td>
              <td className="px-4 py-3 text-white/60">{log.target?.username||"—"}</td>
              <td className="px-4 py-3 text-white/60 max-w-xs truncate">{log.description}</td>
              <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{formatDistanceToNow(new Date(log.createdAt),{addSuffix:true})}</td>
            </tr>)}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
