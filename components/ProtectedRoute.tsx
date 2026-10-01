"use client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const normalizeDepartmentSlug = (value?: string | null) => {
  if (!value) return null;
  return value === "volunteer" ? "volunteering" : value;
};

export default function ProtectedRoute({ department, children }: { department: string; children: React.ReactNode }) {
  const { department: loggedIn, loading } = useAuth();
  const router = useRouter();
  const normalizedDepartment = normalizeDepartmentSlug(department);
  const normalizedLoggedIn = normalizeDepartmentSlug(loggedIn);
  const allowed = normalizedLoggedIn === normalizedDepartment || normalizedLoggedIn === "council";

  useEffect(() => {
    if (!loading && !allowed) router.replace("/restricted");
  }, [allowed, loading, router]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-14 text-sm text-blue-700 dark:text-blue-300">Checking access...</div>;
  if (!allowed) return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <div className="card p-6 text-center">
        <p className="font-black uppercase text-sm text-blue-900 dark:text-blue-100">Access denied</p>
        <p className="mt-2 text-sm text-blue-700/80 dark:text-blue-300/80">This account does not have access to this department dashboard.</p>
      </div>
    </div>
  );

  return <>{children}</>;
}