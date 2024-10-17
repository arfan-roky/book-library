// Function to load the navbar
async function loadNavbar() {
  try {
    const response = await fetch("../pages/navbar.html");
    const navbarHTML = await response.text();
    document.getElementById("navbar").innerHTML = navbarHTML;
  } catch (error) {
    console.error("Error loading navbar:", error);
  }
}

// Call the function to load the navbar
loadNavbar();
