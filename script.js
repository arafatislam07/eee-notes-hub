// Google Apps Script Web App URLs
const notesURL = "https://script.google.com/macros/s/AKfycbysHCrfrM922J5BqXwCPCjE74cCHCzpzObQ6ut7zxcwYHHMS4gb9ALS0b9DXwHvRbB91A/exec";
const booksURL = "https://script.google.com/macros/s/AKfycbwp0HGeFvKLyUnMXj_e31-rwkLCZYqvj3rvAICH8X6R5IPCVkxGV7QC1JkKsCoIYEak/exec";

// Global array to store merged data for searching
let combinedData = [];

/**
 * Function to clear user session and logout
 */
function logoutUser() {
    localStorage.clear();
    window.location.href = "login.html";
}

/**
 * Preload all data from both Notes and Books APIs on startup
 */
async function preLoadAllData() {
    try {
        // Fetching both APIs simultaneously for better performance
        const [notesRes, booksRes] = await Promise.all([fetch(notesURL), fetch(booksURL)]);
        const notes = await notesRes.json();
        const books = await booksRes.json();

        // Standardizing notes data format
        const formattedNotes = notes.map(n => ({ 
            title: n[3], 
            link: n[4], 
            info: n[0] + " > " + n[1], 
            type: "note" 
        }));

        // Standardizing books data format
        const formattedBooks = books.map(b => ({ 
            title: b[0], 
            link: b[2], 
            info: "Author: " + b[1], 
            type: "book" 
        }));

        // Merging both datasets for the Global Search feature
        combinedData = [...formattedNotes, ...formattedBooks];
        console.log("Global Data Preloaded: " + combinedData.length + " items.");
    } catch (e) { 
        console.error("Data preload failed:", e); 
    }
}

/**
 * Real-time Smart Search Function for navigation bar
 */
function homeSmartSearch() {
    const q = document.getElementById('searchBox').value.toLowerCase();
    const box = document.getElementById('searchResultBox');
    
    // Only search if 2 or more characters are typed
    if (q.length < 2) { 
        box.style.display = 'none'; 
        return; 
    }

    // Filtering combined data based on title
    const matches = combinedData.filter(d => d.title.toLowerCase().includes(q));

    if (matches.length > 0) {
        box.style.display = 'block';
        box.innerHTML = matches.map(d => `
            <div class="search-item" onclick="window.open('${d.link}','_blank')">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>${d.title}</h4>
                    <span style="font-size: 10px; background: #38bdf8; color: white; padding: 2px 6px; border-radius: 10px; text-transform: uppercase;">${d.type}</span>
                </div>
                <p style="font-size: 11px; color: #64748b;">${d.info}</p>
            </div>`).join('');
    } else {
        box.innerHTML = `<div style="padding:15px; font-size:12px; color:gray;">No matching files found...</div>`;
        box.style.display = 'block';
    }
}

/**
 * Redirects user to specific pages when search button is clicked
 */
function executeSearch() {
    const query = document.getElementById('searchBox').value.trim();
    if (query) {
        // Simple logic to detect if user is searching for a book or a note
        const isBook = query.toLowerCase().includes("book") || query.toLowerCase().includes("author");
        
        if (isBook) {
            window.location.href = `books.html?search=${encodeURIComponent(query)}`;
        } else {
            window.location.href = `notes.html?search=${encodeURIComponent(query)}`;
        }
    }
}

/**
 * Handles Enter key press event in the search input
 */
function checkEnter(event) {
    if (event.key === "Enter") { 
        executeSearch(); 
    }
}

// Automatically load data when the window is fully loaded
window.onload = preLoadAllData;