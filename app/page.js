"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, BookOpen } from "lucide-react";
import Header from "../components/Header";
import { authClient } from "../lib/auth-client";

export default function Login() {
  const router = useRouter();
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
    if (email === "" || pass === "") {
      setError("Email ar password dao");
      return;
    }
    if (mode === "signup") {
      if (name === "") return setError("Tomar naam dao");
      if (pass.length < 8) return setError("Password kom pokkhe 8 akkhor hote hobe");
      if (pass !== pass2) return setError("Duto password mile nai");
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
      setError(res.error.message || "Server error (" + res.error.status + "). /api/health check koro");
      return;
    }
    router.push("/home");
  }

  const input = "w-full border rounded-lg p-3 mb-3 bg-white";

  return (
    <div>
      <Header />
      <div className="bg-linear-to-br from-violet-700 via-purple-600 to-fuchsia-500 px-4 py-10 md:py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center text-white mb-6">
            <div className="inline-flex bg-white/20 p-4 rounded-2xl mb-3"><Printer size={34} /></div>
            <h1 className="text-3xl font-bold">PrintHub</h1>
            <p className="text-white/80 mt-1">Bluetooth thermal printer, apnar hatey</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex bg-purple-50 rounded-lg p-1 mb-5">
              <button onClick={() => { setMode("login"); setError(""); }} className={"flex-1 py-2 rounded-md font-semibold " + (mode === "login" ? "bg-linear-to-r from-violet-700 to-fuchsia-600 text-white" : "text-purple-800")}>
                Login
              </button>
              <button onClick={() => { setMode("signup"); setError(""); }} className={"flex-1 py-2 rounded-md font-semibold " + (mode === "signup" ? "bg-linear-to-r from-violet-700 to-fuchsia-600 text-white" : "text-purple-800")}>
                Sign up
              </button>
            </div>

            {mode === "signup" && (
              <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={input} type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
            {mode === "signup" && (
              <input className={input} type="password" placeholder="Confirm password" value={pass2} onChange={(e) => setPass2(e.target.value)} />
            )}

            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-3">{error}</div>}

            <button onClick={submit} disabled={busy} className="w-full bg-linear-to-r from-violet-700 to-fuchsia-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60">
              {busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>

            <Link href="/guide" className="mt-3 flex items-center justify-center gap-2 border border-purple-300 text-purple-800 py-3 rounded-lg font-semibold">
              <BookOpen size={18} /> Setup Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
