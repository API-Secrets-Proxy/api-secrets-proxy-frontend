import { SignedIn, SignedOut, RedirectToSignIn, useAuth, useUser } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import Sidebar, { type SidebarRef } from "./components/Sidebar";
import { ProjectsProvider } from "./contexts/ProjectsContext";

const API_URL = import.meta.env.VITE_API_URL;

function AppWithSidebar() {
  const sidebarRef = useRef<SidebarRef>(null);

  const refreshProjects = () => {
    if (sidebarRef.current) {
      sidebarRef.current.refreshProjects();
    }
  };

  return (
    <ProjectsProvider refreshProjects={refreshProjects}>
      <div className="app-layout">
        <Sidebar ref={sidebarRef} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:projectId" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </ProjectsProvider>
  );
}

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
        <AppWithSidebar />
      </SignedIn>
    </div>
  );
}
