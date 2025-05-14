const apiUrl = "https://68219a12259dad2655afc1e1.mockapi.io/api";
let username = document.getElementById("username-input");
let password = document.getElementById("password-input");
let submitButton = document.getElementById("submit");

submitButton.addEventListener("click", async (e) => {
  e.preventDefault();

  login();
});

async function login() {
  try {
    const res = await fetch(`${apiUrl}/login`);
    const users = await res.json();
    const userExist = users.find(
      (u) => u.username === username.value && u.password === password.value
    );
    console.log(userExist);    if (userExist) {
      localStorage.setItem("username", userExist.username);
      window.location.href = "index.html";
    } else {
      alert("Username or password error");
    }
  } catch (err) {
    console.log("error login", err);
  }
}
