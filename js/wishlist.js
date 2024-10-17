// DOM elements
const wishlistContainer = document.querySelector(".wishlist");

// Get Data from localStorage
const allBooks = JSON.parse(localStorage.getItem("books")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// Render wishlist items
function renderWishlist() {
  // Show message if the wishlist is empty
  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = `<p>No books in wishlist</p>`;
    return;
  }

  // Display the loading skeleton
  showSkeletonLoader();

  // Simulate loading for 1 second before rendering the wishlist items
  setTimeout(() => {
    wishlistContainer.innerHTML = ""; // Clear the skeleton loader

    // Iterate through the wishlist and render each book
    wishlist.forEach((bookId) => {
      const wishlistItem = allBooks.find(
        (book) => book.id === parseInt(bookId)
      );
      if (wishlistItem) {
        const wishlistCard = createWishlistBookCard(wishlistItem);
        wishlistContainer.appendChild(wishlistCard);
      }
    });
  }, 1000);
}

// Create the HTML structure for each book in the wishlist
function createWishlistBookCard(book) {
  const wishlistCard = document.createElement("div");
  wishlistCard.classList.add("wishlist-item");

  const title = book.title;
  const author = book.authors[0] ? book.authors[0].name : "Unknown";
  const coverImage = book.formats["image/jpeg"];
  const genre = book.subjects.length ? book.subjects[0] : "Uncategorized";
  const bookId = book.id;

  wishlistCard.innerHTML = `
        <img src="${coverImage}" alt="${title}" onerror="this.src='https://via.placeholder.com/150'">
        <div class="wishlist-info">
          <h3 title="${title}">${title}</h3>
          <p><strong>Author:</strong> ${author}</p>
          <p><strong>Genre:</strong> ${genre}</p>
          <p><strong>Book ID:</strong> ${bookId}</p>
          </div>
          <button class="wishlist-toggle" data-id="${book.id}">
          ${isInWishlist(book.id) ? "❤️" : "🤍"}
          </button>
          <a href="../pages/book-details.html?id=${
            book.id
          }" class="book-details">
              Details
          </a>
    `;

  // Handle clicks on the wishlist toggle button and book details link
  wishlistCard.addEventListener("click", (e) => {
    if (e.target.classList.contains("wishlist-toggle")) {
      toggleWishlist(book.id);
      renderWishlist(); // Re-render the wishlist after toggling
    }
  });

  return wishlistCard;
}

// Check if a book is already in the wishlist
function isInWishlist(bookId) {
  return wishlist.includes(bookId);
}

// Add or remove a book from the wishlist
function toggleWishlist(bookId) {
  if (isInWishlist(bookId)) {
    // Remove book from wishlist
    wishlist = wishlist.filter((id) => id !== bookId);
  } else {
    // Add book to wishlist
    wishlist.push(bookId);
  }

  // Update localStorage with the updated wishlist
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// Show skeleton loader (placeholder while loading content)
function showSkeletonLoader() {
  wishlistContainer.innerHTML = ""; // Clear any existing content

  // Create skeleton cards for each item in the wishlist
  for (let i = 0; i < wishlist.length; i++) {
    const skeletonCard = document.createElement("div");
    skeletonCard.classList.add("wishlist-skeleton");

    skeletonCard.innerHTML = `
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
    `;

    wishlistContainer.appendChild(skeletonCard);
  }
}

// Initialize the rendering of the wishlist when the page loads
renderWishlist();
