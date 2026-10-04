"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import PasswordInput from "../../components/PasswordInput";
import { useT } from "../../components/Providers";
import { authClient } from "../../lib/auth-client";

export default function ResetPassword() {
  const router = useRouter();
  const t = useT();
  const [token, setToken] = useState("");
  const [bad, setBad] = useState(false);
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const tk = p.get("token");
    if (!tk || p.get("error")) setBad(true);
    else setToken(tk);
  }, []);

  async function submit() {
    setError("");
    if (pass.length < 8) return setError(t("auth.errLen"));
    if (pass !== pass2) return setError(t("auth.errMatch"));
    setBusy(true);
    const res = await authClient.resetPassword({ newPassword: pass, token });
    setBusy(false);
    if (res.error) return setError(t("reset.invalid"));
    setDone(true);
    setTimeout(() => router.push("/"), 2500);
  }

  return (
    <div>
      <Header />
      <div className="max-w-md mx-auto px-4 mt-10">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-brand-dark mb-4">{t("reset.title")}</h1>
          {bad ? (
            <>
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{t("reset.invalid")}</div>
              <Link href="/forgot-password" className="block text-center bg-brand text-white py-3 rounded-lg font-semibold">{t("forgot.send")}</Link>
            </>
          ) : done ? (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">{t("reset.done")}</div>
          ) : (
            <>
              <PasswordInput placeholder={t("reset.new")} value={pass} onChange={(e) => setPass(e.target.value)} />
              <PasswordInput placeholder={t("reset.confirm")} value={pass2} onChange={(e) => setPass2(e.target.value)} />
              {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-3">{error}</div>}
              <button onClick={submit} disabled={busy} className="w-full bg-brand text-white py-3 rounded-lg font-semibold disabled:opacity-60">
                {busy ? t("auth.wait") : t("reset.button")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
