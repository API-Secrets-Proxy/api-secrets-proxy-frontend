import { SignedIn, SignedOut, RedirectToSignIn, useAuth, useUser } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthRouter() {
  const { getToken } = useAuth();

  const createUser = async () => {
    try {
      const token = await getToken({ template: "default" });

      await fetch(`${API_URL}/me`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include" // optional if using cookies
      });
    } catch (err) {
    }
  };

  const { isLoaded, isSignedIn } = useUser();
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
      createUser();
  }, [isLoaded, isSignedIn]);

  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:projectId" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SignedIn>
    </div>
  );
}