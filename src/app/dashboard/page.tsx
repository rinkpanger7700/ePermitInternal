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
    const storedRole = localStorage.getItem("userRole") || "regional";
    setRole(storedRole);
  }, []);

  // Prevent hydration mismatch by returning empty or a loader initially
  if (!role) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "executive":
      return <ExecutiveDashboard />;
    case "bureau":
      return <BureauDashboard />;
    case "regional":
    default:
      return <RegionalDashboard />;
  }
}
