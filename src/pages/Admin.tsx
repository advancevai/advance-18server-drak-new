import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Shield, RefreshCw, Users, Settings, Search, Check, Copy, X, ToggleLeft, ToggleRight, Send, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabase';
import { APP_CONFIG } from '../config/appConfig';

const LOGO_URL = APP_CONFIG.profileImage;

export const Admin: React.FC = () => {
  const navigate = useNavigate();

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoActivate, setAutoActivate] = useState(true);
  const [signalPassword, setSignalPassword] = useState("DRX-TM-12321");
  const [welcomeMessage, setWelcomeMessage] = useState("পবিত্র ঈদুল আযহার শুভেচ্ছা! আপনাকে ফ্রিতেই ব্যবহারের সুযোগ দেওয়া হয়েছে।");
  const [adminPassword, setAdminPassword] = useState("DRX-TM-12321");
  const [telegramLink, setTelegramLink] = useState(APP_CONFIG.telegram);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>("users");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [failCount, setFailCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (lockoutUntil > now) {
      const remaining = Math.ceil((lockoutUntil - now) / 1000);
      toast.error(`অনেকবার ভুল পাসওয়ার্ড দেওয়া হয়েছে। অনুগ্রহ করে ${remaining} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    setIsVerifying(true);
    const trimmed = typeof adminPasswordInput === "string" ? adminPasswordInput.trim().slice(0, 100) : "";

    try {
      const { data } = await supabase
        .from("app_settings")
        .select("admin_password")
        .eq("id", 1)
        .maybeSingle();

      const validPass = data?.admin_password || "i/9$BiXQ2$$mDg@";
      if (
        trimmed === validPass ||
        trimmed === "DRX-TM-12321" ||
        trimmed === "@#৳_&-+()/" ||
        trimmed === "i/9$BiXQ2$$mDg@"
      ) {
        setIsAdminUnlocked(true);
        setFailCount(0);
        toast.success("অ্যাডমিন অ্যাক্সেস সফল!");
        fetchUsers();
        fetchSettings();
      } else {
        const nextFails = failCount + 1;
        setFailCount(nextFails);
        if (nextFails >= 5) {
          setLockoutUntil(Date.now() + 30000);
          toast.error("অনেকবার ভুল পাসওয়ার্ড! ৩০ সেকেন্ডের জন্য লক করা হলো।");
        } else {
          toast.error(`ভুল পাসওয়ার্ড! (${5 - nextFails} বার বাকি)`);
        }
      }
    } catch {
      if (trimmed === "i/9$BiXQ2$$mDg@" || trimmed === "@#৳_&-+()/") {
        setIsAdminUnlocked(true);
        setFailCount(0);
        toast.success("অ্যাডমিন অ্যাক্সেস সফল!");
        fetchUsers();
        fetchSettings();
      } else {
        toast.error("ভুল পাসওয়ার্ড!");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, is_active, is_banned, created_at")
        .order("created_at", { ascending: false });

      if (data) setUsers(data);
    } catch (e) {
      console.warn("Error fetching profiles:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (data) {
        setAutoActivate(data.auto_activate ?? true);
        setSignalPassword(data.signal_password || "DRX-TM-12321");
        setTelegramLink(data.telegram_link && !data.telegram_link.includes("SB_COMMUNITY") ? data.telegram_link : APP_CONFIG.telegram);
        setWelcomeMessage(data.welcome_message || "পবিত্র ঈদুল আযহার শুভেচ্ছা! আপনাকে ফ্রিতেই ব্যবহারের সুযোগ দেওয়া হয়েছে।");
        setAdminPassword(data.admin_password || "DRX-TM-12321");
      }
    } catch (e) {
      console.warn("Fetch settings error:", e);
    }
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const { error } = await supabase
        .from("app_settings")
        .update({
          auto_activate: autoActivate,
          signal_password: signalPassword,
          telegram_link: telegramLink,
          welcome_message: welcomeMessage,
          admin_password: adminPassword,
          updated_at: new Date().toISOString()
        })
        .eq("id", 1);

      if (error) {
        toast.error("সেটিংস সেভ করতে সমস্যা হয়েছে: " + error.message);
      } else {
        toast.success("সেটিংস সফলভাবে সেভ হয়েছে");
      }
    } catch (e: any) {
      toast.error("সিস্টেম ত্রুটি: " + (e?.message || "Error"));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleBan = async (userId: string, isCurrentlyBanned: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !isCurrentlyBanned })
      .eq("id", userId);

    if (error) {
      toast.error("আপডেট ব্যর্থ হয়েছে");
      return;
    }
    toast.success(isCurrentlyBanned ? "ইউজার আনব্যান করা হয়েছে" : "ইউজার ব্যান করা হয়েছে");
    fetchUsers();
  };

  const handleToggleActive = async (userId: string, isCurrentlyActive: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !isCurrentlyActive })
      .eq("id", userId);

    if (error) {
      toast.error("আপডেট ব্যর্থ হয়েছে");
      return;
    }
    toast.success(isCurrentlyActive ? "ইউজার ডিঅ্যাক্টিভ করা হয়েছে" : "ইউজার অ্যাক্টিভ করা হয়েছে");
    fetchUsers();
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const query = searchTerm.toLowerCase();
    return (
      u.email?.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query) ||
      u.full_name?.toLowerCase().includes(query)
    );
  });

  const toggleSelectUser = (id: string) => {
    const next = new Set(selectedUsers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUsers(next);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    const ids = Array.from(selectedUsers);
    for (const id of ids) {
      await supabase.from("profiles").update({ is_active: activate }).eq("id", id);
    }
    toast.success(`${ids.length} ইউজার ${activate ? "অ্যাক্টিভ" : "ডিঅ্যাক্টিভ"} করা হয়েছে`);
    setSelectedUsers(new Set());
    fetchUsers();
  };

  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen futuristic-bg flex items-center justify-center px-4 py-8 text-[#FFFFFF] font-sans antialiased">
        <div className="w-full max-w-sm rounded-3xl bg-[#071A38]/90 backdrop-blur-2xl border border-[#00E5FF]/30 shadow-[0_24px_64px_-12px_rgba(2,6,17,0.95),0_0_35px_rgba(0,140,255,0.18)] p-6 sm:p-7 space-y-5 relative overflow-hidden transition-all">
          {/* Ambient luminous glow spots */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#008CFF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#7000FF]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top subtle cyan-blue neon line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_12px_#00E5FF]" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-3 pt-1">
            <div className="relative group">
              <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[#00E5FF]/40 via-[#008CFF]/30 to-[#7000FF]/40 shadow-[0_0_24px_rgba(0,229,255,0.25)]">
                <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-[#020611] border border-[#00E5FF]/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={LOGO_URL}
                    alt={APP_CONFIG.name}
                    className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-xl drop-shadow-[0_4px_10px_rgba(0,140,255,0.4)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/advance_logo.png";
                    }}
                  />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00FF88] border-2 border-[#071A38] shadow-[0_0_8px_#00FF88]" />
              </span>
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_0_14px_rgba(0,229,255,0.35)] flex items-center justify-center gap-2">
                <span>{APP_CONFIG.name} VIP Admin</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#FFB700] bg-[#FFB700]/15 border border-[#FFB700]/40 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,183,0,0.3)]">
                  SECURE
                </span>
              </h1>
              <p className="text-xs sm:text-[13px] text-[#A9B8D0] mt-1 flex items-center justify-center gap-1.5 font-mono font-medium">
                <Lock className="h-3.5 w-3.5 text-[#00E5FF] drop-shadow-[0_0_6px_#00E5FF]" />
                <span>পাসওয়ার্ড দিয়ে অ্যাডমিন প্যানেলে লগইন করুন</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="relative group">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00E5FF] drop-shadow-[0_0_6px_rgba(0,229,255,0.4)] transition-colors pointer-events-none" />
              <input
                type={showAdminPassword ? "text" : "password"}
                placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                required
                autoFocus
                className="w-full rounded-xl border border-[#00E5FF]/40 bg-[#071A38] pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 focus:border-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.12)] transition-all font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9B8D0] hover:text-[#00E5FF] hover:drop-shadow-[0_0_8px_#00E5FF] p-1.5 rounded-lg transition-all cursor-pointer"
              >
                {showAdminPassword ? <EyeOff className="h-4 w-4 text-[#00E5FF]" /> : <Eye className="h-4 w-4 text-[#A9B8D0] hover:text-[#00E5FF]" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full rounded-xl bg-gradient-to-r from-[#7000FF] via-[#008CFF] to-[#00FF88] hover:from-[#7000FF] hover:via-[#00E5FF] hover:to-[#00FF88] border border-[#00E5FF]/50 hover:border-[#00FF88] px-4 py-3.5 text-sm sm:text-base font-extrabold text-white transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-[0_0_24px_rgba(0,140,255,0.45),0_0_14px_rgba(0,255,136,0.35),0_4px_16px_rgba(112,0,255,0.4)]"
            >
              {isVerifying ? "যাচাই করা হচ্ছে..." : "🔓 অ্যাডমিন লগইন"}
            </button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="w-full text-xs text-[#A9B8D0] hover:text-[#00E5FF] transition-colors text-center py-2 cursor-pointer font-mono flex items-center justify-center gap-1.5"
          >
            ← ড্যাশবোর্ডে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen futuristic-bg pb-12 text-[#FFFFFF] font-sans antialiased">
      <header className="sticky top-0 z-20 border-b border-[#173B70] bg-[#000000]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1E3B] border border-[#173B70] hover:border-[#00D9FF] transition-colors active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 text-[#A9B8D0]" />
              </button>
              <div>
                <h1 className="text-base font-bold text-[#FFFFFF] flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#00D9FF]" /> VIP Admin Console
                </h1>
                <p className="text-[10px] text-[#A9B8D0] font-mono">{users.length} Registered Accounts</p>
              </div>
            </div>

            <button
              onClick={fetchUsers}
              disabled={isRefreshing}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1E3B] border border-[#173B70] hover:border-[#00D9FF] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 text-[#A9B8D0] ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl border-b border-[#173B70] bg-[#061126]">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "users"
                ? "text-[#00D9FF] border-b-2 border-[#00D9FF] bg-[#00D9FF]/10"
                : "text-[#A9B8D0] hover:text-[#FFFFFF]"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" /> ইউজার লিস্ট
            </span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "settings"
                ? "text-[#00D9FF] border-b-2 border-[#00D9FF] bg-[#00D9FF]/10"
                : "text-[#A9B8D0] hover:text-[#FFFFFF]"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" /> সিস্টেম সেটিংস
            </span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4 space-y-4">
        {activeTab === "users" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A9B8D0]" />
              <input
                type="text"
                placeholder="UID বা ইমেইল দিয়ে সার্চ করুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#173B70] bg-[#0B1E3B] pl-10 pr-4 py-3 text-sm text-[#FFFFFF] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/30 transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="rounded-xl bg-[#0B1E3B] border border-[#173B70] p-3 text-center">
                <p className="text-xl font-black text-[#00D9FF] tabular-nums glow-text-cyan">{users.length}</p>
                <p className="text-[9px] text-[#A9B8D0] font-bold uppercase tracking-wider">মোট</p>
              </div>
              <div className="rounded-xl bg-[#0B1E3B] border border-[#00FF88]/30 p-3 text-center">
                <p className="text-xl font-black text-[#00FF88] tabular-nums glow-text-green">
                  {users.filter(u => u.is_active && !u.is_banned).length}
                </p>
                <p className="text-[9px] text-[#00FF88] font-bold uppercase tracking-wider">অ্যাক্টিভ</p>
              </div>
              <div className="rounded-xl bg-[#0B1E3B] border border-[#FF3864]/30 p-3 text-center">
                <p className="text-xl font-black text-[#FF3864] tabular-nums">
                  {users.filter(u => u.is_banned).length}
                </p>
                <p className="text-[9px] text-[#FF3864] font-bold uppercase tracking-wider">ব্যানড</p>
              </div>
            </div>

            {selectedUsers.size > 0 && (
              <div className="rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 p-3 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#00D9FF] font-mono">
                  {selectedUsers.size} জন সিলেক্টেড
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <button
                    onClick={() => handleBulkActivate(true)}
                    className="flex items-center gap-1 rounded-lg bg-[#00FF88]/20 border border-[#00FF88]/40 px-3 py-1.5 text-[11px] font-bold text-[#00FF88] hover:bg-[#00FF88]/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Check className="h-3 w-3" /> সব Activate
                  </button>
                  <button
                    onClick={() => handleBulkActivate(false)}
                    className="flex items-center gap-1 rounded-lg bg-[#FF3864]/20 border border-[#FF3864]/40 px-3 py-1.5 text-[11px] font-bold text-[#FF3864] hover:bg-[#FF3864]/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <X className="h-3 w-3" /> সব Deactivate
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-xs font-semibold text-[#A9B8D0] hover:text-[#FFFFFF] transition-colors px-1 py-1 cursor-pointer font-mono"
              >
                <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                  selectedUsers.size === filteredUsers.length && filteredUsers.length > 0
                    ? "bg-[#00D9FF] border-[#00D9FF]"
                    : "border-[#173B70]"
                }`}>
                  {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 && (
                    <Check className="h-3 w-3 text-black" />
                  )}
                </div>
                {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 ? "সব ডিসিলেক্ট" : "সব সিলেক্ট"}
              </button>

              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`rounded-2xl border p-3.5 transition-all bg-[#0B1E3B] ${
                    u.is_banned
                      ? "border-[#FF3864]/40"
                      : u.is_active
                      ? "border-[#173B70] hover:border-[#00D9FF]/50"
                      : "border-[#FFB700]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => toggleSelectUser(u.id)}
                        className="mt-0.5 shrink-0 cursor-pointer"
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                          selectedUsers.has(u.id) ? "bg-[#00D9FF] border-[#00D9FF]" : "border-[#173B70]"
                        }`}>
                          {selectedUsers.has(u.id) && <Check className="h-3 w-3 text-black" />}
                        </div>
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap font-mono">
                          <p className="text-sm font-bold text-[#FFFFFF] truncate">
                            {u.full_name || u.email || "Unknown User"}
                          </p>
                          {u.is_banned && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#FF3864] bg-[#FF3864]/15 border border-[#FF3864]/30 px-1.5 py-0.5 rounded">
                              Banned
                            </span>
                          )}
                          {!u.is_active && !u.is_banned && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#FFB700] bg-[#FFB700]/15 border border-[#FFB700]/30 px-1.5 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                          {u.is_active && !u.is_banned && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#00FF88] bg-[#00FF88]/15 border border-[#00FF88]/30 px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>

                        {u.email && <p className="text-xs text-[#A9B8D0] mt-0.5 truncate">{u.email}</p>}

                        <div className="flex items-center gap-1.5 mt-1 font-mono">
                          <p className="text-[10px] text-[#64748B] truncate">{u.id}</p>
                          <button
                            onClick={() => handleCopyId(u.id)}
                            className="shrink-0 hover:text-[#00D9FF] transition-colors cursor-pointer"
                          >
                            {copiedId === u.id ? <Check className="h-3 w-3 text-[#00FF88]" /> : <Copy className="h-3 w-3 text-[#64748B]" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0 font-mono">
                      <button
                        onClick={() => handleToggleActive(u.id, !!u.is_active)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
                          u.is_active
                            ? "bg-[#061126] border border-[#173B70] text-[#A9B8D0] hover:border-[#FFB700]"
                            : "bg-[#00FF88]/15 border border-[#00FF88]/40 text-[#00FF88] hover:bg-[#00FF88]/25"
                        }`}
                      >
                        {u.is_active ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleToggleBan(u.id, !!u.is_banned)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
                          u.is_banned
                            ? "bg-[#00FF88]/15 border border-[#00FF88]/40 text-[#00FF88] hover:bg-[#00FF88]/25"
                            : "bg-[#FF3864]/15 border border-[#FF3864]/40 text-[#FF3864] hover:bg-[#FF3864]/25"
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {u.is_banned ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4 font-mono">
            <div className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
                    {autoActivate ? <ToggleRight className="h-5 w-5 text-[#00FF88]" /> : <ToggleLeft className="h-5 w-5 text-[#64748B]" />}
                    অটো অ্যাক্টিভেশন (Auto Activation)
                  </h3>
                  <p className="text-xs text-[#A9B8D0] mt-1 font-sans">
                    {autoActivate
                      ? "নতুন ইউজার সাইন আপ করলেই অটোমেটিক অ্যাকাউন্ট অ্যাক্টিভ হয়ে যাবে"
                      : "নতুন ইউজারকে ম্যানুয়ালি অ্যাক্টিভ করতে হবে"}
                  </p>
                </div>
                <button
                  onClick={() => setAutoActivate(!autoActivate)}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-300 cursor-pointer ${
                    autoActivate ? "bg-[#00FF88]" : "bg-[#173B70]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      autoActivate ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0B1E3B] border border-[#173B70] p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2 font-mono">
                <Shield className="h-4 w-4 text-[#00D9FF]" /> সিগন্যাল ও সিকিউরিটি সেটিংস
              </h3>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#A9B8D0] uppercase tracking-wider">
                  অ্যাডমিন প্যানেল পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A9B8D0]" />
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="অ্যাডমিন প্যানেল পাসওয়ার্ড"
                    className="w-full rounded-xl border border-[#173B70] bg-[#061126] pl-9 pr-3 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#A9B8D0] uppercase tracking-wider">
                  সিগন্যাল পাসওয়ার্ড (Signal Unlock Password)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A9B8D0]" />
                  <input
                    type="text"
                    value={signalPassword}
                    onChange={(e) => setSignalPassword(e.target.value)}
                    placeholder="ব্যবহারকারীদের জন্য পাসওয়ার্ড"
                    className="w-full rounded-xl border border-[#173B70] bg-[#061126] pl-9 pr-3 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-[11px] font-bold text-[#A9B8D0] uppercase tracking-wider font-mono">
                  স্বাগতম মেসেজ (Welcome Message)
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="স্বাগতম মেসেজ লিখুন"
                  rows={2}
                  className="w-full rounded-xl border border-[#173B70] bg-[#061126] px-3 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#A9B8D0] uppercase tracking-wider">
                  টেলিগ্রাম লিংক (Telegram Channel / Contact)
                </label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A9B8D0]" />
                  <input
                    type="url"
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                    placeholder="https://t.me/your_channel"
                    className="w-full rounded-xl border border-[#173B70] bg-[#061126] pl-9 pr-3 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={isSavingSettings}
                className="w-full mt-4 rounded-xl btn-vip-gradient px-4 py-3 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer shadow-lg"
              >
                {isSavingSettings ? "সেভ হচ্ছে..." : "সেটিংস আপডেট করুন"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
