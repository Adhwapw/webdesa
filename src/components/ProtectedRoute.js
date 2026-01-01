"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication hanya di client-side
    const checkAuth = () => {
      try {
        const adminData = localStorage.getItem("admin");
        
        if (!adminData) {
          // Tidak ada data admin, redirect ke login
          router.push("/admin/login");
          setIsAuthenticated(false);
        } else {
          // Ada data admin
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/admin/login");
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Tampilkan loading saat checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Jika belum authenticated, jangan render apapun (akan redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Jika sudah authenticated, render children
  return <>{children}</>;
}