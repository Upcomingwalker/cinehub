const API_KEY = "AIzaSyC9ax5uqkdmbPn-Ii3KrZ4pxXfhy4tiXRA";
const API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&key=${API_KEY}`;

const moviesContainer = document.getElementById("movies");
const metadataPage = document.getElementById("metadataPage");
const searchInput = document.getElementById("searchInput");

// Category search terms
const categoryQueries = {
    all: "full movie english hindi dubbed 2024",
    hollywood: "hollywood full movie english 2024",
    bollywood: "bollywood full movie hindi 2024",
    tollywood: "tollywood hindi dubbed full movie 2024"
};

let currentCategory = 'all';

// Fetch movies based on category or search
async function fetchMovies(query = null) {
    try {
        const searchQuery = query || categoryQueries[currentCategory];
        const response = await fetch(`${API_URL}&q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.items) {
            displayMovies(data.items);
            showHomePage();
        } else {
            console.error("No movies found:", data);
            showError("No movies found. Try different search terms.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        showError("Failed to fetch movies. Please try again.");
    }
}

// Display movies in a grid
function displayMovies(movies) {
    moviesContainer.innerHTML = movies
        .map((movie, index) => `
            <div class="col-md-3 mb-4" style="animation-delay: ${index * 0.1}s">
                <div class="card h-100">
                    <img src="${movie.snippet.thumbnails.high.url}" 
                         class="card-img-top" 
                         alt="${movie.snippet.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.snippet.title}</h5>
                        <p class="card-text text-muted">${movie.snippet.channelTitle}</p>
                        <div class="mt-auto">
                            <button class="btn btn-primary mb-2 w-100" 
                                    onclick="showMetadataPage('${movie.id.videoId}')">
                                View Details
                            </button>
                            <a href="https://www.youtube.com/watch?v=${movie.id.videoId}" 
                               class="btn btn-success w-100" 
                               target="_blank">
                                Watch Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>`)
        .join("");
}

// Show movie metadata
async function showMetadataPage(videoId) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items?.[0]) {
            const meta = data.items[0];
            metadataPage.innerHTML = `
                <div class="card bg-dark text-light p-4">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${meta.snippet.thumbnails.high.url}" 
                                 class="img-fluid rounded mb-3" 
                                 alt="${meta.snippet.title}">
                        </div>
                        <div class="col-md-6">
                            <h2 class="mb-4">${meta.snippet.title}</h2>
                            <p><strong>Channel:</strong> ${meta.snippet.channelTitle}</p>
                            <p><strong>Views:</strong> ${parseInt(meta.statistics.viewCount).toLocaleString()}</p>
                            <p><strong>Likes:</strong> ${parseInt(meta.statistics.likeCount || 0).toLocaleString()}</p>
                            <div class="mt-4">
                                <h5>Description:</h5>
                                <p>${meta.snippet.description}</p>
                            </div>
                            <button class="btn btn-primary mt-4" onclick="showHomePage()">
                                Back to Movies
                            </button>
                        </div>
                    </div>
                </div>`;
            showMetadataSection();
        } else {
            showError("Movie details not available.");
        }
    } catch (error) {
        console.error("Error fetching meta data:", error);
        showError("Failed to load movie details.");
    }
}

// Toggle visibility
function showMetadataSection() {
    moviesContainer.classList.add("d-none");
    metadataPage.classList.remove("d-none");
}

function showHomePage() {
    metadataPage.classList.add("d-none");
    moviesContainer.classList.remove("d-none");
}

// Error handling
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger m-3';
    errorDiv.textContent = message;
    moviesContainer.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Category selection
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            currentCategory = category;
            document.querySelectorAll('.category-pill').forEach(p => 
                p.classList.remove('active'));
            e.target.classList.add('active');
            fetchMovies();
        });
    });

    // Search functionality
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                fetchMovies(query);
            }
        }
    });

    // Initial load
    fetchMovies();
});
