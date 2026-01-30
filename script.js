const API_URL = 'https://api.escuelajs.co/api/v1/products';

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 10;

// Filters and Sort State
let searchQuery = '';
let sortField = ''; // 'price' or 'title'
let sortDirection = ''; // 'asc' or 'desc'

document.addEventListener('DOMContentLoaded', () => {
    // Initialize controls
    const searchInput = document.getElementById('searchInput');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    searchInput.addEventListener('input', handleSearch);
    itemsPerPageSelect.addEventListener('change', handleItemsPerPageChange);
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));

    // Initial Fetch
    getAll();
});

async function getAll() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        allProducts = await response.json();
        
        // Initial setup
        applyFiltersAndSort(); 
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Failed to load products. See console for details.');
    } finally {
        loading.style.display = 'none';
    }
}

function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase();
    currentPage = 1; // Reset to first page on search
    applyFiltersAndSort();
}

function handleSort(field, direction) {
    sortField = field;
    sortDirection = direction;
    applyFiltersAndSort();
}

function handleItemsPerPageChange(event) {
    itemsPerPage = parseInt(event.target.value);
    currentPage = 1; // Reset to first page
    renderTable();
    updatePaginationControls();
}

function applyFiltersAndSort() {
    // 1. Filter
    filteredProducts = allProducts.filter(product => {
        return product.title.toLowerCase().includes(searchQuery);
    });

    // 2. Sort
    if (sortField) {
        filteredProducts.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            // Handle string comparison for titles
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    renderTable();
    updatePaginationControls();
}

function renderTable() {
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    if (productsToShow.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align:center;">No products found</td>';
        tableBody.appendChild(row);
        return;
    }

    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        
        // Handle image extraction (API returns array of strings)
        let imageUrl = 'https://via.placeholder.com/100';
        if (product.images && product.images.length > 0) {
            // Clean up image URL if needed (sometimes API calls have extra chars)
            let rawUrl = product.images[0];
            // Remove brackets and quotes if api returns stringified array in string
            rawUrl = rawUrl.replace(/[\[\]"]/g, '');
             // Basic validation to ensure it looks like a url
            if (rawUrl.startsWith('http')) {
                imageUrl = rawUrl;
            }
        }

        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <img src="${imageUrl}" alt="${product.title}" class="product-image" onerror="this.src='https://via.placeholder.com/100?text=No+Image'">
            </td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
            <td>${product.category ? product.category.name : 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function changePage(delta) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const newPage = currentPage + delta;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
        updatePaginationControls();
    }
}

function updatePaginationControls() {
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}
