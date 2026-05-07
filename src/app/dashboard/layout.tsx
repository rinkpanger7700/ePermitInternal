"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Search,
  CheckSquare,
  Send,
  BarChart2,
  Bell,
  LogOut,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Applications", href: "/dashboard/applications", icon: FileText },
  { name: "Reviews", href: "/dashboard/reviews", icon: ClipboardCheck },
  { name: "Inspections", href: "/dashboard/inspections", icon: Search },
  { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
  { name: "Releasing", href: "/dashboard/releasing", icon: Send },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart2 },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("DHSUD Employee");
  const [userRole, setUserRole] = useState("Evaluator");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "regional";
    const roleLabels: Record<string, string> = {
      regional: "Evaluator",
      bureau: "Bureau Director",
      executive: "Executive",
      admin: "System Admin",
    };
    setUserRole(roleLabels[role] || "Evaluator");

    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  function handleSignOut() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    router.push("/");
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* ─── Top Header Bar ─── */}
      <header className="bg-[#1e3a8a] text-white h-14 flex items-center justify-between px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
              <Image
                src="/dhsud.png"
                alt="DHSUD Seal"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span className="font-semibold text-sm">DHSUD eServices Portal</span>
          </div>
          <div className="h-6 w-px bg-blue-400/40 mx-2" />
          <span className="font-semibold text-sm">ePermits – Internal Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <div className="text-sm font-semibold leading-tight">{userName}</div>
            <div className="text-xs text-blue-200 leading-tight">{userRole}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center border border-blue-500">
            <User size={18} className="text-blue-200" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ─── */}
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <nav className="flex-1 py-4 px-3 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs text-gray-400 flex-shrink-0">
            <span>© 2026 Department of Human Settlements and Urban Development (DHSUD)</span>
            <span>ePermits – Internal Portal &bull; Version 1.0.0</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
