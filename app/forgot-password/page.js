"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { useT } from "../../components/Providers";
import { authClient } from "../../lib/auth-client";

export default function ForgotPassword() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setMsg("");
    if (email === "") return setError(t("forgot.errEmail"));
    setBusy(true);
    const res = await authClient.requestPasswordReset({
      email,
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (res.error) return setError(res.error.message || t("auth.errGeneric"));
    setMsg(t("forgot.sent"));
  }

  return (
    <div>
      <Header />
      <div className="max-w-md mx-auto px-4 mt-10">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-brand-dark mb-2">{t("forgot.title")}</h1>
          <p className="text-gray-600 mb-4">{t("forgot.desc")}</p>
          <input className="w-full border rounded-lg p-3 mb-3 bg-white" type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-3">{error}</div>}
          {msg && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-3">{msg}</div>}
          <button onClick={submit} disabled={busy} className="w-full bg-brand text-white py-3 rounded-lg font-semibold disabled:opacity-60">
            {busy ? t("auth.wait") : t("forgot.send")}
          </button>
          <Link href="/" className="block text-center mt-4 text-brand-dark hover:underline">{t("forgot.back")}</Link>
        </div>
      </div>
    </div>
  );
}
