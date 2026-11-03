import React, { useState, useEffect, useRef } from 'react';
import { XIcon, DiscordIcon } from './Icons';
import { Language } from '../types';

interface CommunityWidgetsProps {
   lang: Language;
}

/* ============ 3D tilt engine (pointer-fine only, GPU transforms) ============ */
function useTilt(max = 9) {
   const ref = useRef<HTMLDivElement>(null);
   const fine = useRef(false);
   const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 20, on: false });
   useEffect(() => {
      fine.current =
         window.matchMedia('(pointer: fine)').matches &&
         !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   }, []);
   const move = (e: React.PointerEvent) => {
      if (!fine.current || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      setTilt({ ry: (px - 0.5) * max * 2, rx: (0.5 - py) * max * 2, gx: px * 100, gy: py * 100, on: true });
   };
   const leave = () => setTilt((s) => ({ ...s, rx: 0, ry: 0, on: false }));
   return { ref, tilt, move, leave };
}

const tiltStyle = (tilt: { rx: number; ry: number; on: boolean }): React.CSSProperties => ({
   transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.on ? 1.015 : 1})`,
   transition: tilt.on ? 'transform 0.12s ease-out' : 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
   transformStyle: 'preserve-3d',
   willChange: 'transform',
});

const CardSkeleton: React.FC<{ glow: string }> = ({ glow }) => (
   <div className="w-full rounded-[26px] border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-5 animate-pulse" aria-hidden="true">
      <div className="h-20 rounded-2xl bg-white/[0.06]" />
      <div className="flex items-center gap-3 mt-4">
         <div className="w-14 h-14 rounded-2xl" style={{ background: glow }} />
         <div className="flex-1">
            <div className="h-4 rounded-lg bg-white/10 w-2/3" />
            <div className="h-3 rounded-lg bg-white/[0.07] w-1/3 mt-2" />
         </div>
      </div>
      <div className="h-12 rounded-2xl bg-white/[0.06] mt-4" />
   </div>
);

/* ============================ X — Ab2dy (@xAb2dy) ============================
   Live profile data, refreshed every 5 minutes:
     1) FixTweet API (avatar, banner, bio, followers, verified)
     2) In-brand snapshot — the Ab2dy mark and plate stand in until the API answers */
const X_HANDLE = 'xAb2dy';
const X_URL = 'https://x.com/xAb2dy';
const X_AVATAR_FALLBACK = '/ab2dy-logo.webp';
const X_BANNER_FALLBACK = '/bg-ab2dy.webp';

interface XLive {
   name: string;
   handle: string;
   bio: string;
   location: string;
   joined: string;
   followers: number;
   following: number;
   tweets: number;
   avatar: string;
   banner: string;
   verified: boolean;
}

const X_FALLBACK: XLive = {
   name: 'Ab2dy',
   handle: 'xAb2dy',
   bio: 'ستريمر سعودي على كيك — بثوث، تحديات وسهرات ما تنسى.',
   location: 'kick.com/ab2dy',
   joined: '',
   followers: 8472,
   following: 169,
   tweets: 181,
   avatar: X_AVATAR_FALLBACK,
   banner: X_BANNER_FALLBACK,
   verified: true,
};

const joinedLabel = (raw: unknown, isRTL: boolean) => {
   if (typeof raw !== 'string' && typeof raw !== 'number') return '';
   const d = new Date(raw);
   if (isNaN(d.getTime())) return '';
   return new Intl.DateTimeFormat(isRTL ? 'ar' : 'en', { month: 'long', year: 'numeric' }).format(d);
};

const fmtCompact = (n: number) =>
   n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

export const XWidget: React.FC<CommunityWidgetsProps> = ({ lang }) => {
   const [data, setData] = useState<XLive>(X_FALLBACK);
   const [loading, setLoading] = useState(true);
   const { ref, tilt, move, leave } = useTilt(9);
   const isRTL = lang === 'ar';

   useEffect(() => {
      let dead = false;
      const fetchX = async () => {
         try {
            const res = await fetch(`https://api.fxtwitter.com/${X_HANDLE}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const j = await res.json();
            const u = j?.user;
            if (!dead && u) {
               setData({
                  name: u.name || X_FALLBACK.name,
                  handle: u.screen_name || X_FALLBACK.handle,
                  bio: (u.description || X_FALLBACK.bio).split('\n')[0],
                  location: u.location || X_FALLBACK.location,
                  joined: String(u.joined_at ?? u.joined ?? ''),
                  followers: Number(u.followers) || X_FALLBACK.followers,
                  following: Number(u.following) || X_FALLBACK.following,
                  tweets: Number(u.tweets) || X_FALLBACK.tweets,
                  avatar: String(u.avatar_url || X_FALLBACK.avatar).replace('_normal.', '_400x400.'),
                  banner: u.banner_url ? `${u.banner_url}/1500x500` : X_BANNER_FALLBACK,
                  verified: Boolean(u.verification?.verified ?? true),
               });
            }
         } catch {
            /* silent — verified fallback snapshot stays */
         } finally {
            if (!dead) setLoading(false);
         }
      };
      fetchX();
      const interval = setInterval(fetchX, 5 * 60 * 1000);
      return () => { dead = true; clearInterval(interval); };
   }, []);

   if (loading) return <CardSkeleton glow="rgba(255,255,255,0.22)" />;

   const joined = joinedLabel(data.joined, isRTL);

   return (
      <div className="perspective-1000 h-full">
         <div
            ref={ref}
            onPointerMove={move}
            onPointerLeave={leave}
            style={tiltStyle(tilt)}
            className="group relative h-full rounded-[26px] p-[1.5px] bg-gradient-to-b from-white/60 via-[#5BE817]/40 to-white/[0.06] shadow-[0_24px_70px_-20px_rgba(91,232,23,0.45)]"
         >
            <div className="relative h-full rounded-[24.5px] bg-[#08080a]/95 backdrop-blur-xl overflow-hidden flex flex-col">
               {/* pointer glare */}
               <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
                  style={{
                     opacity: tilt.on ? 1 : 0,
                     background: `radial-gradient(420px circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.14), transparent 65%)`,
                  }}
               />
               {/* color bleed — banner tones wash down the whole card, no boundary */}
               <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                  <img
                     src={data.banner}
                     alt=""
                     onError={(e) => { (e.target as HTMLImageElement).src = '/bg-ab2dy.webp'; }}
                     className="absolute top-0 inset-x-0 h-[48%] w-full object-cover blur-3xl opacity-30"
                     style={{ maskImage: 'linear-gradient(to bottom, black 25%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 25%, transparent 100%)' }}
                  />
               </div>
               {/* orbiting halo */}
               <div className="absolute -top-24 start-1/4 w-72 h-72 rounded-full bg-[#5BE817]/25 blur-[90px] animate-aurora pointer-events-none" />
               {/* banner — X cover, seamless melt, no edge lines */}
               <div className="relative h-32 sm:h-40 overflow-hidden shrink-0 bg-black">
                  <img
                     src={data.banner}
                     alt="Ab2dy X banner"
                     onError={(e) => { (e.target as HTMLImageElement).src = '/bg-ab2dy.webp'; }}
                     className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[2.5s] ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#08080a]/50 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#08080a] via-[#08080a]/55 to-transparent" />
                  <span className="absolute top-3 start-3 inline-flex items-center gap-2 px-3 py-1.5 bg-black/55 backdrop-blur border border-white/15 text-white/85">
                     <span className="led bg-white animate-pulse shadow-[0_0_8px_#fff]" />
                     <span className="kicker" dir="ltr">X // Live</span>
                  </span>
                  <span className="cut-tag absolute top-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[10px] font-black tracking-[0.2em]" dir="ltr">
                     <XIcon className="w-3.5 h-3.5" />
                     Ab2dy
                  </span>
               </div>
               {/* crest + title — straddles the melt */}
               <div className="relative px-5 -mt-10 flex items-end gap-3.5">
                  <div aria-hidden="true" className="absolute -top-8 inset-x-8 h-14 bg-white/10 blur-2xl pointer-events-none" />
                  <div className="relative shrink-0" style={{ transform: 'translateZ(45px)' }}>
                     <div className="absolute -inset-3 bg-[#5BE817]/50 blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 rounded-full" />
                     <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-white/70 ring-4 ring-[#08080a]/90 bg-black shadow-[0_16px_36px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                        <img src={data.avatar} alt="Ab2dy X avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/ab2dy-logo.webp'; }} />
                     </div>
                     <span className="absolute -bottom-1 -end-1 w-9 h-9 rounded-full bg-black border-2 border-white/70 flex items-center justify-center shadow-[0_0_14px_rgba(91,232,23,0.8)]">
                        <XIcon className="w-4 h-4 text-white" />
                     </span>
                  </div>
                  <div className="min-w-0 pb-1">
                     <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-none flex items-center gap-1.5" dir="ltr">
                        {data.name}
                        {data.verified && (
                           <svg className="w-4.5 h-4.5 w-[18px] h-[18px] text-[#5BE817] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.4 3.4-.5 1 3.3 3 1.6-1.4 3.2 1.4 3.2-3 1.6-1 3.3-3.4-.5L12 22l-2.4-2.4-3.4.5-1-3.3-3-1.6L3.6 12 2.2 8.8l3-1.6 1-3.3 3.4.5L12 2zm-1.1 12.4l4.5-4.5-1.4-1.4-3.1 3.1-1.5-1.5-1.4 1.4 2.9 2.9z" /></svg>
                        )}
                     </h3>
                     <p className="text-[11px] text-white/45 font-bold mt-1" dir="ltr">@{data.handle}</p>
                  </div>
                  <p className="ms-auto text-end shrink-0 pb-1">
                     <span className="jersey block text-3xl sm:text-4xl text-white leading-none" dir="ltr">{fmtCompact(data.followers)}</span>
                     <span className="kicker block text-white/50 mt-1">{lang === 'en' ? 'followers' : 'متابع'}</span>
                  </p>
               </div>
               {/* bio */}
               <div className="px-5 mt-3 relative">
                  <p className="text-[12.5px] leading-relaxed text-white/70 font-medium" dir="auto">{data.bio}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] font-bold text-white/40">
                     <span className="inline-flex items-center gap-1" dir="ltr">📍 {data.location}</span>
                     {joined && <span className="inline-flex items-center gap-1">🗓 {lang === 'en' ? `Joined ${joined}` : `انضم ${joined}`}</span>}
                  </p>
                  <div className="mt-2.5 flex items-center gap-4 text-[11px] font-black text-white/70" dir="ltr">
                     <span><span className="text-white">{data.following.toLocaleString('en-US')}</span> <span className="text-white/40 font-bold">{lang === 'en' ? 'Following' : 'يتابع'}</span></span>
                     <span><span className="text-white">{fmtCompact(data.followers)}</span> <span className="text-white/40 font-bold">{lang === 'en' ? 'Followers' : 'متابع'}</span></span>
                     <span><span className="text-white">{data.tweets.toLocaleString('en-US')}</span> <span className="text-white/40 font-bold">Posts</span></span>
                  </div>
               </div>
               {/* feed — live counts, links straight to the timeline */}
               <div className="px-5 mt-3.5 relative">
                  <p className="kicker text-white/30 mb-2" dir="ltr">// Feed</p>
                  <a href={X_URL} target="_blank" rel="noopener noreferrer"
                     className="group/post relative flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] p-3.5 min-h-[76px] transition-all duration-500 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-14px_rgba(91,232,23,0.5)]">
                     <span className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 bg-black">
                        <img src={data.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/ab2dy-logo.webp'; }} />
                     </span>
                     <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[11px] font-black text-white" dir="ltr">
                           @{data.handle}
                           {data.verified && <svg className="w-3.5 h-3.5 text-[#5BE817]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.4 3.4-.5 1 3.3 3 1.6-1.4 3.2 1.4 3.2-3 1.6-1 3.3-3.4-.5L12 22l-2.4-2.4-3.4.5-1-3.3-3-1.6L3.6 12 2.2 8.8l3-1.6 1-3.3 3.4.5L12 2zm-1.1 12.4l4.5-4.5-1.4-1.4-3.1 3.1-1.5-1.5-1.4 1.4 2.9 2.9z" /></svg>}
                        </span>
                        <span className="block text-[12.5px] sm:text-[13px] font-bold text-white/70 leading-snug mt-1">
                           {lang === 'en'
                              ? <>Latest posts — <span className="text-white">{data.tweets.toLocaleString('en-US')}</span> published</>
                              : <>آخر المنشورات — <span className="text-white">{data.tweets.toLocaleString('en-US')}</span> منشور</>}
                        </span>
                     </span>
                     <XIcon className="w-4 h-4 text-white/30 group-hover/post:text-white shrink-0 transition-colors" />
                  </a>
               </div>
               {/* CTA */}
               <div className="px-5 pb-5 mt-4 flex-1 flex items-end">
                  <a
                     href={X_URL}
                     target="_blank"
                     rel="noopener noreferrer"
                     aria-label={lang === 'en' ? 'Follow on X' : 'تابع على X'}
                     className="btn-arena card-sheen cut-btn relative w-full min-h-[54px] inline-flex items-center justify-center gap-2.5 bg-white text-black font-black text-sm tracking-wide shadow-[0_14px_36px_-10px_rgba(255,255,255,0.4)] overflow-hidden hover:bg-[#5BE817] hover:text-white transition-colors"
                  >
                     <XIcon className="w-5 h-5 shrink-0" />
                     {lang === 'en' ? 'FOLLOW ON X' : 'تابع على X'}
                     <svg className={`w-4 h-4 shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </a>
               </div>
            </div>
         </div>
      </div>
   );
};

/* ============================ DISCORD — AB2DY HQ (invite/migo) ============================
   Live guild stats, refreshed every 5 minutes:
     1) Discord public invite endpoint (?with_counts=true) straight from the browser
     2) /api/kick proxy as fallback (CORS / rate-limit safety net) */
const DISCORD_GUILD_ID = '1081240260027109416';
const DISCORD_INVITE_CODE = 'migo';
const DISCORD_INVITE_URL = `https://discord.com/invite/${DISCORD_INVITE_CODE}`;
const DISCORD_BANNER = '/bg-ab2dy.webp';
const DISCORD_MARK = '/ab2dy-logo.webp';

interface DiscordStats {
   members: number;
   online: number;
   name: string;
   channels: { name: string; type: number }[];
}

const compact = (n: number) =>
   n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `${n}`;

export const DiscordWidget: React.FC<CommunityWidgetsProps> = ({ lang }) => {
   const [stats, setStats] = useState<DiscordStats | null>(null);
   const [failed, setFailed] = useState(false);
   const { ref, tilt, move, leave } = useTilt(9);
   const isRTL = lang === 'ar';

   useEffect(() => {
      let dead = false;
      const apply = (d: any) => {
         if (!d?.guild && typeof d?.approximate_member_count !== 'number') return false;
         setStats({
            members: Number(d.approximate_member_count) || 0,
            online: Number(d.approximate_presence_count) || 0,
            name: d?.guild?.name || 'AB2DY',
            channels: Array.isArray(d?.channels) ? d.channels.slice(0, 3) : [],
         });
         return true;
      };
      const url = `https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`;
      const load = async () => {
         try {
            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), 8000);
            const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
            clearTimeout(t);
            if (r.ok && apply(await r.json())) { setFailed(false); return; }
         } catch {}
         try {
            const r = await fetch(`/api/kick?endpoint=${encodeURIComponent(url)}`);
            if (r.ok && apply(await r.json())) { setFailed(false); return; }
         } catch {}
         if (!dead) setFailed(true);
      };
      load();
      const interval = setInterval(load, 5 * 60 * 1000);
      return () => { dead = true; clearInterval(interval); };
   }, []);

   const live = [...(stats?.channels ?? [])].sort((a, b) => a.type - b.type);

   return (
      <div className="perspective-1000 h-full">
         <div
            ref={ref}
            onPointerMove={move}
            onPointerLeave={leave}
            style={tiltStyle(tilt)}
            className="group relative h-full rounded-[26px] p-[1.5px] bg-gradient-to-b from-[#5BE817]/80 via-[#A6FF5C]/30 to-white/[0.06] shadow-[0_24px_70px_-20px_rgba(91,232,23,0.5)]"
         >
            <div className="relative h-full rounded-[24.5px] bg-[#050A05]/95 backdrop-blur-xl overflow-hidden flex flex-col">
               <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
                  style={{
                     opacity: tilt.on ? 1 : 0,
                     background: `radial-gradient(420px circle at ${tilt.gx}% ${tilt.gy}%, rgba(91,232,23,0.24), transparent 65%)`,
                  }}
               />
               <div className="absolute -top-24 end-1/4 w-72 h-72 rounded-full bg-[#5BE817]/25 blur-[90px] animate-aurora pointer-events-none" />
               <div className="absolute -bottom-28 start-1/4 w-72 h-72 rounded-full bg-[#A6FF5C]/15 blur-[100px] animate-aurora pointer-events-none" style={{ animationDelay: '-8s' }} />

               {/* banner — the site's own obsidian HUD plate */}
               <div className="relative h-32 sm:h-40 overflow-hidden shrink-0">
                  <img
                     src={DISCORD_BANNER}
                     alt=""
                     aria-hidden="true"
                     className="absolute inset-0 w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-[2.5s] ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#050A05]/55 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#050A05] via-[#050A05]/60 to-transparent" />
                  <span className="absolute top-3 start-3 inline-flex items-center gap-2 px-3 py-1.5 bg-black/55 backdrop-blur border border-white/15 text-white/85">
                     <span className="led bg-[#5BE817] animate-pulse shadow-[0_0_8px_#5BE817]" />
                     <span className="kicker" dir="ltr">Discord // Guild</span>
                  </span>
                  <span className="absolute top-3 end-3 inline-flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] px-2.5 py-1 rounded-full bg-[#5BE817] text-black shadow-[0_0_18px_rgba(91,232,23,0.7)]" dir="ltr">
                     <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                     {stats && stats.online > 0 ? `${compact(stats.online)} ONLINE` : 'LIVE HQ'}
                  </span>
               </div>

               {/* crest + title */}
               <div className="relative px-5 -mt-10 flex items-end gap-3.5">
                  <div aria-hidden="true" className="absolute -top-8 inset-x-8 h-14 bg-[#5BE817]/20 blur-2xl pointer-events-none" />
                  <div className="relative shrink-0" style={{ transform: 'translateZ(45px)' }}>
                     <div className="absolute -inset-3 bg-[#5BE817]/60 blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 rounded-full" />
                     <div className="relative w-[72px] h-[72px] rounded-[22px] overflow-hidden border-2 border-[#5BE817]/70 ring-4 ring-[#050A05]/90 bg-[#050A05] shadow-[0_16px_36px_rgba(0,0,0,0.65),0_0_28px_rgba(91,232,23,0.45)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                        <img src={DISCORD_MARK} alt="Ab2dy emblem" className="w-full h-full object-cover" />
                     </div>
                     <span className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-[#5BE817] border-4 border-[#050A05] flex items-center justify-center shadow-[0_0_14px_rgba(91,232,23,0.8)]">
                        <DiscordIcon className="w-3.5 h-3.5 text-black" />
                     </span>
                  </div>
                  <div className="min-w-0 pb-1">
                     <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-none truncate" dir="ltr">
                        {stats?.name || 'AB2DY HQ'}
                     </h3>
                     <p className="text-[11px] text-white/45 font-bold mt-1" dir="ltr">discord.gg/{DISCORD_INVITE_CODE}</p>
                  </div>
                  <p className="ms-auto text-end shrink-0 pb-1">
                     <span className="jersey block text-3xl sm:text-4xl text-white leading-none" dir="ltr">
                        {stats && stats.members > 0 ? compact(stats.members) : '—'}
                     </span>
                     <span className="kicker block mt-1" style={{ color: '#5BE817' }}>{lang === 'en' ? 'members' : 'عضو'}</span>
                  </p>
               </div>

               {/* live rooms ribbon — straight from the guild */}
               <div className="px-5 mt-3.5 relative">
                  <div className="rounded-2xl border border-[#5BE817]/35 bg-gradient-to-l from-[#5BE817]/15 via-[#A6FF5C]/[0.07] to-transparent backdrop-blur-md px-3.5 py-2.5 flex items-center gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                     <span className="w-12 h-12 rounded-xl overflow-hidden border border-[#A6FF5C]/40 flex items-center justify-center shrink-0 bg-black shadow-[0_0_20px_rgba(91,232,23,0.45)]">
                        <img src={DISCORD_MARK} alt="" aria-hidden="true" loading="lazy" className="w-full h-full object-cover" />
                     </span>
                     <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-black text-white truncate">
                           {live.length
                              ? `${lang === 'en' ? 'Live rooms: ' : 'غرف مباشرة: '}${live.map((c) => `#${c.name}`).join('  ')}`
                              : lang === 'en'
                                 ? 'Voice rooms, giveaways and instant stream alerts'
                                 : 'غرف صوتية، هدايا وتنبيهات البث فوراً'}
                        </p>
                        <p className="text-[10px] font-bold text-[#7BEF3D] mt-0.5" dir="ltr">GUILD {DISCORD_GUILD_ID}</p>
                     </div>
                     <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-black tracking-[0.2em] px-2.5 py-1.5 rounded-lg bg-white text-black" dir="ltr">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l2.4 2.4 3.4-.5 1 3.3 3 1.6-1.4 3.2 1.4 3.2-3 1.6-1 3.3-3.4-.5L12 22l-2.4-2.4-3.4.5-1-3.3-3-1.6L3.6 12 2.2 8.8l3-1.6 1-3.3 3.4.5L12 2z" /></svg>
                        HQ
                     </span>
                  </div>
               </div>

               {/* stat grid */}
               <div className="px-5 mt-4 grid grid-cols-3 gap-2">
                  {[
                     { v: stats && stats.members > 0 ? compact(stats.members) : '—', l: lang === 'en' ? 'Members' : 'الأعضاء' },
                     { v: stats && stats.online > 0 ? compact(stats.online) : '—', l: lang === 'en' ? 'Online now' : 'متصل الآن' },
                     { v: failed ? '—' : '24/7', l: lang === 'en' ? 'Open' : 'مفتوح' },
                  ].map((s, i) => (
                     <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-2 py-3 text-center">
                        <span className="jersey block text-lg sm:text-xl text-white leading-none" dir="ltr">{s.v}</span>
                        <span className="kicker block mt-1 text-white/40">{s.l}</span>
                     </div>
                  ))}
               </div>

               {/* CTA */}
               <div className="px-5 pb-5 mt-4 flex-1 flex items-end">
                  <a
                     href={DISCORD_INVITE_URL}
                     target="_blank"
                     rel="noopener noreferrer"
                     aria-label={lang === 'en' ? 'Join the Discord server' : 'انضم لسيرفر الديسكورد'}
                     className="btn-arena card-sheen cut-btn relative w-full min-h-[54px] inline-flex items-center justify-center gap-2.5 bg-gradient-to-b from-[#5BE817] to-[#123A0A] text-black font-black text-sm tracking-wide shadow-[0_14px_36px_-10px_rgba(91,232,23,0.6)] overflow-hidden"
                  >
                     <DiscordIcon className="w-5 h-5 shrink-0" />
                     {lang === 'en' ? 'JOIN THE SERVER' : 'انضم للسيرفر'}
                     <svg className={`w-4 h-4 shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </a>
               </div>
            </div>
         </div>
      </div>
   );
};
