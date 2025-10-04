  var currentProject = (new URLSearchParams(window.location.search)).get("uuid");

function generateProjectPage() {
  console.log(currentProject)
  getProjectInfo()
  document.getElementById("project-name").innerText = userData.projects[currentProject].name;
}


function getProjectInfo() {
  return {
    "name": "project 1",
    "uuid": currentProject,
    "description": "a sample project",
    "keys": []
  }
}



