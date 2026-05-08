"use client";

import { useEffect, useState } from "react";
import {
  RegionalDashboard,
  BureauDashboard,
  ExecutiveDashboard,
  AdminDashboard,
} from "./components/RoleDashboards";

export default function DashboardsModule() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Read the stored role from login
    const storedRole = localStorage.getItem("userRole") || "Regional";
    setRole(storedRole);
  }, []);

  // Prevent hydration mismatch by returning empty or a loader initially
  if (!role) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  switch (role) {
    case "Admin":
      return <AdminDashboard />;
    case "Executive":
      return <ExecutiveDashboard />;
    case "Bureau":
      return <BureauDashboard />;
    case "Regional":
    default:
      return <RegionalDashboard />;
  }
}
