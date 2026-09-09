"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  claimGuestFiles: (guestId?: string) => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  const supabase = getSupabaseBrowserClient();

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Hàm chuyển giao tài liệu từ Guest sang tài khoản chính thức
  const claimGuestFiles = useCallback(async (guestIdInput?: string): Promise<number> => {
    try {
      const currentSession = (await supabase.auth.getSession()).data.session;
      if (!currentSession?.access_token) return 0;

      let guestId = guestIdInput;
      if (!guestId && typeof document !== "undefined") {
        const row = document.cookie
          .split("; ")
          .find((r) => r.startsWith("arcadedocs_owner_id="));
        if (row) guestId = row.split("=")[1];
      }

      if (!guestId) return 0;

      const res = await fetch("/api/auth/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({ guestOwnerId: guestId }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.claimedCount || 0;
      }
    } catch (err) {
      console.warn("[Auth] Failed to claim guest files:", err);
    }
    return 0;
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    // 1. Khởi tạo session ban đầu
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!mounted) return;
      setSession(initSession);
      setUser(initSession?.user ?? null);
      setLoading(false);
    });

    // 2. Lắng nghe thay đổi trạng thái xác thực
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && newSession?.user) {
        // Tự động gộp file của Khách sang tài khoản vừa đăng nhập
        await claimGuestFiles();

        // Cập nhật tên và avatar vào localStorage cho editor & canvas
        try {
          const u = newSession.user;
          const displayName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email?.split("@")[0] ||
            "Thành viên";
          const rawDocUser = localStorage.getItem("arcadedocs_doc_user");
          let docUser = rawDocUser ? JSON.parse(rawDocUser) : {};
          docUser.name = displayName;
          if (u.user_metadata?.avatar_url) {
            docUser.avatar = u.user_metadata.avatar_url;
          }
          docUser.id = u.id;
          localStorage.setItem("arcadedocs_doc_user", JSON.stringify(docUser));
        } catch {}
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, claimGuestFiles]);

  const signInWithGoogle = async () => {
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/pro` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signInWithGithub = async () => {
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/pro` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      closeAuthModal();
    }
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split("@")[0],
        },
      },
    });
    if (!error) {
      closeAuthModal();
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token: session?.access_token ?? null,
        loading,
        isGuest: !user,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        claimGuestFiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
