// Array of menu items
const menuOptions = [
  { name: "Pay Contacts", icon: "📱", link: "contact.html" },
  { name: "Scan QR Code", icon: "📷", link: "amount-entry.html" },
  { icon: "🌐", text: "Broadband / Landline", link: "contact.html" },
  { name: "Pay UPI ID or Number", icon: "🔢", link: "contact.html" },
];

// Get the menu containers
const menuContainer = document.getElementById("menu")

// Dynamically add menu items
menuOptions.forEach((option) => {
  const menuItem = document.createElement("div");
  menuItem.className = "menu-item";

  // Add icon and name
  menuItem.innerHTML = `<span>${option.icon}</span><div>${option.name}</div>`;
  
  // Add click event to navigate to the linked page
  menuItem.addEventListener("click", () => {
    window.location.href = option.link; // Redirect to amount-entry.html
  });

  menuContainer.appendChild(menuItem);
});

// Define the data for each category
const categories = [
  {
    title: "Recharge",
    items: [
      { icon: "📱", text: "Mobile recharge", link: "recharge.html" },
      { icon: "📺", text: "DTH / Cable TV", link: "contact.html" },
      { icon: "🎮", text: "Google Play", link: "contact.html" },
      { icon: "🚗", text: "FASTag recharge", link: "contact.html" },
    ],
  },
  {
    title: "Utility bills",
    items: [
      { icon: "💡", text: "Electricity", link: "contact.html" },
  
      { icon: "📄", text: "Postpaid mobile", link: "contact.html" },
      { icon: "💧", text: "Water", link: "contact.html" },
      { icon: "🔥", text: "Piped gas", link: "contact.html" },
      { icon: "📚", text: "Education", link: "contact.html" },
    ],
  },
];

// Reference to the container where the categories will be added
const app = document.getElementById("app");

// Function to create the categories dynamically
function createCategories() {
  categories.forEach((category) => {
    // Create the category container
    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("category");

    // Add the title
    const title = document.createElement("h2");
    title.textContent = category.title;
    categoryDiv.appendChild(title);

    // Create the menu container
    const menuDiv = document.createElement("div");
    menuDiv.classList.add("menu");

    // Add menu items
    category.items.forEach((item) => {
      const menuItem = document.createElement("div");
      menuItem.classList.add("menu-item");

      // Add the icon
      const icon = document.createElement("span");
      icon.textContent = item.icon;
      menuItem.appendChild(icon);

      // Add the text
      const text = document.createElement("p");
      text.textContent = item.text;
      menuItem.appendChild(text);

      // Add click event to navigate to the linked page
      menuItem.addEventListener("click", () => {
        window.location.href = item.link; // Redirect to amount-entry.html
      });

      // Append the menu item to the menu
      menuDiv.appendChild(menuItem);
    });

    // Append the menu to the category
    categoryDiv.appendChild(menuDiv);

    // Append the category to the container
    app.appendChild(categoryDiv);
  });
}

// Call the function to generate the content
createCategories();
