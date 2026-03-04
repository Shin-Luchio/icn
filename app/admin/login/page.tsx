"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "로그인에 실패했습니다.");
        return;
      }

      router.push("/admin/competitions");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="hero" style={{ maxWidth: 480, margin: "40px auto 0" }}>
        <span className="hero-kicker">ADMIN LOGIN</span>
        <h1>관리자 로그인</h1>
        <p className="muted">백오피스는 로그인 후 접근할 수 있습니다.</p>

        <form onSubmit={onSubmit} className="grid" style={{ marginTop: 16 }}>
          <label>
            아이디
            <input className="input" value={id} onChange={(e) => setId(e.target.value)} required />
          </label>
          <label>
            비밀번호
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p> : null}
          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </section>
    </main>
  );
}
