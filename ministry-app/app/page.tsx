"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Home",             href: "/"         },
  { label: "About",            href: "#"         },
  { label: "Departments",      href: "#"         },
  { label: "Services",         href: "#"         },
  { label: "Contact",          href: "#"         },
  { label: "Meeting Requests", href: "/meetings" },
  { label: "Toner Requests",   href: "/toners"   },
];

const STATS = [
  { label: "Active Projects", value: "128",   icon: "📁", trend: "+12%" },
  { label: "Staff Members",   value: "2,340", icon: "👥", trend: "+3%"  },
  { label: "Citizens Served", value: "1.4M",  icon: "🏛️", trend: "+8%"  },
  { label: "Budgets Managed", value: "₦84B",  icon: "💰", trend: "+5%"  },
];

const ANNOUNCEMENTS = [
  {
    id: 1,
    tag: "POLICY",
    date: "Feb 17, 2026",
    title: "New Public Infrastructure Bill Approved",
    summary:
      "The Ministry has approved the 2026 Public Infrastructure Development Bill, allocating funds to 14 state districts.",
    urgent: true,
  },
  {
    id: 2,
    tag: "PROCUREMENT",
    date: "Feb 15, 2026",
    title: "Open Tender: Rural Road Expansion Phase III",
    summary:
      "Registered contractors are invited to submit bids for the Rural Road Expansion project before March 10, 2026.",
    urgent: false,
  },
  {
    id: 3,
    tag: "NOTICE",
    date: "Feb 12, 2026",
    title: "Staff Mandatory Compliance Training – Q1",
    summary:
      "All ministry personnel are required to complete the Q1 compliance training module by February 28, 2026.",
    urgent: false,
  },
];

const EVENTS = [
  {
    id: 1,
    day: "20",
    month: "FEB",
    title: "Quarterly Budget Review Meeting",
    time: "10:00 AM",
    location: "Main Conference Hall, Abuja",
    type: "Internal",
  },
  {
    id: 2,
    day: "25",
    month: "FEB",
    title: "National Development Summit 2026",
    time: "09:00 AM",
    location: "International Conference Centre",
    type: "Public",
  },
  {
    id: 3,
    day: "03",
    month: "MAR",
    title: "State Governors Policy Dialogue",
    time: "02:00 PM",
    location: "Ministry Boardroom",
    type: "Restricted",
  },
  {
    id: 4,
    day: "11",
    month: "MAR",
    title: "Annual Staff Performance Review",
    time: "08:30 AM",
    location: "HR Department, Block C",
    type: "Internal",
  },
];

const typeBadge: Record<string, string> = {
  Internal:   "bg-green-100 text-green-800",
  Public:     "bg-blue-100 text-blue-800",
  Restricted: "bg-red-100 text-red-700",
};

