const API_KEY = "AIzaSyC9ax5uqkdmbPn-Ii3KrZ4pxXfhy4tiXRA";
const API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&key=${API_KEY}`;

// Category-specific search terms
const categorySearchTerms = {
    all: "",
    hollywood: "latest english movies full movie",
    bollywood: "latest hindi movies full movie",
    tollywood: "latest telugu movies hindi dubbed"
};

let currentCategory = 'all';
let lastSearchQuery = '';

// Enhanced intro animation
function createIntroOverlay() {
    const introOverlay = document.createElement('div');
    introOverlay.id = 'intro-overlay';
    introOverlay.innerHTML = `
        <div id="intro-text">Cinema Magic</div>
    `;
    document.body.insertBefore(introOverlay, document.body.firstChild);
}

// Enhanced movie fetching with category support
async function fetchMovies(query = "", category = "all") {
    try {
        const searchTerm = query || categorySearchTerms[category];
        const response = await fetch(`${API_URL}&q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        if (data.items) {
            displayMovies(data.items);
            showHomePage();
        } else {
            showError("No movies found. Try different search terms.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        showError("Unable to fetch movies. Please try again later.");
    }
}

// Enhanced movie display with staggered animation
function displayMovies(movies) {
    moviesContainer.innerHTML = movies
        .map((movie, index) => `
            <div class="movie-card" style="animation-delay: ${index * 0.1}s">
                <div class="card">
                    <div class="card-image-container">
                        <img src="${movie.snippet.thumbnails.high.url}" class="card-img-top" alt="${movie.snippet.title}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${movie.snippet.title}</h5>
                        <p class="card-text text-muted">${movie.snippet.channelTitle}</p>
                        <div class="button-group">
                            <button class="btn btn-primary" onclick="showMetadataPage('${movie.id.videoId}')">
                                Details
                            </button>
                            <a href="https://www.youtube.com/watch?v=${movie.id.videoId}" 
                               class="btn btn-success" target="_blank">
                                Watch Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>`
        )
        .join("");
}

// Enhanced metadata display
async function showMetadataPage(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items?.[0]) {
            const meta = data.items[0];
            const formattedViews = new Intl.NumberFormat().format(meta.statistics.viewCount);
            const formattedLikes = new Intl.NumberFormat().format(meta.statistics.likeCount || 0);

            metadataPage.innerHTML = `
                <div class="metadata-container">
                    <div class="card bg-dark text-light p-4">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${meta.snippet.thumbnails.high.url}" 
                                     class="img-fluid rounded mb-3" 
                                     alt="${meta.snippet.title}">
                            </div>
                            <div class="col-md-6">
                                <h2 class="mb-4">${meta.snippet.title}</h2>
                                <div class="metadata-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Views</span>
                                        <span class="stat-value">${formattedViews}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Likes</span>
                                        <span class="stat-value">${formattedLikes}</span>
                                    </div>
                                </div>
                                <div class="metadata-description">
                                    <h5>Description</h5>
                                    <p>${meta.snippet.description}</p>
                                </div>
                                <button class="btn btn-primary mt-4" onclick="showHomePage()">
                                    Back to Movies
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            showMetadataSection();
        } else {
            showError("Movie details not available.");
        }
    } catch (error) {
        console.error("Error fetching meta data:", error);
        showError("Unable to load movie details.");
    }
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
    createIntroOverlay();
    
    // Category navigation
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            currentCategory = category;
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            fetchMovies("", category);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                lastSearchQuery = query;
                fetchMovies(query);
            }
        }
    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            lastSearchQuery
