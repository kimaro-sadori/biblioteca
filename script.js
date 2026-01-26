// ===========================================
// BIBLIOTHECA - LIBRARY MANAGEMENT SYSTEM
// ===========================================
// This is a complete Single Page Application (SPA)
// that manages books, authors, and provides statistics.

// ===========================================
// GLOBAL VARIABLES
// ===========================================
let books = [];          // Array to store all books
let authors = [];        // Array to store all authors (MODULE 2)
let editingId = null;    // ID of book being edited
let chart1 = null;       // Chart.js instance for genre chart
let chart2 = null;       // Chart.js instance for year chart

// ===========================================
// DOM ELEMENTS - Get HTML elements
// ===========================================
const form = document.getElementById('book-form');
const booksContainer = document.getElementById('books-container');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

// ===========================================
// LOCAL STORAGE FUNCTIONS
// ===========================================
// Save data to browser's local storage
function saveToLocalStorage() {
    localStorage.setItem('biblioteca_books', JSON.stringify(books));
    localStorage.setItem('biblioteca_authors', JSON.stringify(authors));
    console.log('✅ Data saved to LocalStorage');
}

// Load data from browser's local storage
function loadFromLocalStorage() {
    const savedBooks = localStorage.getItem('biblioteca_books');
    const savedAuthors = localStorage.getItem('biblioteca_authors');
    
    if (savedBooks) {
        books = JSON.parse(savedBooks);
    }
    
    if (savedAuthors) {
        authors = JSON.parse(savedAuthors);
    }
    
    console.log('📂 Data loaded from LocalStorage');
    console.log(`📚 Books: ${books.length}, ✍️ Authors: ${authors.length}`);
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
// Generate unique ID for books and authors
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===========================================
// NAVIGATION FUNCTIONS
// ===========================================
// Show different sections of the application
function showSection(sectionId) {
    console.log(`🔍 Switching to section: ${sectionId}`);
    
    // 1. Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));
    
    // 2. Remove active class from all menu items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // 3. Show the selected section
    document.getElementById(sectionId).classList.add('active');
    
    // 4. Add active class to clicked menu item
    if (event && event.target) {
        const navItem = event.target.closest('.nav-item');
        if (navItem) {
            navItem.classList.add('active');
        }
    }

    // 5. Close mobile menu on small screens
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }

    // 6. Update display based on section
    switch(sectionId) {
        case 'my-books':
            displayBooks();
            break;
        case 'authors':
            displayAuthors();
            break;
        case 'dashboard':
            updateDashboard();
            break;
             case 'add-book':  // AJOUTEZ CETTE LIGNE
        populateAuthorDropdown();  // Appelle la fonction ici
        break;
    }
}

// Toggle sidebar visibility on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    console.log('📱 Mobile sidebar toggled');
}