export default function MinistryHomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime]         = useState(new Date());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
        .hero-bg {
          background: linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 70%, #1a6b3a 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%);
        }
        .hero-bg::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 120px;
          background: linear-gradient(to top, #f8f5f0, transparent);
        }
        .grid-texture {
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .stat-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(20,83,45,0.15); }
        .announcement-card { transition: border-color 0.2s ease, transform 0.2s ease; }
        .announcement-card:hover { border-color: #16a34a; transform: translateX(4px); }
        .event-card { transition: background 0.2s ease, transform 0.2s ease; }
        .event-card:hover { background: #f0fdf4; transform: translateY(-2px); }
        .nav-link { position: relative; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 2px;
          background: #16a34a;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }
        .fade-in { animation: fadeIn 0.8s ease both; }
        .fade-in-up { animation: fadeInUp 0.7s ease both; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .seal-ring { animation: rotateSeal 40s linear infinite; }
        @keyframes rotateSeal { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker-move { display: inline-block; animation: ticker 30s linear infinite; }
        @keyframes ticker { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="bg-green-900 text-green-100 text-xs py-1 px-4 flex justify-between items-center">
        <span className="font-medium tracking-wide">FEDERAL REPUBLIC — MINISTRY OF AGRICULTURE</span>
        <span className="tabular-nums opacity-80">{formatTime(time)} · {formatDate(time)}</span>
      </div>

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"}`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border-2 border-green-700 flex items-center justify-center bg-green-50 flex-shrink-0">
              <span className="text-green-800 text-lg">🏛️</span>
            </div>
            <div>
              <div className="font-display text-green-900 text-base leading-tight font-bold">Ministry of</div>
              <div className="font-display text-green-700 text-base leading-tight">Agriculture</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="nav-link text-sm font-medium text-gray-700 hover:text-green-800 pb-0.5 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="text-sm font-semibold text-green-800 hover:text-green-600 transition-colors">
              Sign In
            </button>
            <button className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm">
              Staff Portal →
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-green-800 text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="block text-sm font-medium text-gray-700 hover:text-green-800">
                {l.label}
              </a>
            ))}
            <div className="pt-2 flex gap-3">
              <button className="text-sm font-semibold text-green-800">Sign In</button>
              <button className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                Staff Portal →
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── NEWS TICKER ── */}
      <div className="bg-green-700 text-white text-xs py-1.5 flex items-center gap-4 overflow-hidden">
        <span className="flex-shrink-0 bg-white text-green-800 font-bold text-xs px-3 py-0.5 ml-4 rounded uppercase tracking-wider">Live</span>
        <div className="ticker-wrap flex-1">
          <span className="ticker-move">
            📢 New Infrastructure Bill Approved by Parliament &nbsp;·&nbsp; 📋 Q1 Staff Compliance Training Deadline: Feb 28 &nbsp;·&nbsp; 🖨️ Toner Request submissions now open for Q1 &nbsp;·&nbsp; 📅 National Development Summit: Feb 25 @ International Conference Centre &nbsp;·&nbsp; 💼 Annual Staff Performance Review begins March 11
          </span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero-bg grid-texture py-24 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-white fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-green-100 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
              Official Government Platform
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight text-white mb-6">
              Serving the Nation,
              <br />
              <span className="text-green-300">Building the Future.</span>
            </h1>
            <p className="text-green-100 text-lg leading-relaxed max-w-xl mb-8 font-light">
              The Ministry of Agriculture coordinates federal policy,
              infrastructure projects, and public services — transparently and efficiently.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/meetings" className="bg-white text-green-800 font-bold px-7 py-3 rounded-xl shadow-lg hover:bg-green-50 transition-colors text-sm">
                📅 Meeting Requests
              </a>
              <a href="/toners" className="border border-white/40 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm backdrop-blur-sm">
                🖨️ Toner Requests →
              </a>
            </div>
          </div>

          {/* Emblem */}
          <div className="flex-shrink-0 fade-in delay-2 hidden md:flex flex-col items-center">
            <div className="relative w-52 h-52">
              <div className="seal-ring absolute inset-0 rounded-full border-2 border-dashed border-green-300/40"></div>
              <div className="absolute inset-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <span className="text-6xl">🏛️</span>
                <p className="text-green-200 text-xs font-semibold tracking-widest uppercase text-center leading-tight">
                  Federal Ministry<br />of Agriculture
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`stat-card bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-2 fade-in-up delay-${i + 1}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{s.trend}</span>
              </div>
              <div className="font-display text-3xl font-bold text-green-900">{s.value}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHORTCUT BANNERS ── */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/meetings"
            className="group bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 flex items-center gap-5 hover:from-green-800 hover:to-green-700 transition-all shadow-md"
          >
            <span className="text-5xl">📅</span>
            <div className="text-white">
              <p className="font-display text-xl font-bold">Meeting Requests</p>
              <p className="text-green-200 text-sm mt-0.5">Submit or manage ministry meeting requests</p>
            </div>
            <span className="ml-auto text-white text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a
            href="/toners"
            className="group bg-gradient-to-r from-green-900 to-green-800 rounded-2xl p-6 flex items-center gap-5 hover:from-green-950 hover:to-green-900 transition-all shadow-md"
          >
            <span className="text-5xl">🖨️</span>
            <div className="text-white">
              <p className="font-display text-xl font-bold">Toner Requests</p>
              <p className="text-green-200 text-sm mt-0.5">Request printer toner replacements by division</p>
            </div>
            <span className="ml-auto text-white text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </section>

      {/* ── ANNOUNCEMENTS + EVENTS ── */}
      <section className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-5 gap-10">

        {/* Announcements */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-green-900">Announcements</h2>
              <p className="text-sm text-gray-500 mt-0.5">Official notices & press releases</p>
            </div>
            <a href="#" className="text-sm font-semibold text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 px-4 py-1.5 rounded-lg transition-colors">
              View All
            </a>
          </div>
          <div className="space-y-4">
            {ANNOUNCEMENTS.map((a) => (
              <div key={a.id} className="announcement-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${a.urgent ? "bg-red-100 text-red-700" : "bg-green-100 text-green-800"}`}>
                    {a.urgent ? "🔴 " : ""}{a.tag}
                  </span>
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2">{a.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a.summary}</p>
                <a href="#" className="inline-block mt-3 text-sm font-semibold text-green-700 hover:text-green-900">
                  Read more →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-green-900">Upcoming Events</h2>
              <p className="text-sm text-gray-500 mt-0.5">Scheduled activities & meetings</p>
            </div>
            <a href="#" className="text-sm font-semibold text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 px-4 py-1.5 rounded-lg transition-colors">
              Calendar
            </a>
          </div>
          <div className="space-y-3">
            {EVENTS.map((e) => (
              <div key={e.id} className="event-card bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 cursor-pointer">
                <div className="flex-shrink-0 w-14 h-14 bg-green-700 rounded-xl flex flex-col items-center justify-center text-white">
                  <span className="text-xl font-bold leading-none">{e.day}</span>
                  <span className="text-xs font-semibold tracking-widest opacity-80">{e.month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm leading-snug">{e.title}</h4>
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${typeBadge[e.type]}`}>
                      {e.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">🕐 {e.time}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">📍 {e.location}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Staff CTA */}
          <div className="mt-5 bg-green-800 rounded-2xl p-5 text-white">
            <p className="font-display text-lg font-bold mb-1">Staff Portal Access</p>
            <p className="text-green-200 text-sm mb-4">
              Sign in to access internal dashboards, reports, and ministry tools.
            </p>
            <button className="w-full bg-white text-green-800 font-bold text-sm py-2.5 rounded-xl hover:bg-green-50 transition-colors">
              Login to Portal →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-green-900 text-green-100 py-10 px-6 mt-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="font-display font-bold text-white text-sm">Ministry of Agriculture</p>
              <p className="text-xs text-green-300 mt-0.5">Federal Republic — Official Government Platform</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-green-300">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
          <p className="text-xs text-green-400">© 2026 Federal Government. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
