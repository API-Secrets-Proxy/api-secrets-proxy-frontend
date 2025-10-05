var isLoggedIn = () => {
  return true; //TODO: change
}

var baseURL = "http://127.0.0.1:8080";

// Global user data - will be populated from API
var userData = {
  id: "49e84244-f449-4fac-955c-314037a8e202", // Hardcoded user ID
  name: "Morris Richman",
  projects: {}
};

// API Functions
async function fetchUser(userId) {
  try {
    const response = await fetch(`${baseURL}/users/${userId}`, {
      headers: {
        'Accept-Encoding': 'gzip, zlib, deflate, zstd, br'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

async function fetchUserProjects(userId) {
  try {
    // First, try to get user data to see if it includes projects
    const user = await fetchUser(userId);
    
    // Check if the user response includes projects
    if (user.projects) {
      console.log('User has projects:', user.projects);
      console.log('User projects type:', typeof user.projects);
      console.log('User projects isArray:', Array.isArray(user.projects));
      
      // If projects is an array, convert it to an object
      if (Array.isArray(user.projects)) {
        const projectsObj = {};
        user.projects.forEach((project, index) => {
          const projectId = project.id || project.uuid || index.toString();
          projectsObj[projectId] = {
            name: project.name,
            description: project.description,
            uuid: projectId,
            keys: project.keys || []
          };
        });
        return projectsObj;
      }
      
      return user.projects;
    }
    
    // If no projects in user data, try to get projects from localStorage
    // or implement a known projects list
    const knownProjects = getKnownProjects();
    if (knownProjects.length > 0) {
      const projects = {};
      for (const projectId of knownProjects) {
        try {
          const project = await fetchProject(userId, projectId);
          console.log(`Loaded project ${projectId}:`, project);
          
          // Load keys for this project using the correct endpoint
          const keys = await fetchProjectKeys(userId, projectId);
          console.log(`Loaded keys for project ${projectId}:`, keys);
          
          projects[projectId] = {
            name: project.name,
            description: project.description,
            uuid: projectId,
            keys: keys
          };
        } catch (error) {
          console.log(`Project ${projectId} not found, skipping`);
        }
      }
      return projects;
    }
    
    // Fallback: return empty object
    return {};
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}

// Helper function to get known project IDs
function getKnownProjects() {
  // Try to get from localStorage first
  const stored = localStorage.getItem('knownProjects');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Fallback: return some known project IDs from the examples
  // You can add more project IDs here as you discover them
  return [
    'DB1D3C8B-CC5E-46E0-89FE-0534A5B091F7' // From APIProxy.sh example
  ];
}

// Function to manually add a project ID (useful for testing)
function addKnownProject(projectId) {
  saveKnownProject(projectId);
  console.log(`Added project ID ${projectId} to known projects`);
}

// Helper function to save known project IDs
function saveKnownProject(projectId) {
  const knownProjects = getKnownProjects();
  if (!knownProjects.includes(projectId)) {
    knownProjects.push(projectId);
    localStorage.setItem('knownProjects', JSON.stringify(knownProjects));
  }
}

async function fetchProject(userId, projectId) {
  try {
    const response = await fetch(`${baseURL}/users/${userId}/projects/${projectId}`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Encoding': 'gzip, zlib, deflate, zstd, br'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

async function createProject(userId, projectData) {
  try {
    const response = await fetch(`${baseURL}/users/${userId}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Encoding': 'gzip, zlib, deflate, zstd, br'
      },
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

async function createKey(userId, projectId, keyData) {
  try {
    const response = await fetch(`${baseURL}/users/${userId}/projects/${projectId}/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Encoding': 'gzip, zlib, deflate, zstd, br'
      },
      body: JSON.stringify(keyData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating key:', error);
    throw error;
  }
}

async function fetchKey(userId, projectId, keyId) {
  try {
    const response = await fetch(`${baseURL}/users/${userId}/projects/${projectId}/keys/${keyId}`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Encoding': 'gzip, zlib, deflate, zstd, br'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching key:', error);
    throw error;
  }
}

async function fetchProjectKeys(userId, projectId) {
  try {
    // Use the correct endpoint to get all keys for a project
    const response = await fetch(`${baseURL}/users/${userId}/projects/${projectId}/keys`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Encoding': 'gzip, zlib, deflate, zstd, br'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const keys = await response.json();
    console.log(`Fetched keys for project ${projectId}:`, keys);
    
    // Transform the response to match our expected format
    if (Array.isArray(keys)) {
      return keys.map(key => ({
        name: key.name,
        description: key.description,
        id: key.id
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching project keys:', error);
    return [];
  }
}

// Helper function to get known key IDs for a project
function getKnownKeys(projectId) {
  const stored = localStorage.getItem(`knownKeys_${projectId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Fallback: return some known key IDs from the examples
  // You can add more key IDs here as you discover them
  if (projectId === 'DB1D3C8B-CC5E-46E0-89FE-0534A5B091F7') {
    return [
      'E634E66B-98F3-4FF3-87C1-BE9CC0568646' // From APIProxy.sh example
    ];
  }
  
  return [];
}

// Helper function to save known key IDs for a project
function saveKnownKey(projectId, keyId) {
  const knownKeys = getKnownKeys(projectId);
  if (!knownKeys.includes(keyId)) {
    knownKeys.push(keyId);
    localStorage.setItem(`knownKeys_${projectId}`, JSON.stringify(knownKeys));
  }
}

// Initialize user data on page load
async function initializeUserData() {
  try {
    const user = await fetchUser(userData.id);
    userData.name = user.name;
    
    // Load projects (we'll need to track created projects)
    const projects = await fetchUserProjects(userData.id);
    userData.projects = projects;
    
    console.log('User data initialized:', userData);
    
    // Trigger UI updates if functions exist
    if (typeof updateProjects === 'function') {
      updateProjects();
    }
  } catch (error) {
    console.error('Failed to initialize user data:', error);
    console.log('Using fallback data. Make sure the API server is running on', baseURL);
    // Fallback to default data if API fails
  }
}

async function makeProxyRequest(partialKey, associationId, destination, method, additionalHeaders = {}) {
  try {
    const headers = {
      'Authorization': `Bearer ${partialKey}`,
      'APIProxy_ASSOCIATION_ID': associationId,
      'APIProxy_DESTINATION': destination,
      'APIProxy_HTTP_METHOD': method,
      'Accept-Encoding': 'gzip, zlib, deflate, zstd, br',
      ...additionalHeaders
    };

    const response = await fetch(`${baseURL}/proxy`, {
      method: 'POST',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making proxy request:', error);
    throw error;
  }
}

// Function to refresh projects (useful for testing)
async function refreshProjects() {
  try {
    const projects = await fetchUserProjects(userData.id);
    userData.projects = projects;
    
    // Trigger UI updates if functions exist
    if (typeof updateProjects === 'function') {
      updateProjects();
    }
    
    console.log('Projects refreshed:', userData.projects);
  } catch (error) {
    console.error('Error refreshing projects:', error);
  }
}

// Function to manually add a key ID (useful for testing)
function addKnownKey(projectId, keyId) {
  saveKnownKey(projectId, keyId);
  console.log(`Added key ID ${keyId} to project ${projectId}`);
}

// Function to refresh keys for a specific project
async function refreshProjectKeys(projectId) {
  try {
    const keys = await fetchProjectKeys(userData.id, projectId);
    if (userData.projects[projectId]) {
      userData.projects[projectId].keys = keys;
    }
    
    // Trigger UI updates if functions exist
    if (typeof updateKeyList === 'function') {
      updateKeyList();
    }
    
    console.log(`Keys refreshed for project ${projectId}:`, keys);
  } catch (error) {
    console.error('Error refreshing project keys:', error);
  }
}

// Function to add a test project (for debugging)
function addTestProject() {
  const testProjectId = 'DB1D3C8B-CC5E-46E0-89FE-0534A5B091F7';
  userData.projects[testProjectId] = {
    name: 'Test Project',
    description: 'This is a test project',
    uuid: testProjectId,
    keys: []
  };
  
  console.log('Added test project:', userData.projects);
  
  // Trigger UI updates if functions exist
  if (typeof updateProjects === 'function') {
    updateProjects();
  }
}

// Initialize when the script loads
initializeUserData();
