
var newKeyForm = document.getElementById("new-key-form");

if (newKeyForm) {
  newKeyForm.addEventListener("submit", createNewKey);
}

async function createNewKey(e) {
  e.preventDefault();
  let formData = new FormData(newKeyForm);
  let {name, description, apikey} = Object.fromEntries(formData);

  try {
    const keyData = {
      name: name,
      description: description,
      apiKey: apikey
    };

    const response = await createKey(userData.id, currentProject, keyData);
    
    if (response && response.id) {
      // Save the key ID to localStorage so it can be loaded later
      saveKnownKey(currentProject, response.id);
      
      // Add the new key to our local data
      if (!userData.projects[currentProject].keys) {
        userData.projects[currentProject].keys = [];
      }
      
      userData.projects[currentProject].keys.push({
        name: response.name,
        description: response.description,
        id: response.id
      });
      
      // Update the UI
      updateKeyList();
      
      // Clear the form
      newKeyForm.reset();
      
      console.log('Key created successfully:', response);
    }
  } catch (error) {
    console.error('Error creating key:', error);
    alert('Failed to create key. Please try again.');
  }
}

function updateKeyList() {
  let keyListEl = document.getElementById("key-list");
  if (!keyListEl) return;
  
  keyListEl.innerHTML = "";
  console.log(userData);
  
  const project = userData.projects[currentProject];
  if (!project || !project.keys || project.keys.length === 0) {
    let noKeysEl = document.createElement("p");
    noKeysEl.innerText = "No keys yet. Create your first key above!";
    noKeysEl.style.fontStyle = "italic";
    noKeysEl.style.color = "#666";
    keyListEl.appendChild(noKeysEl);
    return;
  }
  
  for (let key of project.keys) {
    let keyItemEl = document.createElement("li");
    keyItemEl.classList.add("project-list-item");
    keyItemEl.classList.add("key-list-item");

    let keyNameEl = document.createElement("h3");
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
