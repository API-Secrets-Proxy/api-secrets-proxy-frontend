import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
  id?: string;
  name?: string;
  description: string;
  keys?: unknown[];
}

export default function HomePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken({ template: "default" });

        const res = await fetch(`${API_URL}/me/projects`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch projects: ${res.statusText}`);
        }

        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getToken]);

  const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "there";

  return (
    <div className="homepage-container">
      {/* Top Right User Button */}
      <div className="top-right-user-button">
        <UserButton 
          appearance={{
            elements: {
              userButtonPopoverCard: "clerk-user-button-card",
              userButtonPopoverActions: "clerk-user-button-actions",
            },
          }}
        />
      </div>

      {/* Header Section */}
      <header className="homepage-header">
        <h1 className="hero-title">Welcome back, {userName}!</h1>
        <p className="hero-subtext">
          Manage your API proxy projects and keys from one central dashboard.
        </p>
      </header>

      {/* Main Content */}
      <main className="homepage-main">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your projects...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
            <button 
              className="btn-solid" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
            <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h2>No projects yet</h2>
            <p>Get started by creating your first project to manage API keys securely.</p>
          </div>
        ) : (
          <>
            <div className="projects-header">
              <h2 className="section-title">Your Projects</h2>
              <span className="project-count">{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
            </div>
            <div className="projects-grid">
              {projects.map((project, index) => {
                const ProjectCardContent = (
                  <>
                    <div className="project-card-header">
                      <h3 className="project-name">
                        {project.name || "Unnamed Project"}
                      </h3>
                      {project.keys && project.keys.length > 0 && (
                        <span className="key-badge">{project.keys.length} {project.keys.length === 1 ? "key" : "keys"}</span>
                      )}
                    </div>
                    <p className="project-description">
                      {project.description || "No description provided"}
                    </p>
                    <div className="project-card-footer">
                      <span className="view-link">View details →</span>
                    </div>
                  </>
                );

                return project.id ? (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="project-card"
                  >
                    {ProjectCardContent}
                  </Link>
                ) : (
                  <div key={index} className="project-card" style={{ cursor: 'default', opacity: 0.7 }}>
                    {ProjectCardContent}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="page-footer">
        © {new Date().getFullYear()} ProxLock. All rights reserved.
      </footer>
    </div>
  );
}
