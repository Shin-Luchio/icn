"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Route } from "next";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!ready) return null;

  if (user) {
    return (
      <button
        className="nav-link"
        style={{ background: "none", border: "1px solid var(--line)", cursor: "pointer" }}
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/" as Route);
          router.refresh();
        }}
      >
        로그아웃
      </button>
    );
  }

  return (
    <Link href={"/auth/login" as Route} className="nav-link" style={{ color: "var(--text)" }}>
      로그인
    </Link>
  );
}