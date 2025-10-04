var isLoggedIn = () => {
  return true; //TODO: change
}

var baseURL = "http://169.233.130.168:8080";

var getUserData = () => {
  return {
    id: "e634e66b-98f3-4ff3-87c1-be9cc0568646",
    name: "guest",
    projects: {

        "0000-0000-0000-000F": {
          "name": "project1",
          "uuid": "0000-0000-0000-000F",
          "keys": [
            {
              "name": "key1",
              "id": "0000-0000-0000-0001",
              "description": "sample key 1"
            },
            {
              "name": "key2",
              "id": "0000-0000-0000-0002",
              "description": "sample key 2"
            }
          ]
        }
      }
  };
  
}


var userData = getUserData();
