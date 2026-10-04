import Link from "next/link";
import Header from "../../components/Header";
import BottomTabs from "../../components/BottomTabs";

const steps = [
  "Printer (MX10) on koro ar phone/laptop er Bluetooth on koro.",
  "Printer onno kothao connected thakle (phone app, bluetoothctl) disconnect koro. BLE printer e ekbar e ekta connection hoy.",
  "Chrome browser use koro (Android ba PC). iPhone e hobe na.",
  "Ubuntu/Linux e navigator.bluetooth na thakle chrome://flags/#enable-experimental-web-platform-features Enabled kore Chrome restart koro.",
  "Login ba Sign up kore Home page e jao.",
  "Printer name box e MX10 likho, Connect press koro, list theke printer select koro.",
  "Test Print diye check koro. Tarpor Picture Print, Text ba onno tool use koro.",
];

export default function Guide() {
  return (
    <div className="pb-20 md:pb-10">
      <Header />
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <h1 className="text-2xl font-bold text-purple-900 mb-4">Setup Guide</h1>
        <div className="bg-white rounded-2xl shadow-md p-5">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3 mb-4">
              <span className="bg-linear-to-br from-violet-600 to-fuchsia-500 text-white font-bold w-8 h-8 shrink-0 rounded-full flex items-center justify-center">
                {i + 1}
              </span>
              <p className="pt-1">{s}</p>
            </div>
          ))}
          <p className="text-sm text-gray-600 mb-4">
            Ubuntu setup: github.com/Tonmoy225/Thermal-Printer-Ubuntu
          </p>
          <Link href="/" className="block text-center bg-linear-to-r from-violet-700 to-fuchsia-600 text-white py-3 rounded-lg font-semibold">
            Login e jao
          </Link>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}
