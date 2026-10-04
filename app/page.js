"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, BookOpen } from "lucide-react";
import Header from "../components/Header";
import PasswordInput from "../components/PasswordInput";
import { useT } from "../components/Providers";
import { authClient } from "../lib/auth-client";

export default function Login() {
  const router = useRouter();
  const t = useT();
  const { data: session } = authClient.useSession();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.push("/home");
  }, [session, router]);

  async function submit() {
    setError("");
    if (email === "" || pass === "") return setError(t("auth.errFields"));
    if (mode === "signup") {
      if (name === "") return setError(t("auth.errName"));
      if (pass.length < 8) return setError(t("auth.errLen"));
      if (pass !== pass2) return setError(t("auth.errMatch"));
    }
    setBusy(true);
    let res;
    if (mode === "signup") {
      res = await authClient.signUp.email({ name, email, password: pass });
    } else {
      res = await authClient.signIn.email({ email, password: pass });
    }
    setBusy(false);
    if (res.error) {
      setError(res.error.message || t("auth.errGeneric") + " (" + res.error.status + ")");
      return;
    }
    router.push("/home");
  }

  const input = "w-full border rounded-lg p-3 mb-3 bg-white";
  const tab = (m) => "flex-1 py-2 rounded-md font-semibold " + (mode === m ? "bg-brand text-white" : "text-brand-dark");

  return (
    <div>
      <Header />
      <div className="bg-brand px-4 py-10 md:py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center text-white mb-6">
            <div className="inline-flex bg-white/20 p-4 rounded-2xl mb-3"><Printer size={34} /></div>
            <h1 className="text-3xl font-bold">PrintHub</h1>
            <p className="text-white/80 mt-1">{t("auth.tagline")}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex bg-brand-soft rounded-lg p-1 mb-5">
              <button onClick={() => { setMode("login"); setError(""); }} className={tab("login")}>{t("auth.login")}</button>
              <button onClick={() => { setMode("signup"); setError(""); }} className={tab("signup")}>{t("auth.signup")}</button>
            </div>

            {mode === "signup" && (
              <input className={input} placeholder={t("auth.fullName")} value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input className={input} type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
            <PasswordInput placeholder={t("auth.password")} value={pass} onChange={(e) => setPass(e.target.value)} />
            {mode === "signup" && (
              <PasswordInput placeholder={t("auth.confirm")} value={pass2} onChange={(e) => setPass2(e.target.value)} />
            )}

            {mode === "login" && (
              <div className="text-right -mt-1 mb-3">
                <Link href="/forgot-password" className="text-sm text-brand-dark hover:underline">{t("auth.forgot")}</Link>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-3">{error}</div>}

            <button onClick={submit} disabled={busy} className="w-full bg-brand text-white py-3 rounded-lg font-semibold disabled:opacity-60">
              {busy ? t("auth.wait") : mode === "login" ? t("auth.login") : t("auth.create")}
            </button>

            <Link href="/guide" className="mt-3 flex items-center justify-center gap-2 border border-brand-line text-brand-dark py-3 rounded-lg font-semibold">
              <BookOpen size={18} /> {t("auth.guide")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
