import { useAuth } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProjectsContext } from "../contexts/ProjectsContext";

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

interface DeviceCheckKey {
  teamID: string;
  keyID: string;
  bypassToken: string;
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { refreshProjects } = useProjectsContext();
  const [project, setProject] = useState<Project | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [deviceCheckKey, setDeviceCheckKey] = useState<DeviceCheckKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [showPartialKey, setShowPartialKey] = useState(false);
  const [isClosingPartialKey, setIsClosingPartialKey] = useState(false);
  const [partialKeyToShow, setPartialKeyToShow] = useState<string>("");
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [isClosingEditModal, setIsClosingEditModal] = useState(false);
  const [showEditKeyModal, setShowEditKeyModal] = useState(false);
  const [isClosingEditKeyModal, setIsClosingEditKeyModal] = useState(false);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    apiKey: "",
  });
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    description: "",
  });
  const [keyFormData, setKeyFormData] = useState({
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [updatingProject, setUpdatingProject] = useState(false);
  const [updatingKey, setUpdatingKey] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [showDeviceCheckModal, setShowDeviceCheckModal] = useState(false);
  const [isClosingDeviceCheckModal, setIsClosingDeviceCheckModal] = useState(false);
  const [deviceCheckFormData, setDeviceCheckFormData] = useState({
    teamID: "",
    keyID: "",
    privateKey: "",
  });
  const [uploadingDeviceCheck, setUploadingDeviceCheck] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [deviceCheckModalMode, setDeviceCheckModalMode] = useState<"upload" | "link">("upload");
  const [availableDeviceCheckKeys, setAvailableDeviceCheckKeys] = useState<DeviceCheckKey[]>([]);
  const [loadingAvailableKeys, setLoadingAvailableKeys] = useState(false);
  const [selectedKeyToLink, setSelectedKeyToLink] = useState<string>("");
  const [linkingKey, setLinkingKey] = useState(false);

  const handleFileRead = (file: File) => {
    if (file && (file.name.endsWith('.pem') || file.name.endsWith('.key') || file.name.endsWith('.txt') || file.name.endsWith('.p8'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        // Auto-fill keyID with filename (without extension and AuthKey_ prefix) if keyID is blank
        let newKeyID = deviceCheckFormData.keyID;
        if (!deviceCheckFormData.keyID.trim()) {
          let fileNameWithoutExt = file.name.replace(/\.(pem|key|txt|p8)$/i, '');
          // Remove "AuthKey_" prefix (case-insensitive)
          fileNameWithoutExt = fileNameWithoutExt.replace(/^AuthKey_/i, '');
          newKeyID = fileNameWithoutExt;
        }
        
        setDeviceCheckFormData({ 
          ...deviceCheckFormData, 
          privateKey: content.trim(),
          keyID: newKeyID
        });
      };
      reader.readAsText(file);
    }
  };

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

        // Fetch DeviceCheck key for this project
        const deviceCheckRes = await fetch(`${API_URL}/me/projects/${projectId}/device-check/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
          credentials: "include",
        });

        if (deviceCheckRes.ok) {
          const deviceCheckData = await deviceCheckRes.json();
          // Handle both array (legacy) and single object responses
          if (Array.isArray(deviceCheckData)) {
            setDeviceCheckKey(deviceCheckData.length > 0 ? deviceCheckData[0] : null);
          } else {
            setDeviceCheckKey(deviceCheckData || null);
          }
        }
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
      // Refresh sidebar projects list
      refreshProjects();
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project. Please try again.");
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleOpenEditKey = (key: APIKey) => {
    if (key.id) {
      setEditingKeyId(key.id);
      setKeyFormData({
        name: key.name || "",
        description: key.description || "",
      });
      setShowEditKeyModal(true);
    }
  };

  const handleCloseEditKey = () => {
    setIsClosingEditKeyModal(true);
    setTimeout(() => {
      setShowEditKeyModal(false);
      setIsClosingEditKeyModal(false);
      setEditingKeyId(null);
      setKeyFormData({ name: "", description: "" });
    }, 300);
  };

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !editingKeyId) return;

    try {
      setUpdatingKey(true);
      const token = await getToken({ template: "default" });

      const res = await fetch(`${API_URL}/me/projects/${projectId}/keys/${editingKeyId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify({
          name: keyFormData.name || undefined,
          description: keyFormData.description,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update key: ${res.statusText}`);
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

      handleCloseEditKey();
    } catch (err) {
      console.error("Error updating key:", err);
      alert("Failed to update key. Please try again.");
    } finally {
      setUpdatingKey(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !project) return;

    const projectName = project.name || "this project";
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone and will delete all associated API keys.`)) {
      return;
    }

    try {
      setDeletingProject(true);
      const token = await getToken({ template: "default" });

      const res = await fetch(`${API_URL}/me/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete project: ${res.statusText}`);
      }

      // Refresh sidebar
      refreshProjects();

      // Navigate back to home
      navigate("/");
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeletingProject(false);
    }
  };

  const handleUploadDeviceCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      setUploadingDeviceCheck(true);
      const token = await getToken({ template: "default" });

      const res = await fetch(`${API_URL}/me/projects/${projectId}/device-check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify({
          teamID: deviceCheckFormData.teamID,
          keyID: deviceCheckFormData.keyID,
          privateKey: deviceCheckFormData.privateKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to upload DeviceCheck key: ${res.statusText}`);
      }

      // Refresh DeviceCheck key
      const deviceCheckRes = await fetch(`${API_URL}/me/projects/${projectId}/device-check/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
      });

      if (deviceCheckRes.ok) {
        const deviceCheckData = await deviceCheckRes.json();
        // Handle both array (legacy) and single object responses
        if (Array.isArray(deviceCheckData)) {
          setDeviceCheckKey(deviceCheckData.length > 0 ? deviceCheckData[0] : null);
        } else {
          setDeviceCheckKey(deviceCheckData || null);
        }
      }

      handleCloseDeviceCheckModal();
    } catch (err) {
      console.error("Error uploading DeviceCheck key:", err);
      alert("Failed to upload DeviceCheck key. Please try again.");
    } finally {
      setUploadingDeviceCheck(false);
    }
  };

  const handleCloseDeviceCheckModal = () => {
    setIsClosingDeviceCheckModal(true);
    setTimeout(() => {
      setShowDeviceCheckModal(false);
      setIsClosingDeviceCheckModal(false);
      setDeviceCheckFormData({ teamID: "", keyID: "", privateKey: "" });
      setIsDraggingOver(false);
      setDeviceCheckModalMode("upload");
      setSelectedKeyToLink("");
      setAvailableDeviceCheckKeys([]);
    }, 300);
  };

  const handleDeviceCheckModalModeChange = async (mode: "upload" | "link") => {
    setDeviceCheckModalMode(mode);
    
    if (mode === "link") {
      setLoadingAvailableKeys(true);
      setSelectedKeyToLink("");

      try {
        const token = await getToken({ template: "default" });
        const res = await fetch(`${API_URL}/me/device-check/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setAvailableDeviceCheckKeys(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch available DeviceCheck keys");
          setAvailableDeviceCheckKeys([]);
        }
      } catch (err) {
        console.error("Error fetching available DeviceCheck keys:", err);
        setAvailableDeviceCheckKeys([]);
      } finally {
        setLoadingAvailableKeys(false);
      }
    }
  };

  const handleLinkKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedKeyToLink) return;

    const selectedKey = availableDeviceCheckKeys.find(
      (key) => `${key.teamID}-${key.keyID}` === selectedKeyToLink
    );

    if (!selectedKey) return;

    try {
      setLinkingKey(true);
      const token = await getToken({ template: "default" });

      const res = await fetch(`${API_URL}/me/projects/${projectId}/device-check`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify({
          teamID: selectedKey.teamID,
          keyID: selectedKey.keyID,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to link DeviceCheck key: ${res.statusText}`);
      }

      // Refresh DeviceCheck key
      const deviceCheckRes = await fetch(`${API_URL}/me/projects/${projectId}/device-check/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
      });

      if (deviceCheckRes.ok) {
        const deviceCheckData = await deviceCheckRes.json();
        // Handle both array (legacy) and single object responses
        if (Array.isArray(deviceCheckData)) {
          setDeviceCheckKey(deviceCheckData.length > 0 ? deviceCheckData[0] : null);
        } else {
          setDeviceCheckKey(deviceCheckData || null);
        }
      }

      handleCloseDeviceCheckModal();
    } catch (err) {
      console.error("Error linking DeviceCheck key:", err);
      alert("Failed to link DeviceCheck key. Please try again.");
    } finally {
      setLinkingKey(false);
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
                    <div className="key-card-actions">
                      <button
                        className="key-edit-btn"
                        onClick={() => handleOpenEditKey(key)}
                        title="Edit key"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.5 1.5L14.5 4.5L4.5 14.5H1.5V11.5L11.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
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

        {/* DeviceCheck Key Section */}
        <div className="devicecheck-section">
          <div className="devicecheck-header">
            <h2 className="section-title">Apple Device Check</h2>
            <button className="btn-primary" onClick={() => setShowDeviceCheckModal(true)}>
              {deviceCheckKey ? "Update Key" : "+ Upload DeviceCheck Key"}
            </button>
          </div>

          {!deviceCheckKey ? (
            <div className="empty-devicecheck-state">
              <div className="empty-icon">🍎</div>
              <h3>No Device Check key yet</h3>
              <p>Upload your Apple Device Check private key to enable device verification.</p>
            </div>
          ) : (
            <div className="devicecheck-card">
              <div className="devicecheck-card-header">
                <h3 className="devicecheck-team-id">Team ID: {deviceCheckKey.teamID}</h3>
              </div>
              <div className="devicecheck-details">
                <div className="devicecheck-detail-row">
                  <span className="devicecheck-detail-label">Key ID:</span>
                  <code className="devicecheck-detail-value">{deviceCheckKey.keyID}</code>
                </div>
                <div className="devicecheck-detail-row">
                  <span className="devicecheck-detail-label">Bypass Token:</span>
                  <div className="devicecheck-value-container">
                    <code className="devicecheck-detail-value">{deviceCheckKey.bypassToken}</code>
                    <button
                      className="devicecheck-copy-btn"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(deviceCheckKey.bypassToken);
                          // You could add a toast notification here if desired
                        } catch (err) {
                          console.error("Failed to copy:", err);
                          alert("Failed to copy to clipboard. Please copy manually.");
                        }
                      }}
                      title="Copy bypass token"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Project Section */}
      <div className="dashboard-delete-section">
        <div className="dashboard-delete-content">
          <div className="dashboard-delete-info">
            <h3 className="dashboard-delete-title">Danger Zone</h3>
            <p className="dashboard-delete-description">
              Deleting this project will permanently remove it and all associated API keys. This action cannot be undone.
            </p>
          </div>
          <button
            className="btn-danger"
            onClick={handleDeleteProject}
            disabled={deletingProject}
          >
            {deletingProject ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </div>

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
                  Name <span className="required">*</span>
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

      {/* Edit Key Modal */}
      {showEditKeyModal && (
        <div className={`modal-overlay ${isClosingEditKeyModal ? 'closing' : ''}`} onClick={handleCloseEditKey}>
          <div className={`modal-content ${isClosingEditKeyModal ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit API Key</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseEditKey}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateKey} className="modal-form">
              <div className="form-group">
                <label htmlFor="key-edit-name" className="form-label">
                  Key Name
                </label>
                <input
                  type="text"
                  id="key-edit-name"
                  className="form-input"
                  value={keyFormData.name}
                  onChange={(e) => setKeyFormData({ ...keyFormData, name: e.target.value })}
                  placeholder="Enter key name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="key-edit-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="key-edit-description"
                  className="form-textarea"
                  value={keyFormData.description}
                  onChange={(e) => setKeyFormData({ ...keyFormData, description: e.target.value })}
                  placeholder="Enter key description"
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseEditKey}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={updatingKey}>
                  {updatingKey ? "Updating..." : "Update Key"}
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
                </div>
                <p className="partial-key-instruction">
                  After closing, this key will never be shown again. Use it in your requests with the format: <code>%ProxLock_PARTIAL_KEY:your_partial_key%</code>
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

      {/* Upload/Link DeviceCheck Key Modal */}
      {showDeviceCheckModal && (
        <div className={`modal-overlay ${isClosingDeviceCheckModal ? 'closing' : ''}`} onClick={handleCloseDeviceCheckModal}>
          <div className={`modal-content ${isClosingDeviceCheckModal ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {deviceCheckModalMode === "upload" ? "Upload Device Check Key" : "Link Device Check Key"}
              </h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseDeviceCheckModal}
              >
                ×
              </button>
            </div>
            
            {/* Mode Toggle */}
            <div className="modal-mode-toggle">
              <button
                type="button"
                className={`modal-mode-btn ${deviceCheckModalMode === "upload" ? "active" : ""}`}
                onClick={() => handleDeviceCheckModalModeChange("upload")}
              >
                Upload New Key
              </button>
              <button
                type="button"
                className={`modal-mode-btn ${deviceCheckModalMode === "link" ? "active" : ""}`}
                onClick={() => handleDeviceCheckModalModeChange("link")}
              >
                Link Existing Key
              </button>
            </div>

            {deviceCheckModalMode === "upload" ? (
              <form onSubmit={handleUploadDeviceCheck} className="modal-form">
                <div className="form-group">
                  <label htmlFor="devicecheck-teamid" className="form-label">
                    Team ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="devicecheck-teamid"
                    className="form-input"
                    value={deviceCheckFormData.teamID}
                    onChange={(e) => setDeviceCheckFormData({ ...deviceCheckFormData, teamID: e.target.value })}
                    placeholder="e.g., XYZ789GHI0"
                    required
                    minLength={10}
                    maxLength={10}
                    pattern=".{10}"
                  />
                  <p className="form-hint">
                    Team ID must be exactly 10 characters.
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="devicecheck-keyid" className="form-label">
                    Key ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="devicecheck-keyid"
                    className="form-input"
                    value={deviceCheckFormData.keyID}
                    onChange={(e) => setDeviceCheckFormData({ ...deviceCheckFormData, keyID: e.target.value })}
                    placeholder="e.g., ABC123DEF4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="devicecheck-privatekey" className="form-label">
                    Private Key (PEM format) <span className="required">*</span>
                  </label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="devicecheck-file-upload"
                      accept=".pem,.key,.txt,.p8"
                      className="file-upload-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileRead(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="devicecheck-file-upload"
                      className={`file-upload-label ${isDraggingOver ? 'dragging' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOver(false);
                        
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          handleFileRead(file);
                        }
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12V6M9 6L6 9M9 6L12 9M3 15H15C15.5523 15 16 14.5523 16 14V4C16 3.44772 15.5523 3 15 3H3C2.44772 3 2 3.44772 2 4V14C2 14.5523 2.44772 15 3 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{isDraggingOver ? 'Drop Key File Here' : 'Upload Key File'}</span>
                    </label>
                  </div>
                  <textarea
                    id="devicecheck-privatekey"
                    className="form-textarea"
                    value={deviceCheckFormData.privateKey}
                    onChange={(e) => setDeviceCheckFormData({ ...deviceCheckFormData, privateKey: e.target.value })}
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                    rows={8}
                    required
                  />
                  <p className="form-hint">
                    Paste your ES256 private key in PEM format here, or upload a .p8 file.
                  </p>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCloseDeviceCheckModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={uploadingDeviceCheck || !deviceCheckFormData.teamID.trim() || deviceCheckFormData.teamID.trim().length !== 10 || !deviceCheckFormData.keyID.trim() || !deviceCheckFormData.privateKey.trim()}>
                    {uploadingDeviceCheck ? "Uploading..." : "Upload Key"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLinkKey} className="modal-form">
                <div className="form-group">
                  <label htmlFor="link-key-select" className="form-label">
                    Select Key <span className="required">*</span>
                  </label>
                  {loadingAvailableKeys ? (
                    <div className="form-loading">
                      <div className="spinner"></div>
                      <span>Loading available keys...</span>
                    </div>
                  ) : availableDeviceCheckKeys.length === 0 ? (
                    <div className="form-empty">
                      <p>No DeviceCheck keys available. Please upload a key first.</p>
                    </div>
                  ) : (
                    <div className="custom-key-selector-inline">
                      {availableDeviceCheckKeys.map((key) => {
                        const keyValue = `${key.teamID}-${key.keyID}`;
                        const isSelected = selectedKeyToLink === keyValue;
                        return (
                          <button
                            key={keyValue}
                            type="button"
                            className={`custom-key-selector-option-inline ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedKeyToLink(keyValue);
                            }}
                          >
                            <div className="custom-key-option-content">
                              <div className="custom-key-option-header">
                                <span className="custom-key-option-label">Team ID</span>
                                <code className="custom-key-option-value">{key.teamID}</code>
                                <span className="custom-key-option-label" style={{ marginLeft: '1rem' }}>Key ID</span>
                                <code className="custom-key-option-value">{key.keyID}</code>
                              </div>
                            </div>
                            {isSelected && (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="custom-key-option-check"
                              >
                                <path
                                  d="M16 5L7.5 13.5L4 10"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="form-hint">
                    Select an existing DeviceCheck key to link to this project. This will copy the key from your account.
                  </p>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCloseDeviceCheckModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={linkingKey || !selectedKeyToLink || availableDeviceCheckKeys.length === 0}
                  >
                    {linkingKey ? "Linking..." : "Link Key"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
