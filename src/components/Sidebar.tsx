import { useAuth } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
  id?: string;
  name?: string;
  description: string;
  keys?: unknown[];
}

export default function Sidebar() {
  const { getToken } = useAuth();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = await getToken({ template: "default" });

        const res = await fetch(`${API_URL}/me/projects`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getToken]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isProjectActive = (projectId: string) => {
    return location.pathname === `/projects/${projectId}`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo-link" onClick={() => setIsMobileOpen(false)}>
            <h1 className="sidebar-logo">ProxLock</h1>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`sidebar-nav-item ${isActive("/") ? "active" : ""}`}
            onClick={() => setIsMobileOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z" fill="currentColor"/>
            </svg>
            <span>Home</span>
          </Link>

          <div className="sidebar-divider"></div>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <h3 className="sidebar-section-title">Projects</h3>
              <span className="sidebar-section-count">{projects.length}</span>
            </div>

            {loading ? (
              <div className="sidebar-loading">
                <div className="sidebar-spinner"></div>
                <span>Loading...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="sidebar-empty">
                <p>No projects yet</p>
              </div>
            ) : (
              <div className="sidebar-projects">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={project.id ? `/projects/${project.id}` : "#"}
                    className={`sidebar-project-item ${project.id && isProjectActive(project.id) ? "active" : ""}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <div className="sidebar-project-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4L8 1L14 4V11L8 14L2 11V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="sidebar-project-info">
                      <span className="sidebar-project-name">
                        {project.name || "Unnamed Project"}
                      </span>
                      {project.keys && project.keys.length > 0 && (
                        <span className="sidebar-project-badge">
                          {project.keys.length}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">© {new Date().getFullYear()} ProxLock</p>
        </div>
      </aside>
    </>
  );
}

