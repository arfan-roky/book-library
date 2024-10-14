const API_URL = "https://gutendex.com/books";
let currentPage = 1;
let booksPerPage = 10;
let allBooks = [];
let filteredBooks = [];
let genres = new Set();
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
const navLinks = document.querySelectorAll("nav a");
const pages = document.querySelectorAll("main > div");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetPage = e.target.getAttribute("data-page");
    pages.forEach((page) => {
      page.style.display = page.id === `${targetPage}-page` ? "block" : "none";
    });
    navLinks.forEach((navLink) => navLink.classList.remove("active"));
    e.target.classList.add("active");
  });
});

// Fetch books from API
async function fetchBooks() {
  console.log("fetching books");
  loading = true;
  showSkeletonLoader();
  try {
    const response = await fetch(`${API_URL}`);
    const data = await response.json();
    allBooks = data.results;
    filteredBooks = [...allBooks]; // Initialize filteredBooks
    updateGenres();
  } catch (error) {
    console.error("Error fetching books:", error);
    booksContainer.innerHTML = "<p>Error fetching books. Please try again.</p>";
  } finally {
    console.log("done");
    loading = false;
    booksContainer.innerHTML = "";
    displayBooks();
  }
}
// Update genres
function updateGenres() {
  allBooks.forEach((book) => {
    book.subjects.forEach((genre) => genres.add(genre));
  });
  genreFilter.innerHTML = '<option value="">All Genres</option>';
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
    const booksToDisplay = filteredBooks.slice(startIndex, endIndex);

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
    <h3>${title}</h3>
    <p>Author: ${author}</p>
    <p>Genre: ${genre}</p>
    <p>ID: ${bookId}</p>
    <button class="wishlist-toggle" data-id="${book.id}">
        ${isInWishlist(book.id) ? "❤️" : "🤍"}
    </button>
  `;
  bookCard.addEventListener("click", () => showBookDetails(book));
  return bookCard;
}

// Show Skeleton Loader (only called if loading is true)
function showSkeletonLoader() {
  booksContainer.innerHTML = ""; // Clear existing content
  for (let i = 0; i < 10; i++) {
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

// Show book details
function showBookDetails(book) {
  bookDetailsPage.style.display = "block";
  document.getElementById("home-page").style.display = "none";
  bookDetails.innerHTML = `
    <h2>${book.title}</h2>
    <img src="${book.formats["image/jpeg"]}" alt="${
    book.title
  }" onerror="this.src='https://via.placeholder.com/150'">
    <p><strong>Author:</strong> ${book.authors[0]?.name || "Unknown"}</p>
    <p><strong>Genre:</strong> ${book.bookshelves[0] || "Uncategorized"}</p>
    <p><strong>ID:</strong> ${book.id}</p>
    <p><strong>Download count:</strong> ${book.download_count}</p>
    <p><strong>Languages:</strong> ${book.languages.join(", ")}</p>
    <a href="${book.formats["text/html"]}" target="_blank">Read Online</a>
  `;
}

// Filter books
function filterBooks() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedGenre = genreFilter.value;

  filteredBooks = allBooks.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(searchTerm);
    const genreMatch =
      selectedGenre === "" || book.subjects.includes(selectedGenre);
    return titleMatch && genreMatch;
  });

  currentPage = 1;
  displayBooks();
  updatePagination(filteredBooks.length);
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// Wishlist functionality
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

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

function isInWishlist(bookId) {
  return wishlist.includes(bookId);
}

// Event listeners
searchInput.addEventListener("input", filterBooks);
genreFilter.addEventListener("change", filterBooks);
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

backToListBtn.addEventListener("click", () => {
  bookDetailsPage.style.display = "none";
  document.getElementById("home-page").style.display = "block";
});

booksContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("wishlist-toggle")) {
    e.stopPropagation();
    const bookId = parseInt(e.target.getAttribute("data-id"));
    toggleWishlist(bookId);
  }
});

// Initialize the application
fetchBooks();

// Save user preferences
window.addEventListener("beforeunload", () => {
  localStorage.setItem("searchValue", searchInput.value);
  localStorage.setItem("selectedGenre", genreFilter.value);
});

// Load user preferences
window.addEventListener("load", () => {
  const savedSearchTerm = localStorage.getItem("searchTerm");
  const savedGenre = localStorage.getItem("selectedGenre");
  if (savedSearchTerm) searchInput.value = savedSearchTerm;
  if (savedGenre) genreFilter.value = savedGenre;
  filterBooks();
});
