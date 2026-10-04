"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bluetooth, BluetoothConnected } from "lucide-react";
import Header from "../../components/Header";
import BottomTabs from "../../components/BottomTabs";
import DemoModal from "../../components/DemoModal";
import TextPanel from "../../components/TextPanel";
import PicturePanel from "../../components/PicturePanel";
import { useT, useErr, useSettings } from "../../components/Providers";
import { buildTools } from "../../lib/features";
import { authClient } from "../../lib/auth-client";
import { connectPrinter, checkBluetooth, isConnected, printText } from "../../lib/printer";

export default function Home() {
  const router = useRouter();
  const t = useT();
  const errText = useErr();
  const { settings } = useSettings();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("MX10");
  const [status, setStatus] = useState("notConnected");
  const [connName, setConnName] = useState("");
  const [bt, setBt] = useState("checking");
  const [demo, setDemo] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/");
  }, [isPending, session, router]);

  useEffect(() => {
    const saved = localStorage.getItem("printerName");
    if (saved) setName(saved);
    checkBluetooth().then(setBt);
    const timer = setInterval(() => checkBluetooth().then(setBt), 3000);
    return () => clearInterval(timer);
  }, []);

  async function onConnect() {
    try {
      const n = await connectPrinter(name, () => setStatus("disconnected"));
      localStorage.setItem("printerName", name);
      setConnName(n);
      setStatus("connected");
    } catch (e) {
      alert(t("home.connectFail", { msg: errText(e) }));
    }
  }

  function openFeature(f) {
    if (f.kind !== "soon" && localStorage.getItem("skipDemo:" + f.id)) startFeature(f);
    else setDemo(f);
  }

  async function startFeature(f) {
    setDemo(null);
    if (f.kind === "test") {
      try {
        await printText("PrintHub\nTest print OK", { size: 36, align: "center" });
      } catch (e) {
        alert(errText(e));
      }
      return;
    }
    setActive(f);
  }

  if (isPending || !session) {
    return <div className="p-10 text-center text-brand-dark">{t("nav.loading")}</div>;
  }

  const tools = buildTools(settings, t);
  const connected = status === "connected" && isConnected();
  const statusText =
    status === "connected" ? t("home.connected", { name: connName }) :
    status === "disconnected" ? t("home.disconnected") : t("home.notConnected");

  return (
    <div className="pb-20 md:pb-10">
      <Header />

      <div className="max-w-6xl mx-auto px-4 mt-5">
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className={"p-3 rounded-xl " + (connected ? "bg-green-100 text-green-700" : "bg-brand-soft text-brand-dark")}>
              {connected ? <BluetoothConnected size={22} /> : <Bluetooth size={22} />}
            </span>
            <div>
              <div className="font-semibold">{statusText}</div>
              <div className="text-sm">
                {bt === "on" && <span className="text-green-600">{t("home.btOn")}</span>}
                {bt === "off" && <span className="text-red-600">{t("home.btOff")}</span>}
                {bt === "unsupported" && <span className="text-red-600">{t("home.btUnsupported")}</span>}
                {bt === "checking" && <span className="text-gray-500">{t("home.btChecking")}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input className="border rounded-lg p-2 flex-1 md:w-40" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("home.printerName")} />
            <button onClick={onConnect} className="bg-brand text-white px-5 rounded-lg font-semibold">
              {t("home.connect")}
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-brand-dark mt-6 mb-3">{t("home.tools")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((f) => {
            const Icon = f.icon;
            const big = f.id === "picture";
            return (
              <button
                key={f.id}
                onClick={() => openFeature(f)}
                className={
                  big
                    ? "col-span-2 sm:col-span-3 lg:col-span-4 bg-brand text-white rounded-2xl p-6 md:p-8 shadow-lg flex items-center justify-center gap-4 text-2xl font-bold"
                    : "bg-white rounded-2xl p-5 shadow-md flex flex-col items-center gap-3 hover:shadow-lg"
                }
              >
                {big ? (
                  <>
                    <span className="bg-white/20 p-4 rounded-2xl"><Icon size={34} /></span>
                    {f.title}
                  </>
                ) : (
                  <>
                    <span className="bg-brand text-white p-3 rounded-xl"><Icon size={26} /></span>
                    <span className="font-medium text-brand-dark">{f.title}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {demo && <DemoModal feature={demo} onClose={() => setDemo(null)} onContinue={() => startFeature(demo)} />}
      {active && active.kind === "text" && <TextPanel feature={active} onClose={() => setActive(null)} />}
      {active && active.kind === "picture" && <PicturePanel feature={active} onClose={() => setActive(null)} />}

      <BottomTabs />
    </div>
  );
}
