"use strict";

const API_URL = "https://jsonplaceholder.typicode.com/users";
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];

function renderUsers(list) {
  usersList.replaceChildren();

  if (list.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "user-card";
    emptyItem.textContent = filterInput.value.trim()
      ? "No users match your filter."
      : "No users to display.";
    usersList.appendChild(emptyItem);
    return;
  }

  list.forEach((user) => {
    const item = document.createElement("li");
    item.className = "user-card";

    const name = document.createElement("h2");
    name.textContent = user.name;

    const email = document.createElement("p");
    const emailLabel = document.createElement("strong");
    emailLabel.textContent = "Email: ";
    email.append(emailLabel, document.createTextNode(user.email));

    const city = document.createElement("p");
    const cityLabel = document.createElement("strong");
    cityLabel.textContent = "City: ";
    city.append(cityLabel, document.createTextNode(user.address.city));

    const company = document.createElement("p");
    const companyLabel = document.createElement("strong");
    companyLabel.textContent = "Company: ";
    company.append(companyLabel, document.createTextNode(user.company.name));

    item.append(name, email, city, company);
    usersList.appendChild(item);
  });
}

async function loadUsers() {
  loadButton.disabled = true;
  statusMessage.classList.remove("error");
  statusMessage.textContent = "Loading users...";
  usersList.replaceChildren();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}.`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("The server returned data in an unexpected format.");
    }

    users = data;
    renderUsers(users);
    statusMessage.textContent = `Loaded ${users.length} users successfully.`;
  } catch (error) {
    users = [];
    usersList.replaceChildren();
    statusMessage.classList.add("error");
    statusMessage.textContent = `Could not load users. ${error.message} Please check your connection and try again.`;
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  const searchTerm = filterInput.value.trim().toLocaleLowerCase();
  const filteredUsers = users.filter((user) =>
    user.name.toLocaleLowerCase().includes(searchTerm)
  );
  renderUsers(filteredUsers);
});
