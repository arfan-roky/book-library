const API_URL = "https://gutendex.com/books";
let currentPage = 1;
let booksPerPage = 9;
let filteredBooks = [];
let genres = [];
let loading = false;

// DOM elements
const booksContainer = document.getElementById("books-container");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genre-filter");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const bookDetailsPage = document.getElementById("book-details-page");
const bookDetails = document.getElementById("book-details");
const backToListBtn = document.getElementById("back-to-list");

// Navigation
function renderNavLinks() {
  const navLinks = document.querySelectorAll("nav a");
  const location = window.location.href;
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === location) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Fetch books from API
async function fetchBooks() {
  // Check if books are already stored in localStorage
  const cachedBooks = localStorage.getItem("books");
  if (cachedBooks) {
    loading = true;
    showSkeletonLoader();
    // Add a 1-second delay before showing cached data
    setTimeout(() => {
      const allBooks = JSON.parse(cachedBooks);
      if (genres.length === 0) {
        updateGenres(allBooks);
      }
      filteredBooks = allBooks;
      loading = false;
      booksContainer.innerHTML = ""; // Clear the skeleton loader
      displayBooks();
    }, 1000); // 1 second delay
    return;
  }

  console.log("fetching books");
  loading = true;
  showSkeletonLoader();
  try {
    const response = await fetch(`${API_URL}`);
    const data = await response.json();
    filteredBooks = data.results; // Initialize filteredBooks
    localStorage.setItem("books", JSON.stringify(data?.results)); // Save to localStorage
    updateGenres(data?.results);
  } catch (error) {
    console.error("Error fetching books:", error);
    booksContainer.innerHTML = "<p>Error fetching books. Please try again.</p>";
  } finally {
    loading = false;
    booksContainer.innerHTML = "";
    displayBooks();
  }
}

// Update genres
function updateGenres(allBooks) {
  const genresList = new Set();
  allBooks?.forEach((book) => {
    book.subjects.forEach((genre) => genresList.add(genre));
  });
  localStorage.setItem("genres", JSON.stringify(Array.from(genresList)));
  genres = Array.from(genresList);
  renderGenres();
}

// Render Genres
function renderGenres() {
  genreFilter.innerHTML = '<option value="">All Genres</option>'; // Default option
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// Display books
function displayBooks() {
  if (!loading) {
    // Render books only if not loading
    booksContainer.innerHTML = "";
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = filteredBooks
      .filter((book) => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;

        const titleMatch = book.title.toLowerCase().includes(searchTerm);
        const genreMatch =
          selectedGenre === "" || book.subjects.includes(selectedGenre);

        return titleMatch && genreMatch;
      })
      .slice(startIndex, endIndex);

    booksToDisplay.forEach((book) => {
      const bookCard = createBookCard(book);
      booksContainer.appendChild(bookCard);
    });

    updatePagination();
  }
}

// Create book card
function createBookCard(book) {
  const bookCard = document.createElement("div");
  bookCard.classList.add("book-card");

  const title = book.title;
  const author = book.authors[0] ? book.authors[0].name : "Unknown";
  const coverImage = book.formats["image/jpeg"];
  const genre = book.subjects.length ? book.subjects[0] : "Uncategorized";
  const bookId = book.id;

  bookCard.innerHTML = `
    <img src="${coverImage}" alt="${title}" onerror="this.src='https://via.placeholder.com/150'">
    <h3 title="${title}">${title}</h3>
    <p><strong>Author:</strong> ${author}</p>
    <p><strong>Genre:</strong> ${genre}</p>
    <p><strong>Book ID:</strong> ${bookId}</p>
    <button class="wishlist-toggle" data-id="${book.id}">
        ${isInWishlist(book.id) ? "❤️" : "🤍"}
    </button>
    <a href="../pages/book-details.html?id=${book.id}" class="book-details">
    Details
    </a>
  `;
  return bookCard;
}

// Show Skeleton Loader (only called if loading is true)
function showSkeletonLoader() {
  booksContainer.innerHTML = ""; // Clear existing content
  for (let i = 0; i < booksPerPage; i++) {
    const skeletonCard = document.createElement("div"); // Create a new skeletonCard for each iteration
    skeletonCard.classList.add("skeleton-card");
    skeletonCard.innerHTML = `
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      `;
    booksContainer.appendChild(skeletonCard); // Append each skeletonCard to the container
  }
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// Wishlist functionality
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// Toggle wishlist
function toggleWishlist(bookId) {
  const index = wishlist.indexOf(bookId);
  if (index === -1) {
    wishlist.push(bookId);
  } else {
    wishlist.splice(index, 1);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  displayBooks();
}

// Check if book is in wishlist
function isInWishlist(bookId) {
  return wishlist.includes(bookId);
}

// Set selected genre
function setSelectedGenre() {
  const selectedGenre = localStorage.getItem("selectedGenre") || "";
  genreFilter.value = selectedGenre;
}

// Event listeners
searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value;
  localStorage.setItem("searchTerm", searchTerm);
  displayBooks();
});

genreFilter.addEventListener("change", (event) => {
  const selectedGenre = event.target.value;
  localStorage.setItem("selectedGenre", selectedGenre);
  displayBooks();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayBooks();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayBooks();
  }
});

// Event delegation for wishlist toggle
booksContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("wishlist-toggle")) {
    e.stopPropagation();
    const bookId = parseInt(e.target.getAttribute("data-id"));

    toggleWishlist(bookId);
  }
});

// Initialize the application
window.addEventListener("load", async () => {
  // Retrieve stored values from localStorage
  const searchTerm = localStorage.getItem("searchTerm") || "";
  const genresList = JSON.parse(localStorage.getItem("genres")) || [];

  // Set the search input value from localStorage
  searchInput.value = searchTerm;
  genres = genresList;

  fetchBooks();
  renderGenres();
  setSelectedGenre();
});
