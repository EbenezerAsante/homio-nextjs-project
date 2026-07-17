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
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // On mobile, a fixed bottom nav bar can visually collide with the
  // on-screen keyboard (a well-known mobile browser quirk — the bar can
  // end up floating mid-screen instead of staying pinned to the bottom).
  // Hiding it while any text field is actively focused avoids that
  // entirely, since there's no useful room for it during typing anyway.
  useEffect(() => {
    const isTextField = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
    const handleFocusIn = (e) => {
      if (isTextField(e.target)) setKeyboardOpen(true);
    };
    const handleFocusOut = (e) => {
      if (isTextField(e.target)) setKeyboardOpen(false);
    };
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const moreRef = useRef(null);
  const accountRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Property pages already have their own sticky Call/WhatsApp/Message/Book
  // bar — showing the generic bottom tab nav there too would be redundant
  // and eat too much screen space.
  const hideBottomNav = pathname?.startsWith("/property/") || keyboardOpen;

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
    if (!accountMenuOpen) return;
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      const clickedMenu = menuRef.current && menuRef.current.contains(e.target);
      const clickedHamburger = hamburgerRef.current && hamburgerRef.current.contains(e.target);
      if (!clickedMenu && !clickedHamburger) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close any open mobile menu when navigating to a new page.
  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

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

        {/* Hamburger — opens the site pages menu, mobile only */}
        <button
          ref={hamburgerRef}
          className="homio-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            flexShrink: 0,
            alignItems: "center",
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
          ref={menuRef}
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
          {!user && (
            <>
              <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
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
        .homio-hamburger {
          display: none;
        }
        @media (max-width: 768px) {
          .homio-desktop-nav {
            display: none !important;
          }
          .homio-hamburger {
            display: flex !important;
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
        {user ? (
          <button
            onClick={() => setAccountMenuOpen((v) => !v)}
            className={`homio-bottom-tab${accountMenuOpen || pathname === "/dashboard" || pathname?.startsWith("/dashboard/appointments") || pathname?.startsWith("/dashboard/owner") || pathname?.startsWith("/platform-admin") || pathname?.startsWith("/saved") ? " active" : ""}`}
          >
            <User size={20} />
            <span>Account</span>
          </button>
        ) : (
          <Link href="/login" className="homio-bottom-tab">
            <User size={20} />
            <span>Account</span>
          </Link>
        )}
      </nav>
    )}

    {/* Account panel — opened from the bottom-nav Account tab.
        Deliberately shows only the signed-in user's own info and role
        controls, not site pages — those live behind the hamburger menu
        in the header instead, so the two stay separated. */}
    {accountMenuOpen && user && (
      <div
        ref={accountRef}
        style={{
          position: "fixed",
          bottom: hideBottomNav ? 0 : 62,
          left: 0,
          right: 0,
          zIndex: 499,
          background: "#fff",
          borderTop: `1px solid ${T.border}`,
          boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
          padding: "16px 20px calc(16px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: T.navy,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {(fullName || user.email || "?").charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fullName || "My Account"}
            </div>
            <div style={{ fontSize: 12.5, color: T.gray2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Link href="/dashboard" onClick={() => setAccountMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            <LayoutDashboard size={17} /> My Dashboard
          </Link>
          <Link href="/dashboard/roles" onClick={() => setAccountMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            <ListChecks size={17} /> My Roles
          </Link>
          {isAgent && (
            <Link href="/admin" onClick={() => setAccountMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 4px", fontSize: 15, color: T.navy, fontWeight: 700 }}>
              <ShieldCheck size={17} /> Agent Admin
            </Link>
          )}
          {isPlatformAdmin && (
            <Link href="/platform-admin" onClick={() => setAccountMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 4px", fontSize: 15, color: T.gold, fontWeight: 700 }}>
              <Crown size={17} /> Platform Admin
            </Link>
          )}
          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
          <button
            onClick={() => { setAccountMenuOpen(false); signOut(); }}
            style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "10px 4px", fontSize: 15, color: T.gray2, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </div>
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