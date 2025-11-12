import { useAuth } from "@clerk/clerk-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
  id?: string;
  name?: string;
  description: string;
  keys?: unknown[];
}

interface APIKey {
  id?: string;
  name?: string;
  description?: string;
  partialKey?: string;
  associationId?: string;
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [showPartialKey, setShowPartialKey] = useState(false);
  const [isClosingPartialKey, setIsClosingPartialKey] = useState(false);
  const [partialKeyToShow, setPartialKeyToShow] = useState<string>("");
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [isClosingEditModal, setIsClosingEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    apiKey: "",
  });
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [updatingProject, setUpdatingProject] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setError("Project ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = await getToken({ template: "default" });

        // Fetch project details
        const projectRes = await fetch(`${API_URL}/me/projects/${projectId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
          credentials: "include",
        });

        if (!projectRes.ok) {
          throw new Error(`Failed to fetch project: ${projectRes.statusText}`);
        }

        const projectData = await projectRes.json();
        setProject(projectData);

        // Fetch keys
        const keysRes = await fetch(`${API_URL}/me/projects/${projectId}/keys`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
          credentials: "include",
        });

        if (!keysRes.ok) {
          throw new Error(`Failed to fetch keys: ${keysRes.statusText}`);
        }

        const keysData = await keysRes.json();
        setKeys(Array.isArray(keysData) ? keysData : []);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, getToken]);

  const handleDeleteKey = async (keyId: string) => {
    if (!projectId || !confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    try {
      const token = await getToken({ template: "default" });
      const res = await fetch(`${API_URL}/me/projects/${projectId}/keys/${keyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
      });

      if (res.ok) {
        // Remove the key from the list
        setKeys(keys.filter((key) => key.id !== keyId));
      } else {
        throw new Error("Failed to delete key");
      }
    } catch (err) {
      console.error("Error deleting key:", err);
      alert("Failed to delete key. Please try again.");
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      setSubmitting(true);
      const token = await getToken({ template: "default" });
      
      const res = await fetch(`${API_URL}/me/projects/${projectId}/keys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name || undefined,
          description: formData.description || undefined,
          apiKey: formData.apiKey || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create key: ${res.statusText}`);
      }

      const newKey = await res.json();
      
      // Show the partial key one time
      if (newKey.userPartialKey) {
        setPartialKeyToShow(newKey.userPartialKey);
        setShowPartialKey(true);
        setShowAddKeyModal(false);
        // Reset form
        setFormData({ name: "", description: "", apiKey: "" });
      } else {
        // If no partial key returned, just close modal and refresh
        setShowAddKeyModal(false);
        setFormData({ name: "", description: "", apiKey: "" });
      }

      // Refresh keys list
      const keysRes = await fetch(`${API_URL}/me/projects/${projectId}/keys`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
      });

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setKeys(Array.isArray(keysData) ? keysData : []);
      }
    } catch (err) {
      console.error("Error creating key:", err);
      alert("Failed to create key. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPartialKey = async () => {
    try {
      await navigator.clipboard.writeText(partialKeyToShow);
      // Close the partial key display after copying with animation
      handleClosePartialKey();
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard. Please copy manually.");
    }
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowAddKeyModal(false);
      setIsClosingModal(false);
      setFormData({ name: "", description: "", apiKey: "" });
    }, 300);
  };

  const handleClosePartialKey = () => {
    setIsClosingPartialKey(true);
    setTimeout(() => {
      setShowPartialKey(false);
      setIsClosingPartialKey(false);
      setPartialKeyToShow("");
    }, 300);
  };

  const handleOpenEditProject = () => {
    if (project) {
      setProjectFormData({
        name: project.name || "",
        description: project.description || "",
      });
      setShowEditProjectModal(true);
    }
  };

  const handleCloseEditProject = () => {
    setIsClosingEditModal(true);
    setTimeout(() => {
      setShowEditProjectModal(false);
      setIsClosingEditModal(false);
    }, 300);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !project) return;

    try {
      setUpdatingProject(true);
      const token = await getToken({ template: "default" });
      
      const res = await fetch(`${API_URL}/me/projects/${projectId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify({
          name: projectFormData.name || undefined,
          description: projectFormData.description,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update project: ${res.statusText}`);
      }

      const updatedProject = await res.json();
      setProject(updatedProject);
      handleCloseEditProject();
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project. Please try again.");
    } finally {
      setUpdatingProject(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p className="error-message">⚠️ {error || "Project not found"}</p>
          <button className="btn-solid" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-top">
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back to Projects
          </button>
        </div>
        <div className="dashboard-title-section">
          <div className="dashboard-title-row">
            <h1 className="dashboard-title">{project.name || "Unnamed Project"}</h1>
            <button
              className="edit-project-btn"
              onClick={handleOpenEditProject}
              title="Edit project"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 1.5L16.5 4.5L5.25 15.75H1.5V12L13.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="dashboard-description">{project.description || "No description provided"}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-label">Total Keys</div>
            <div className="stat-value">{keys.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Project ID</div>
            <div className="stat-value-small">{project.id || "N/A"}</div>
          </div>
        </div>

        <div className="keys-section">
          <div className="keys-header">
            <h2 className="section-title">API Keys</h2>
            <button className="btn-primary" onClick={() => setShowAddKeyModal(true)}>
              + Add Key
            </button>
          </div>

          {keys.length === 0 ? (
            <div className="empty-keys-state">
              <div className="empty-icon">🔑</div>
              <h3>No API keys yet</h3>
              <p>Add your first API key to get started with secure proxy requests.</p>
              <button className="btn-primary" onClick={() => setShowAddKeyModal(true)}>
                Create Your First Key
              </button>
            </div>
          ) : (
            <div className="keys-grid">
              {keys.map((key) => (
                <div key={key.id} className="key-card">
                  <div className="key-card-header">
                    <h3 className="key-name">{key.name || "Unnamed Key"}</h3>
                    <button
                      className="key-delete-btn"
                      onClick={() => key.id && handleDeleteKey(key.id)}
                      title="Delete key"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.5 5.5C5.77614 5.5 6 5.72386 6 6V12C6 12.2761 5.77614 12.5 5.5 12.5C5.22386 12.5 5 12.2761 5 12V6C5 5.72386 5.22386 5.5 5.5 5.5Z" fill="currentColor"/>
                        <path d="M8 5.5C8.27614 5.5 8.5 5.72386 8.5 6V12C8.5 12.2761 8.27614 12.5 8 12.5C7.72386 12.5 7.5 12.2761 7.5 12V6C7.5 5.72386 7.72386 5.5 8 5.5Z" fill="currentColor"/>
                        <path d="M11 6C11 5.72386 10.7761 5.5 10.5 5.5C10.2239 5.5 10 5.72386 10 6V12C10 12.2761 10.2239 12.5 10.5 12.5C10.7761 12.5 11 12.2761 11 12V6Z" fill="currentColor"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.5 2C10.7761 2 11 2.22386 11 2.5V3H13.5C13.7761 3 14 3.22386 14 3.5C14 3.77614 13.7761 4 13.5 4H12.5V13C12.5 13.8284 11.8284 14.5 11 14.5H5C4.17157 14.5 3.5 13.8284 3.5 13V4H2.5C2.22386 4 2 3.77614 2 3.5C2 3.22386 2.22386 3 2.5 3H5V2.5C5 2.22386 5.22386 2 5.5 2H10.5ZM4.5 4V13C4.5 13.2761 4.72386 13.5 5 13.5H11C11.2761 13.5 11.5 13.2761 11.5 13V4H4.5Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                  {key.description && (
                    <p className="key-description">{key.description}</p>
                  )}
                  <div className="key-details">
                    {key.associationId && (
                      <div className="key-detail-row">
                        <span className="key-detail-label">Association ID:</span>
                        <code className="key-id">{key.associationId}</code>
                      </div>
                    )}
                    {key.id && (
                      <div className="key-detail-row">
                        <span className="key-detail-label">Key ID:</span>
                        <code className="key-id">{key.id}</code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <Link to="/">Home</Link>
        <span className="nav-separator">•</span>
        <Link to="/profile">Profile</Link>
      </nav>

      {/* Add Key Modal */}
      {showAddKeyModal && (
        <div className={`modal-overlay ${isClosingModal ? 'closing' : ''}`} onClick={handleCloseModal}>
          <div className={`modal-content ${isClosingModal ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New API Key</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateKey} className="modal-form">
              <div className="form-group">
                <label htmlFor="key-name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="key-name"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., OpenAI, Stripe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="key-description" className="form-label">
                  Description (optional)
                </label>
                <textarea
                  id="key-description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this key is used for"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="key-apiKey" className="form-label">
                  Full API Key <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="key-apiKey"
                  className="form-input"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Enter your full API key"
                  required
                />
                <p className="form-hint">
                  ⚠️ This key will be split and stored securely. You'll receive a partial key once to copy.
                </p>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting || !formData.apiKey}>
                  {submitting ? "Creating..." : "Create Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && (
        <div className={`modal-overlay ${isClosingEditModal ? 'closing' : ''}`} onClick={handleCloseEditProject}>
          <div className={`modal-content ${isClosingEditModal ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Project</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseEditProject}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="modal-form">
              <div className="form-group">
                <label htmlFor="project-name" className="form-label">
                  Project Name
                </label>
                <input
                  type="text"
                  id="project-name"
                  className="form-input"
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="project-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="project-description"
                  className="form-textarea"
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseEditProject}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={updatingProject}>
                  {updatingProject ? "Updating..." : "Update Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partial Key Display (One-time) */}
      {showPartialKey && (
        <div className={`modal-overlay ${isClosingPartialKey ? 'closing' : ''}`}>
          <div className={`partial-key-modal ${isClosingPartialKey ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="partial-key-header">
              <h2 className="partial-key-title">⚠️ Save Your Partial Key</h2>
              <p className="partial-key-warning">
                This is the only time you'll see your partial key. Copy it now!
              </p>
            </div>
            <div className="partial-key-content">
              <label className="form-label">Your Partial Key:</label>
              <div className="partial-key-display">
                <code className="partial-key-value">{partialKeyToShow}</code>
                <button
                  className="btn-primary copy-partial-btn"
                  onClick={handleCopyPartialKey}
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>
              <p className="partial-key-instruction">
                After copying, this key will never be shown again. Use it in your requests with the format: <code>%APIProxy_PARTIAL_KEY:your_partial_key%</code>
              </p>
            </div>
            <div className="partial-key-actions">
              <button className="btn-primary" onClick={handleCopyPartialKey}>
                Copy & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
