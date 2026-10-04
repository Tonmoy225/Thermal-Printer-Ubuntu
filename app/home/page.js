"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bluetooth, BluetoothConnected } from "lucide-react";
import Header from "../../components/Header";
import BottomTabs from "../../components/BottomTabs";
import DemoModal from "../../components/DemoModal";
import TextPanel from "../../components/TextPanel";
import PicturePanel from "../../components/PicturePanel";
import { FEATURES } from "../../lib/features";
import { authClient } from "../../lib/auth-client";
import { connectPrinter, checkBluetooth, isConnected, printText } from "../../lib/printer";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("MX10");
  const [status, setStatus] = useState("Not connected");
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
    const t = setInterval(() => checkBluetooth().then(setBt), 3000);
    return () => clearInterval(t);
  }, []);

  async function onConnect() {
    try {
      const n = await connectPrinter(name, () => setStatus("Disconnected"));
      localStorage.setItem("printerName", name);
      setStatus("Connected: " + n);
    } catch (e) {
      alert("Connect hoy nai: " + e.message);
    }
  }

  function openFeature(f) {
    if (f.kind !== "soon" && localStorage.getItem("skipDemo:" + f.id)) {
      startFeature(f);
    } else {
      setDemo(f);
    }
  }

  async function startFeature(f) {
    setDemo(null);
    if (f.kind === "test") {
      try {
        await printText("PrintHub\nTest print OK", { size: 36, align: "center" });
      } catch (e) {
        alert(e.message);
      }
      return;
    }
    setActive(f);
  }

  if (isPending || !session) {
    return <div className="p-10 text-center text-purple-800">Loading...</div>;
  }

  const connected = status.startsWith("Connected") && isConnected();

  return (
    <div className="pb-20 md:pb-10">
      <Header />

      <div className="max-w-6xl mx-auto px-4 mt-5">
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className={"p-3 rounded-xl " + (connected ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700")}>
              {connected ? <BluetoothConnected size={22} /> : <Bluetooth size={22} />}
            </span>
            <div>
              <div className="font-semibold">{status}</div>
              <div className="text-sm">
                {bt === "on" && <span className="text-green-600">Bluetooth: ON</span>}
                {bt === "off" && <span className="text-red-600">Bluetooth: OFF. Bluetooth on koro.</span>}
                {bt === "unsupported" && <span className="text-red-600">Ai browser e Bluetooth support nai. Chrome use koro.</span>}
                {bt === "checking" && <span className="text-gray-500">Checking...</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input className="border rounded-lg p-2 flex-1 md:w-40" value={name} onChange={(e) => setName(e.target.value)} placeholder="Printer name" />
            <button onClick={onConnect} className="bg-linear-to-r from-violet-700 to-fuchsia-600 text-white px-5 rounded-lg font-semibold">
              Connect
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-purple-900 mt-6 mb-3">Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const big = i === 0;
            return (
              <button
                key={f.id}
                onClick={() => openFeature(f)}
                className={
                  big
                    ? "col-span-2 sm:col-span-3 lg:col-span-4 bg-linear-to-r from-violet-700 via-purple-600 to-fuchsia-600 text-white rounded-2xl p-6 md:p-8 shadow-lg flex items-center justify-center gap-4 text-2xl font-bold"
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
                    <span className="bg-linear-to-br from-violet-600 to-fuchsia-500 text-white p-3 rounded-xl"><Icon size={26} /></span>
                    <span className="font-medium text-purple-950">{f.title}</span>
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
