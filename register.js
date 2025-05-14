const apiUrl = "https://68219a12259dad2655afc1e1.mockapi.io/api";
let username = document.getElementById("username-input");
let password = document.getElementById("password-input");
let confirmPassword = document.getElementById("confirm-password");
let submitButton = document.getElementById("submit");

submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = { username: username.value, password: password.value };
  createUser(user);
});

async function createUser(user) {
  // username and password validation
  try {
    if (!user.username || !user.password) {
      alert("Username and password are required");
      return;
    }

    if (user.username.trim() === "" || user.password.trim() === "") {
      alert("Username and password cannot be empty");
      return;
    }

    if (confirmPassword.value != password.value) {
      alert("Passwords do not match");
      return;
    }
    // check if username already exists
    const checkUserResponse = await fetch(`${apiUrl}/login`);
    const allUsers = await checkUserResponse.json();

    const userExists = allUsers.some(
      (existingUser) => existingUser.username === user.username
    );

    if (userExists) {
      alert("Username already exists");
      return;
    }
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(user),
    });    if (!response.ok) {
      console.error("error:", response);
      return;
    }

    window.location.href = "login.html";
  } catch (error) {
    console.error("error", error);
  }
}