// ===========================================
// MODULE 1: BOOK MANAGEMENT (CRUD COMPLETE)
// ===========================================
// Display all books in the "My Books" section
function displayBooks() {
    console.log(`📚 Displaying ${books.length} books`);
    
    if (books.length === 0) {
        booksContainer.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <h3>Aucun livre dans la bibliothèque</h3>
                <p>Commencez par ajouter votre premier livre</p>
            </div>
        `;
        return;
    }

    // Create HTML for each book card
    booksContainer.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-title">${book.title}</div>
            <div class="book-info"><strong>Auteur:</strong> ${book.author}</div>
            <div class="book-info"><strong>Année:</strong> ${book.year}</div>
            <div class="book-info"><strong>Genre:</strong> ${book.genre}</div>
            ${book.description ? `<div class="book-description">${book.description}</div>` : ''}
            <div class="book-actions">
             <button class="btn btn-view" onclick="viewBook('${book.id}')">👁️ Voir</button>
                <button class="btn btn-edit" onclick="editBook('${book.id}')">✏️ Modifier</button>
                <button class="btn btn-delete" onclick="deleteBook('${book.id}')">🗑️ Supprimer</button>
            </div>
        </div>
    `).join('');
}
// ===========================================
// FUNCTION TO POPULATE AUTHOR DROPDOWN
// ===========================================
function populateAuthorDropdown() {
    const authorSelect = document.getElementById('author');
    authorSelect.innerHTML = '<option value="">Sélectionnez un auteur</option>';
    
    authors.forEach(author => {
        const option = document.createElement('option');
        option.value = author.name;
        option.textContent = author.name;
        authorSelect.appendChild(option);
    });
}
// Handle book form submission (Add or Edit)
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload
    console.log('📝 Book form submitted');

    // Create book object from form data
    const book = {
        id: editingId || generateId(),
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        year: document.getElementById('year').value,
        genre: document.getElementById('genre').value,
        description: document.getElementById('description').value
    };

    if (editingId) {
        // EDIT MODE: Update existing book
        const index = books.findIndex(b => b.id === editingId);
        if (index !== -1) {
            books[index] = book;
            editingId = null;
            submitBtn.textContent = 'Ajouter le Livre';
            cancelBtn.style.display = 'none';
            alert('✅ Livre modifié avec succès!');
            console.log(`✏️ Book updated: ${book.title}`);
        }
    } else {
        // ADD MODE: Add new book
        books.push(book);
        alert('✅ Livre ajouté avec succès!');
        console.log(`➕ New book added: ${book.title}`);
    }

    // Clear form and update display
    form.reset();
    displayBooks();
    saveToLocalStorage();
    updateDashboard(); // Update KPI and charts
});

// Cancel edit mode
cancelBtn.addEventListener('click', () => {
    editingId = null;
    form.reset();
    submitBtn.textContent = 'Ajouter le Livre';
    cancelBtn.style.display = 'none';
    console.log('❌ Edit cancelled');
});

// Edit a book
function editBook(id) {
    console.log(`✏️ Editing book ID: ${id}`);
    
    const book = books.find(b => b.id === id);
    if (!book) return;

    // Fill form with book data
    editingId = id;
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('year').value = book.year;
    document.getElementById('genre').value = book.genre;
    document.getElementById('description').value = book.description;

    // Update button texts
    submitBtn.textContent = 'Mettre à Jour';
    cancelBtn.style.display = 'inline-block';

    // Navigate to "Add Book" section
    showSection('add-book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete a book
function deleteBook(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
        books = books.filter(b => b.id !== id);
        displayBooks();
        saveToLocalStorage();
        updateDashboard();
        alert('✅ Livre supprimé avec succès!');
        console.log(`🗑️ Book deleted: ${id}`);
    }
}

// Search books by title or author
function searchBooks() {
    const searchTerm = document.getElementById('search-books').value.toLowerCase();
    console.log(`🔍 Searching for: ${searchTerm}`);
    
    if (searchTerm === '') {
        displayBooks();
        return;
    }

    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm)
    );

    // Display filtered books
    if (filteredBooks.length === 0) {
        booksContainer.innerHTML = `
            <div class="empty-state">
                <h3>Aucun résultat trouvé</h3>
                <p>Aucun livre ne correspond à votre recherche</p>
            </div>
        `;
        return;
    }

    booksContainer.innerHTML = filteredBooks.map(book => `
        <div class="book-card">
            <div class="book-title">${book.title}</div>
            <div class="book-info"><strong>Auteur:</strong> ${book.author}</div>
            <div class="book-info"><strong>Année:</strong> ${book.year}</div>
            <div class="book-info"><strong>Genre:</strong> ${book.genre}</div>
            ${book.description ? `<div class="book-description">${book.description}</div>` : ''}
            <div class="book-actions">
                <button class="btn btn-edit" onclick="editBook('${book.id}')">✏️ Modifier</button>
                <button class="btn btn-delete" onclick="deleteBook('${book.id}')">🗑️ Supprimer</button>
            </div>
        </div>
    `).join('');
}

