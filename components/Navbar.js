"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";
import { Heart } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isAgent, setIsAgent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
      } else {
        setIsAgent(false);
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
        <nav className="homio-desktop-nav" style={{ display: "flex", gap: 2, flex: 1 }}>
          <Link
            href="/listings"
            style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, color: T.gray2, fontWeight: 500 }}
          >
            For Sale / Rent
          </Link>
        </nav>

        <div className="homio-desktop-nav" style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
          {user ? (
            <>
              <Link
                href="/saved"
                style={{
                  border: `1.5px solid ${T.border}`,
                  color: T.gray1,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Heart size={13} strokeWidth={2.4} /> Saved
              </Link>
              <Link
                href="/dashboard"
                style={{
                  border: `1.5px solid ${T.border}`,
                  color: T.gray1,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Dashboard
              </Link>
              {isAgent && (
                <Link
                  href="/admin"
                  style={{
                    border: `1.5px solid ${T.navy}`,
                    color: T.navy,
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Agent Admin
                </Link>
              )}
              <button
                onClick={signOut}
                style={{
                  background: T.gray4,
                  color: T.gray1,
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
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
                }}
              >
                Sign In
              </Link>
              <Link
                href="/login"
                style={{
                  background: T.navy,
                  color: "#fff",
                  borderRadius: 8,
                  padding: "6px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Register
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
          <Link href="/listings" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
            For Sale / Rent
          </Link>
          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          {user ? (
            <>
              <Link href="/saved" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Heart size={15} strokeWidth={2.4} /> Saved Properties
              </Link>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.gray1, fontWeight: 600 }}>
                Dashboard
              </Link>
              {isAgent && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ padding: "10px 4px", fontSize: 15, color: T.navy, fontWeight: 700 }}>
                  Agent Admin
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
                Sign In
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  marginTop: 6,
                  background: T.navy,
                  color: "#fff",
                  borderRadius: 8,
                  padding: "12px",
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Register
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
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}