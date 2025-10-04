
var newKeyForm = document.getElementById("new-key-form")
// newKeyForm.addEventListener("keydown", checkSubmit);
function checkSubmit (e) {
  if (e.key === "Enter") createNewKey();
  
}
newKeyForm.addEventListener("submit", createNewKey);
function createNewKey (e) {
  e.preventDefault();
  let formData = new FormData(newKeyForm);
  // console.log(Object.fromEntries(formData));
  // console.log(formData);
  let {name, description, apikey} = Object.fromEntries(formData);
  // REMOVE:
  userData.projects[currentProject].keys.push(Object.fromEntries(formData));
  updateKeyList()

  //TODO: Make it work with API
  fetch(`${baseURL}/users/${userData.id}/project/${currentProject}/keys`, {"method": "POST"}).then(response => {
    if (!response.ok) {
      console.log("bad request!", response);
      return;
    }
    console.log(response);

    userData.projects[currentProject].keys.push(Object.fromEntries(formData));
    let data = response;
    document.getElementById("partial-key-returned").value = data.partialKey;
  })
  

  // console.log(e);
}

function updateKeyList() {
  let keyListEl = document.getElementById("key-list");
  keyListEl.innerHTML = "";
  console.log(userData)
  for (key of userData.projects[currentProject].keys) {
    let keyItemEl = document.createElement("li");
    keyItemEl.classList.add("project-list-item");
    keyItemEl.classList.add("key-list-item");

    let keyNameEl = document.createElement("h3");
    // keyNameEl.classList.add("key-entry-item");
    keyNameEl.classList.add("key-entry-title");
    keyNameEl.innerText = key.name;
    keyItemEl.appendChild(keyNameEl);

    let keyDescriptionEl = document.createElement("span");
    keyDescriptionEl.classList.add("key-entry-item");
    keyDescriptionEl.innerText = key.description;
    keyDescriptionEl.readOnly = true;
    keyItemEl.appendChild(keyDescriptionEl);

    let keyIdEl = document.createElement("input");
    keyIdEl.classList.add("key-entry-item");
    keyIdEl.classList.add("key-entry-uuid");
    keyIdEl.value = key.id;
    keyIdEl.readOnly = true;
    keyItemEl.appendChild(keyIdEl);
    keyIdEl.addEventListener("click", (e) => {
      // TODO: Make this highlight
      e.target.select()
      document.execCommand('copy');
      console.log(e.target);
    })
    

    keyListEl.appendChild(keyItemEl);
    console.log(key);
  }
}

updateKeyList()