// Sort books
function sortBooks() {
    const sortBy = document.getElementById('sort-books').value;
    console.log(`📊 Sorting books by: ${sortBy}`);
    
    switch(sortBy) {
        case 'title-asc':
            books.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            books.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'year-asc':
            books.sort((a, b) => a.year - b.year);
            break;
        case 'year-desc':
            books.sort((a, b) => b.year - a.year);
            break;
        case 'author-asc':
            books.sort((a, b) => a.author.localeCompare(b.author));
            break;
    }
    
    displayBooks();
}

// ===========================================
// MODULE 2: AUTHORS MANAGEMENT (CRUD SIMPLIFIED)
// ===========================================
// Display all authors
function displayAuthors() {
    const authorsList = document.getElementById('authors-list');
    console.log(`✍️ Displaying ${authors.length} authors`);
    
    if (authors.length === 0) {
        authorsList.innerHTML = `
            <div class="empty-state">
                <h3>Aucun auteur enregistré</h3>
                <p>Ajoutez votre premier auteur</p>
            </div>
        `;
        return;
    }

    // Create HTML for each author
    authorsList.innerHTML = authors.map(author => `
        <div class="author-item">
            <h4>${author.name}</h4>
            <p><strong>Nationalité:</strong> ${author.nationality || 'Non spécifiée'}</p>
            <p><strong>Année de naissance:</strong> ${author.birthYear || 'Non spécifiée'}</p>
            ${author.bio ? `<p><strong>Biographie:</strong> ${author.bio}</p>` : ''}
            <button class="btn btn-delete" onclick="deleteAuthor('${author.id}')">🗑️ Supprimer</button>
        </div>
    `).join('');
}

// Handle author form submission
document.getElementById('author-form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('📝 Author form submitted');
    
    // Create author object from form data
    const author = {
        id: generateId(),
        name: document.getElementById('author-name').value,
        nationality: document.getElementById('author-nationality').value,
        birthYear: document.getElementById('author-birth-year').value,
        bio: document.getElementById('author-bio').value
    };
    
    // Add author and update display
    authors.push(author);
    document.getElementById('author-form').reset();
    displayAuthors();
    saveToLocalStorage();
       updateDashboard(); // Update KPI
    populateAuthorDropdown(); // <-- AJOUTEZ CETTE LIGNE ICI
    alert('✅ Auteur ajouté avec succès!');
    console.log(`➕ New author added: ${author.name}`);
});

// Delete an author
function deleteAuthor(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet auteur ?')) {
        authors = authors.filter(a => a.id !== id);
        displayAuthors();
        saveToLocalStorage();
        updateDashboard();
        alert('✅ Auteur supprimé!');
        console.log(`🗑️ Author deleted: ${id}`);
    }
}

// ===========================================
// MODULE 3: DASHBOARD & API INTEGRATION
// ===========================================
// Update all dashboard statistics
function updateDashboard() {
    console.log('📊 Updating dashboard statistics');
    
    // Update KPI values
    document.getElementById('total-books-kpi').textContent = books.length;
    document.getElementById('total-authors-kpi').textContent = authors.length;
    
    // Find most popular genre
    const genreCount = {};
    books.forEach(book => {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
    });
    
    let popularGenre = 'Aucun';
    let maxCount = 0;
    
    for (const genre in genreCount) {
        if (genreCount[genre] > maxCount) {
            maxCount = genreCount[genre];
            popularGenre = genre;
        }
    }
    
    document.getElementById('popular-genre-kpi').textContent = popularGenre;
    
    // Update charts
    updateGenreChart();
    updateYearChart();
}

// Create/update genre distribution chart
function updateGenreChart() {
    const ctx = document.getElementById('genre-chart').getContext('2d');
    
    // Count books by genre
    const genreData = {};
    books.forEach(book => {
        genreData[book.genre] = (genreData[book.genre] || 0) + 1;
    });
    
    const genres = Object.keys(genreData);
    const counts = Object.values(genreData);
    
    // Colors for chart
    const colors = [
        'rgba(52, 152, 219, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(46, 204, 113, 0.7)',
        'rgba(230, 126, 34, 0.7)',
        'rgba(231, 76, 60, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(149, 165, 166, 0.7)',
        'rgba(52, 73, 94, 0.7)'
    ];
    
    // Destroy existing chart if it exists
    if (chart1) {
        chart1.destroy();
    }
    
    // Create new chart
    chart1 = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: genres,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: false
                }
            }
        }
    });
    
    console.log('📈 Genre chart updated');
}

