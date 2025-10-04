var newProjectForm = document.getElementById("new-project-form");

newProjectForm.addEventListener("submit", createNewProject);
function createNewProject (e) {
  e.preventDefault();
  let formData = new FormData(newProjectForm);
  // console.log(Object.fromEntries(formData));
  // console.log(formData);
  let {name, description, apikey} = Object.fromEntries(formData);

  //TODO: Make it work with API
  fetch(`${baseURL}/users/${userData.id}/projects`, {"method": "POST"}).then(response => {
    if (!response.ok) {
      console.log("bad request!", response);
      return;
    }
    console.log(response);

    userData.projects[currentProject].keys.push(Object.fromEntries(formData));
    let data = response;
    document.getElementById("partial-key-returned").value = data.partialKey;
  }).then(response => {
    if (!response.ok) {
      console.error("bad request!");
    }
    console.log(response);
  })
  

  // console.log(e);
}


function updateProjects () {
  if (!isLoggedIn) return null;
  let projectListEl = document.querySelector("#project-list");
  projectListEl.innerHTML = "";
  for (let project of Object.values(userData.projects)) {
    let projectListItemEl = document.createElement("li");
    let projectEl = document.createElement("a");
    projectEl.classList.add("project-list-link");
    projectEl.href = baseURL + "/project.html?uuid="+project.uuid;
    projectListItemEl.classList.add("project-list-item");
    let nameEl = document.createElement("h3");
    nameEl.innerText = project.name;
    nameEl.classList.add("project-list-name");
    projectEl.appendChild(nameEl);

    projectEl.appendChild(document.createElement("hr"));
    

    // keys
    let keysList = document.createElement("ol");
    for (let key of project.keys) {
      let keyEl = document.createElement("div");
      keyEl.classList.add("project-key-element");
      keyEl.innerText = key.name;
      keysList.appendChild(keyEl);
    }

    projectEl.appendChild(keysList);


    projectListItemEl.appendChild(projectEl);
    projectListEl.appendChild(projectListItemEl);
    console.log(project);
  }
}


updateProjects()
