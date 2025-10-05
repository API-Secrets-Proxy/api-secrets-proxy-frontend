var currentProject = (new URLSearchParams(window.location.search)).get("uuid");

async function generateProjectPage() {
  console.log(currentProject);
  
  if (!currentProject) {
    console.error('No project UUID provided');
    return;
  }
  
  try {
    // Load project data from API
    const projectInfo = await getProjectInfo();
    
    // Update the project name in the header
    const projectNameEl = document.getElementById("project-name");
    if (projectNameEl) {
      projectNameEl.innerText = projectInfo.name;
    }
    
    // Update local userData with the fetched project
    userData.projects[currentProject] = projectInfo;
    
    // Update the key list
    updateKeyList();
    
  } catch (error) {
    console.error('Error loading project:', error);
    alert('Failed to load project data. Please try again.');
  }
}

async function getProjectInfo() {
  try {
    const project = await fetchProject(userData.id, currentProject);
    const keys = await fetchProjectKeys(userData.id, currentProject);
    
    return {
      name: project.name,
      uuid: currentProject,
      description: project.description,
      keys: keys
    };
  } catch (error) {
    console.error('Error fetching project info:', error);
    // Return a fallback structure
    return {
      name: "Unknown Project",
      uuid: currentProject,
      description: "Project data could not be loaded",
      keys: []
    };
  }
}



