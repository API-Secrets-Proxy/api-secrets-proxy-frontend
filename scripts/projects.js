var newProjectForm = document.getElementById("new-project-form");

if (newProjectForm) {
  newProjectForm.addEventListener("submit", createNewProject);
}

async function createNewProject(e) {
  e.preventDefault();
  let formData = new FormData(newProjectForm);
  let {name, description} = Object.fromEntries(formData);

  try {
    const projectData = {
      name: name,
      description: description
    };

    const response = await createProject(userData.id, projectData);
    
    if (response && response.id) {
      // Save the project ID to localStorage so it can be loaded later
      saveKnownProject(response.id);
      
      // Add the new project to our local data
      userData.projects[response.id] = {
        name: response.name,
        description: response.description,
        uuid: response.id,
        keys: []
      };
      
      // Update the UI
      updateProjects();
      
      // Clear the form
      newProjectForm.reset();
      
      console.log('Project created successfully:', response);
    }
  } catch (error) {
    console.error('Error creating project:', error);
    alert('Failed to create project. Please try again.');
  }
}


function updateProjects () {
  if (!isLoggedIn()) return null;
  let projectListEl = document.querySelector("#project-list");
  if (!projectListEl) return;
  
  projectListEl.innerHTML = "";
  
  console.log('updateProjects called, userData.projects:', userData.projects);
  console.log('userData.projects type:', typeof userData.projects);
  console.log('userData.projects isArray:', Array.isArray(userData.projects));
  
  const projectIds = Object.keys(userData.projects);
  console.log('projectIds:', projectIds);
  
  // Debug each project
  for (let i = 0; i < projectIds.length; i++) {
    const projectId = projectIds[i];
    const project = userData.projects[projectId];
    console.log(`Project ${i}: ID="${projectId}", Project=`, project);
  }
  
  if (projectIds.length === 0) {
    let noProjectsEl = document.createElement("p");
    noProjectsEl.innerText = "No projects yet. Create your first project above!";
    noProjectsEl.style.fontStyle = "italic";
    noProjectsEl.style.color = "#666";
    projectListEl.appendChild(noProjectsEl);
    return;
  }
  
  for (let projectId of projectIds) {
    const project = userData.projects[projectId];
    let projectListItemEl = document.createElement("li");
    let projectEl = document.createElement("a");
    projectEl.classList.add("project-list-link");
    
    // Use the project's uuid field if available, otherwise use the projectId
    const actualUuid = project.uuid || projectId;
    const projectUrl = new URL(window.location.href.substring(0, location.href.lastIndexOf("/")) + "/project.html?uuid="+actualUuid);
    console.log(`Creating link for project ${projectId} (uuid: ${actualUuid}):`, projectUrl.href);
    projectEl.href = projectUrl;
    
    projectListItemEl.classList.add("project-list-item");
    let nameEl = document.createElement("h3");
    nameEl.innerText = project.name;
    nameEl.classList.add("project-list-name");
    projectEl.appendChild(nameEl);

    projectEl.appendChild(document.createElement("hr"));
    
    // Description
    if (project.description) {
      let descEl = document.createElement("p");
      descEl.innerText = project.description;
      descEl.style.fontSize = "0.9em";
      descEl.style.color = "#666";
      projectEl.appendChild(descEl);
    }

    // keys
    let keysList = document.createElement("ol");
    if (project.keys && project.keys.length > 0) {
      for (let key of project.keys) {
        let keyEl = document.createElement("div");
        keyEl.classList.add("project-key-element");
        keyEl.innerText = key.name;
        keysList.appendChild(keyEl);
      }
    } else {
      let noKeysEl = document.createElement("p");
      noKeysEl.innerText = "No keys yet";
      noKeysEl.style.fontStyle = "italic";
      noKeysEl.style.color = "#999";
      keysList.appendChild(noKeysEl);
    }

    projectEl.appendChild(keysList);

    projectListItemEl.appendChild(projectEl);
    projectListEl.appendChild(projectListItemEl);
    console.log(project);
  }
}

// Wait for user data to be initialized before updating projects
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure main.js has loaded
  setTimeout(() => {
    updateProjects();
  }, 100);
});