// Create/update year distribution chart
function updateYearChart() {
    const ctx = document.getElementById('year-chart').getContext('2d');
    
    // Group books by year (last 10 years)
    const currentYear = new Date().getFullYear();
    const years = [];
    const counts = [];
    
    for (let i = 9; i >= 0; i--) {
        const year = currentYear - i;
        years.push(year);
        const count = books.filter(book => parseInt(book.year) === year).length;
        counts.push(count);
    }
    
    // Destroy existing chart if it exists
    if (chart2) {
        chart2.destroy();
    }
    
    // Create new chart
    chart2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Nombre de livres',
                data: counts,
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre de livres'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Année'
                    }
                }
            }
        }
    });
    
    console.log('📈 Year chart updated');
}

// ===========================================
// API INTEGRATION - OpenLibrary
// ===========================================
// Search for books using OpenLibrary API
async function searchExternalBooks() {
    const searchTerm = document.getElementById('search-term').value;
    
    if (!searchTerm.trim()) {
        alert('Veuillez entrer un terme de recherche');
        return;
    }
    
    console.log(`🌐 Searching OpenLibrary for: ${searchTerm}`);
    
    const apiResults = document.getElementById('api-results');
    apiResults.innerHTML = `
        <div class="empty-state">
            <p>🔍 Recherche en cours...</p>
        </div>
    `;
    
    try {
        // Call OpenLibrary API
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=10`);
        
        if (!response.ok) {
            throw new Error('Erreur API');
        }
        
        const data = await response.json();
        console.log(`🌐 API response received: ${data.docs.length} results`);
        
        // 1. Update KPI with total API books
        document.getElementById('api-books-kpi').textContent = data.numFound.toLocaleString();
        
        // 2. EXTRACT UNIQUE AUTHORS FROM API RESULTS
        const uniqueAuthors = new Set();
        
        data.docs.forEach(book => {
            if (book.author_name && Array.isArray(book.author_name)) {
                book.author_name.forEach(author => {
                    if (author && author.trim() !== '') {
                        uniqueAuthors.add(author.trim());
                    }
                });
            }
        });
        
        // 3. Update KPI with unique authors count
        document.getElementById('api-authors-kpi').textContent = uniqueAuthors.size;
        console.log(`👥 Found ${uniqueAuthors.size} unique authors in API results`);
        
        // Display results
        if (data.docs.length === 0) {
            apiResults.innerHTML = `
                <div class="empty-state">
                    <h3>Aucun résultat trouvé</h3>
                    <p>Aucun livre ne correspond à votre recherche</p>
                </div>
            `;
            return;
        }
        
        // Afficher les livres ET les auteurs dans les résultats
        apiResults.innerHTML = `
            <div class="api-results-container">
                <div class="api-books-section">
                    <h4>📚 Livres trouvés (${Math.min(data.docs.length, 5)}/${data.docs.length})</h4>
                    ${data.docs.slice(0, 5).map(book => `
                        <div class="api-book-item">
                            <h4>${book.title || 'Titre inconnu'}</h4>
                            <p><strong>Auteur:</strong> ${book.author_name ? book.author_name.join(', ') : 'Inconnu'}</p>
                            <p><strong>Année:</strong> ${book.first_publish_year || 'Inconnue'}</p>
                            ${book.subject ? `<p><strong>Sujets:</strong> ${book.subject.slice(0, 3).join(', ')}</p>` : ''}
                            <button class="btn btn-primary" onclick="addBookFromAPI(${JSON.stringify(book).replace(/"/g, '&quot;')})">
                                ➕ Ajouter à ma bibliothèque
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="api-authors-section">
                    <h4>👥 Auteurs trouvés (${uniqueAuthors.size})</h4>
                    <div class="authors-list">
                        ${Array.from(uniqueAuthors).slice(0, 10).map(author => `
                            <div class="author-item">
                                <span>✍️ ${author}</span>
                            </div>
                        `).join('')}
                        ${uniqueAuthors.size > 10 ? `<p>... et ${uniqueAuthors.size - 10} autres auteurs</p>` : ''}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ API Error:', error);
        apiResults.innerHTML = `
            <div class="empty-state">
                <h3>Erreur de connexion</h3>
                <p>Impossible de récupérer les données. Vérifiez votre connexion internet.</p>
            </div>
        `;
    }
}

// Add a book from API results to local library
function addBookFromAPI(apiBook) {
    console.log('➕ Adding book from API to library');
    
    const book = {
        id: generateId(),
        title: apiBook.title || 'Titre inconnu',
        author: apiBook.author_name ? apiBook.author_name.join(', ') : 'Auteur inconnu',
        year: apiBook.first_publish_year || 'Inconnue',
        genre: 'Autre', // Default genre for API books
        description: apiBook.subject ? `Sujets: ${apiBook.subject.slice(0, 5).join(', ')}` : ''
    };
    
    books.push(book);
    displayBooks();
    saveToLocalStorage();
    updateDashboard();
    alert('✅ Livre ajouté depuis l\'API avec succès!');
    
    // Go to "My Books" section
    showSection('my-books');
}

// ===========================================
// INITIALIZATION
// ===========================================
// Initialize the application when page loads
function init() {
    console.log('🚀 BIBLIOTHECA starting...');
    
    // Load data from LocalStorage
    loadFromLocalStorage();
    
    // Display initial data
    displayBooks();
    displayAuthors();
    updateDashboard();
    
    // Add some sample data if empty
    if (books.length === 0) {
        console.log('📝 Adding sample books...');
        books = [
            {
                id: generateId(),
                title: "Le Petit Prince",
                author: "Antoine de Saint-Exupéry",
                year: "1943",
                genre: "Roman",
                description: "Conte philosophique pour enfants et adultes"
            },
            {
                id: generateId(),
                title: "1984",
                author: "George Orwell",
                year: "1949",
                genre: "Science-Fiction",
                description: "Roman dystopique sur la surveillance totale"
            }
        ];
        
        authors = [
            {
                id: generateId(),
                name: "Antoine de Saint-Exupéry",
                nationality: "Française",
                birthYear: "1900",
                bio: "Écrivain, poète, aviateur et reporter français"
            }
        ];
        
        saveToLocalStorage();
        displayBooks();
        displayAuthors();
        updateDashboard();
    }
    
    console.log('✅ BIBLIOTHECA ready!');
    console.log(`📊 Stats: ${books.length} livres, ${authors.length} auteurs`);
}

// Start the application when page is loaded
document.addEventListener('DOMContentLoaded', init);
// Initialiser les KPI API
    document.getElementById('api-authors-kpi').textContent = '0';
    document.getElementById('api-books-kpi').textContent = '0';

// ===========================================
// VIEW BOOK FUNCTION
// ===========================================
function viewBook(id) {
    console.log(`👁️ Viewing book ID: ${id}`);
    
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    // Créer un popup/modal pour afficher les détails
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>👁️ Détails du Livre</h2>
                
                <div class="book-details">
                    <p><strong>📖 Titre:</strong> ${book.title}</p>
                    <p><strong>✍️ Auteur:</strong> ${book.author}</p>
                    <p><strong>📅 Année:</strong> ${book.year}</p>
                    <p><strong>🏷️ Genre:</strong> ${book.genre}</p>
                    ${book.description ? `<p><strong>📝 Description:</strong> ${book.description}</p>` : ''}
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-edit" onclick="editBook('${book.id}'); closeModal()">✏️ Modifier</button>
                    <button class="btn" onclick="closeModal()">Fermer</button>
                </div>
            </div>
        </div>
    `;
    // Ajouter le modal au HTML
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Fonction pour fermer le modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}