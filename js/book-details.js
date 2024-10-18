const API_URL = "https://gutendex.com/books";
let bookDetails = {};
let loading = false;

// DOM elements
let bookDetailsContainer = document.querySelector(".book-details");
const headTitle = document.querySelector("head > title");

const bookId = new URLSearchParams(window.location.search).get("id");

async function fetchBookById(bookId) {
  // Check if books are already stored in localStorage
  const cachedBooks = localStorage.getItem("books");
  if (cachedBooks) {
    loading = true;
    bookDetailsContainer.innerHTML = "<p>Loading...</p>";

    // Add a 1-second delay before showing cached data
    setTimeout(() => {
      allBooks = JSON.parse(cachedBooks);
      bookDetails = allBooks.find((book) => book.id === parseInt(bookId));
      headTitle.textContent = `Book Library - ${bookDetails?.title}`;
      if (!bookDetails) {
        bookDetailsContainer.innerHTML =
          "<p>Book not found. Please try again.</p>";
      }
      console.log(bookDetails);
      loading = false;
      bookDetailsContainer.innerHTML = ""; // Clear the skeleton loader
      displayBookDetails();
    }, 1000); // 1 second delay
    return;
  }

  loading = true;
  bookDetailsContainer.innerHTML = "<p>Loading...</p>";
  try {
    const response = await fetch(`https://gutendex.com/books/${bookId}`);
    const data = await response.json();
    if (data) {
      headTitle.textContent = `Book Library - ${data?.title}`;
      bookDetails = data;
    }
  } catch (error) {
    console.error("Error fetching book details:", error);
    bookDetailsContainer.innerHTML =
      "<p>Error fetching book details. Please try again.</p>";
  } finally {
    loading = false;
    bookDetailsContainer.innerHTML = "";
    displayBookDetails();
  }
}

function displayBookDetails() {
  const bookCard = document.createElement("div");
  bookCard.classList.add("book-card");
  bookCard.innerHTML = `
    <img src="${bookDetails.formats["image/jpeg"]}" alt="${
    bookDetails.title
  }" onerror="this.src='https://via.placeholder.com/150'">
    <h3>${bookDetails.title}</h3>
    <p><strong>Author:</strong> ${bookDetails.authors[0].name}</p>
    <div class="genre-info">
    <P><strong>Genre:</strong></p>
    <ul>
      ${bookDetails.subjects.map((subject) => `<li>${subject}</li>`).join("")}
    </ul>
    </div>
    <div class="language-info">
    <P><strong>Languages:</strong></p>
    <ul>
      ${bookDetails.languages
        .map((lng) => `<li class="language">${lng}</li>`)
        .join("")}
    </ul>
    </div>
    <p><strong>Copyright:</strong> ${bookDetails.copyright ? "Yes" : "No"}</p>
    <p><strong>Book ID:</strong> ${bookDetails.id}</p>
    <button onclick="navigateToList()" class="back-to-list">Back to List</button>
  `;
  bookDetailsContainer.innerHTML = "";
  bookDetailsContainer.appendChild(bookCard);
}

// Function to navigate to the list page
function navigateToList() {
  // navigate to back;
  window.history.back();
}

// Initialize the page
fetchBookById(bookId);

// Load user preferences
window.addEventListener("load", () => {
  fetchBookById(bookId);
});
