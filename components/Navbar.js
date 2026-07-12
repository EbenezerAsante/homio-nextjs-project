"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "../lib/supabase-client";
import { fetchUnreadCount } from "../lib/messaging-queries";
import { T } from "../lib/constants";
import { ChevronDown, LayoutDashboard, ListChecks, ShieldCheck, Crown, LogOut, Search, Newspaper, Users, Mail, Home, PlusCircle, User } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isAgent, setIsAgent] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [fullName, setFullName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const profileRef = useRef(null);
  const moreRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Property pages already have their own sticky Call/WhatsApp/Message/Book
  // bar — showing the generic bottom tab nav there too would be redundant
  // and eat too much screen space.
  const hideBottomNav = pathname?.startsWith("/property/");

  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  useEffect(() => {
    document.body.classList.toggle("homio-has-bottom-nav", !hideBottomNav);
    return () => document.body.classList.remove("homio-has-bottom-nav");
  }, [hideBottomNav]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const { data: agentRow } = await supabase
          .from("agents")
          .select("id")
          .eq("id", currentUser.id)
          .maybeSingle();
        setIsAgent(!!agentRow);
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("is_platform_admin, full_name")
          .eq("id", currentUser.id)
          .maybeSingle();
        setIsPlatformAdmin(!!profileRow?.is_platform_admin);
        setFullName(profileRow?.full_name || "");
        fetchUnreadCount(currentUser.id).then(setUnreadCount);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const { data: agentRow } = await supabase
          .from("agents")
          .select("id")
          .eq("id", currentUser.id)
          .maybeSingle();
        setIsAgent(!!agentRow);
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("is_platform_admin, full_name")
          .eq("id", currentUser.id)
          .maybeSingle();
        setIsPlatformAdmin(!!profileRow?.is_platform_admin);
        setFullName(profileRow?.full_name || "");
        fetchUnreadCount(currentUser.id).then(setUnreadCount);
      } else {
        setIsAgent(false);
        setIsPlatformAdmin(false);
        setFullName("");
        setUnreadCount(0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: "#fff",
        borderBottom: `1px solid ${scrolled ? T.border : "transparent"}`,
        boxShadow: scrolled ? T.shadow : "none",
        transition: "box-shadow .2s, border .2s",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: 60,
          gap: 24,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: T.navy,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M2 9L10 2L18 9V18H13V13H7V18H2V9Z" fill={T.gold} />
            </svg>
          </div>
          <span style={{ fontWeight: 900, fontSize: 21, color: T.navy, letterSpacing: -0.5 }}>
            Homio<span style={{ color: T.gold }}>.</span>
          </span>
        </Link>

        {/* Desktop nav — hidden on small screens */}
        <nav className="homio-desktop-nav" style={{ display: "flex", gap: 2, flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Link href="/" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, color: T.gray1, fontWeight: 600 }}>
            Home
          </Link>
          <Link href="/about" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, color: T.gray2, fontWeight: 500 }}>
            About
          </Link>
          <Link href="/how-it-works" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, color: T.gray2, fontWeight: 500 }}>
            How It Works
          </Link>
          <Link href="/for-contributors" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, color: T.gray2, fontWeight: 500 }}>
            For Contributors
          </Link>

          <div ref={moreRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 6, fontSize: 14, color: T.gray2, fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
            >
              More
              <ChevronDown size={14} style={{ transform: moreOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
            </button>
            {moreOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "#fff",
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  boxShadow: T.shadowHover,
                  minWidth: 190,
                  padding: 6,
                  zIndex: 50,
                }}
              >
                <DropdownLink href="/listings" icon={Search} label="Browse Listings" onClick={() => setMoreOpen(false)} />
                <DropdownLink href="/blog" icon={Newspaper} label="Blog" onClick={() => setMoreOpen(false)} />
                <DropdownLink href="/team" icon={Users} label="Team" onClick={() => setMoreOpen(false)} />
                <DropdownLink href="/contact" icon={Mail} label="Contact" onClick={() => setMoreOpen(false)} />
              </div>
            )}
          </div>
        </nav>

        <div className="homio-desktop-nav" style={{ display: "flex", gap: 10, flexShrink: 0, marginLeft: "auto", alignItems: "center" }}>
          {user ? (
            <>
              <div ref={profileRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    border: `1.5px solid ${T.border}`,
                    color: T.gray1,
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 13,
                    fontWeight: 700,
                    background: profileOpen ? T.bg : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {fullName ? fullName.split(" ")[0] : "Account"}
                  <ChevronDown size={14} style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                </button>

                {profileOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "#fff",
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      boxShadow: T.shadowHover,
                      minWidth: 200,
                      padding: 6,
                      zIndex: 50,
                    }}
                  >
                    <DropdownLink href="/dashboard" icon={LayoutDashboard} label="My Dashboard" onClick={() => setProfileOpen(false)} />
                    <DropdownLink href="/dashboard/roles" icon={ListChecks} label="My Roles" onClick={() => setProfileOpen(false)} />
                    {isAgent && <DropdownLink href="/admin" icon={ShieldCheck} label="Agent Admin" onClick={() => setProfileOpen(false)} highlight />}
                    {isPlatformAdmin && <DropdownLink href="/platform-admin" icon={Crown} label="Platform Admin" onClick={() => setProfileOpen(false)} highlight="gold" />}
                    <div style={{ height: 1, background: T.border, margin: "6px 4px" }} />
                    <button
                      onClick={() => { setProfileOpen(false); signOut(); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontWeight: 600, color: T.gray2, cursor: "pointer", textAlign: "left" }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  color: T.gray2,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  border: `1.5px solid ${T.border}`,
                }}
              >
                Sign in
              </Link>
              <Link
                href="/login"
                style={{
                  background: T.gold,
                  color: "#fff",
                  borderRadius: 999,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — visible only on small screens */}
        <button
          className="homio-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          style={{
            display: "none",
            marginLeft: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke={T.navy} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="homio-mobile-menu"
          style={{
            borderTop: `1px solid ${T.border}`,
            background: "#fff",
            padding: "12px 24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            Home
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            About
          </Link>
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            How It Works
          </Link>
          <Link href="/for-contributors" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            For Contributors
          </Link>
          <Link href="/listings" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            Browse Listings
          </Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            Blog
          </Link>
          <Link href="/team" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            Team
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            Contact
          </Link>
          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
                Dashboard
              </Link>
              <Link href="/dashboard/roles" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
                My Roles
              </Link>
              {isAgent && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.navy, fontWeight: 700 }}>
                  Agent Admin
                </Link>
              )}
              {isPlatformAdmin && (
                <Link href="/platform-admin" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gold, fontWeight: 700 }}>
                  Platform Admin
                </Link>
              )}
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                style={{ textAlign: "left", padding: "10px 4px", fontSize: 15, color: T.gray2, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
                Sign in
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  marginTop: 6,
                  background: T.gold,
                  color: "#fff",
                  borderRadius: 999,
                  padding: "12px",
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .homio-desktop-nav {
            display: none !important;
          }
          .homio-hamburger {
            display: none !important;
          }
        }
        .homio-bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .homio-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 500;
            background: #fff;
            border-top: 1px solid #E5E7EB;
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
            padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
          }
          body.homio-has-bottom-nav {
            padding-bottom: 62px;
          }
        }
        .homio-bottom-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          border: none;
          background: none;
          cursor: pointer;
          padding: 6px 2px;
          min-height: 48px;
          color: ${T.gray2};
          font-size: 10.5px;
          font-weight: 600;
        }
        .homio-bottom-tab.active {
          color: ${T.navy};
        }
        .homio-bottom-badge {
          position: absolute;
          top: 3px;
          right: calc(50% - 14px);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${T.gold};
          border: 1.5px solid #fff;
        }
      `}</style>
    </header>

    {/* Mobile bottom tab bar — Home / Search / Post / Messages / Account */}
    {!hideBottomNav && (
      <nav className="homio-bottom-nav">
        <Link href="/" className={`homio-bottom-tab${pathname === "/" ? " active" : ""}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link href="/listings" className={`homio-bottom-tab${pathname?.startsWith("/listings") ? " active" : ""}`}>
          <Search size={20} />
          <span>Search</span>
        </Link>
        <Link
          href={!user ? "/login" : isAgent ? "/admin" : "/dashboard/roles"}
          className={`homio-bottom-tab${pathname === "/admin" || pathname?.startsWith("/dashboard/roles") || pathname?.startsWith("/dashboard/apply") ? " active" : ""}`}
        >
          <PlusCircle size={20} />
          <span>Post</span>
        </Link>
        <Link
          href={!user ? "/login" : "/dashboard/messages"}
          className={`homio-bottom-tab${pathname?.startsWith("/dashboard/messages") ? " active" : ""}`}
          style={{ position: "relative" }}
        >
          <Mail size={20} />
          {unreadCount > 0 && <span className="homio-bottom-badge" />}
          <span>Messages</span>
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`homio-bottom-tab${menuOpen || pathname === "/dashboard" || pathname?.startsWith("/dashboard/appointments") || pathname?.startsWith("/dashboard/owner") || pathname?.startsWith("/platform-admin") || pathname?.startsWith("/saved") ? " active" : ""}`}
        >
          <User size={20} />
          <span>Account</span>
        </button>
      </nav>
    )}
    </>
  );
}

function DropdownLink({ href, icon: Icon, label, onClick, highlight }) {
  const color = highlight === "gold" ? T.gold : highlight ? T.navy : T.gray1;
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "9px 10px",
        borderRadius: 6,
        fontSize: 13.5,
        fontWeight: highlight ? 700 : 600,
        color,
      }}
    >
      <Icon size={15} /> {label}
    </Link>
  );
}