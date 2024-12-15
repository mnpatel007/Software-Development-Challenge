// Add Book form submission
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Convert FormData to an object

    try {
        const response = await fetch('/api/User', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Book added successfully!');
            form.reset(); // Clear the form
            loadEntries(); // Refresh the book list
        } else {
            const error = await response.json();
            alert(`Failed to add book: ${error.error}`);
        }
    } catch (error) {
        console.error('Error adding book:', error);
        alert('An unexpected error occurred. Please try again.');
    }
});

// Fetch and display entries
document.getElementById('entries-btn').addEventListener('click', loadEntries);

async function loadEntries() {
    try {
        const response = await fetch('/api/entries');
        if (!response.ok) throw new Error('Failed to fetch entries');
        const entries = await response.json();

        const entriesDiv = document.getElementById('entries-result');
        entriesDiv.innerHTML = ''; // Clear previous results

        if (entries.length === 0) {
            entriesDiv.innerText = 'No entries found.';
            return;
        }

        // Create a table to display entries
        const table = document.createElement('table');
        table.classList.add('entries-table'); // Add a class for styling

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Publication Date</th>
            <th>ISBN</th>
        `;
        table.appendChild(headerRow);

        function formatDate(isoDate) {
            const date = new Date(isoDate);
            return date.toISOString().split('T')[0]; // Extract only the date part
        }

        entries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.title}</td>
                <td>${entry.author}</td>
                <td>${entry.genre}</td>
                <td>${formatDate(entry.publication_date)}</td>
                <td>${entry.isbn}</td>
            `;
            table.appendChild(row);
        });

        entriesDiv.appendChild(table);
        const totalEntries = document.createElement('p');
        totalEntries.textContent = `Total number of entries are: ${entries.length}`;
        entriesDiv.appendChild(totalEntries);
    } catch (error) {
        console.error('Error fetching entries:', error);
        alert('Failed to load entries. Please try again.');
    }
}

// Function to fetch all entries
async function fetchEntries() {
    const response = await fetch('/api/entries');
    if (!response.ok) throw new Error('Failed to fetch entries');
    return await response.json();
}

// Function to download a file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href); // Cleanup
}

// Export as JSON
document.getElementById('export-json').addEventListener('click', async () => {
    try {
        const entries = await fetchEntries();
        const jsonContent = JSON.stringify(entries, null, 2); // Pretty-print JSON
        downloadFile(jsonContent, 'entries.json', 'application/json');
    } catch (error) {
        console.error('Error exporting JSON:', error);
        alert('Failed to export JSON. Please try again.');
    }
});

// Export as CSV
document.getElementById('export-csv').addEventListener('click', async () => {
    try {
        const entries = await fetchEntries();

        // Generate CSV content
        const headers = ['Title', 'Author', 'Genre', 'Publication Date', 'ISBN'];
        const rows = entries.map(entry =>
            [
                entry.title,
                entry.author,
                entry.genre,
                entry.publication_date.split('T')[0], // Format the date
                entry.isbn
            ].join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');
        downloadFile(csvContent, 'entries.csv', 'text/csv');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Failed to export CSV. Please try again.');
    }
});

// Handle Find a Book functionality
document.getElementById('find-book-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload

    const criteria = document.getElementById('search-criteria').value;
    const query = document.getElementById('search-query').value.trim();

    if (!query) {
        alert('Please enter a valid query.');
        return;
    }

    try {
        // Fetch all entries
        const response = await fetch('/api/entries');
        const entries = await response.json();

        // Filter entries based on selected criteria
        const filteredEntries = entries.filter(entry =>
            entry[criteria].toLowerCase().includes(query.toLowerCase())
        );

        const resultDiv = document.getElementById('find-result');
        resultDiv.innerHTML = ''; // Clear previous results

        if (filteredEntries.length === 0) {
            resultDiv.innerHTML = `<p>No books found matching your ${criteria}: "${query}".</p>`;
            return;
        }

        // Display results in a table
        const table = document.createElement('table');
        table.classList.add('entries-table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Title</th><th>Author</th><th>Genre</th><th>Publication Date</th><th>ISBN</th>';
        table.appendChild(headerRow);

        filteredEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.title}</td>
                <td>${entry.author}</td>
                <td>${entry.genre}</td>
                <td>${entry.publication_date.split('T')[0]}</td>
                <td>${entry.isbn}</td>
            `;
            table.appendChild(row);
        });

        resultDiv.appendChild(table);
    } catch (error) {
        console.error('Error finding book:', error);
        alert('An error occurred while searching for the book. Please try again.');
    }
});