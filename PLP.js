const API_BASE_URL = 'http://127.0.0.1:8000';

let wishlistItems = [];
let allProducts = [];
let selectedProductForEdit = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Fetch all products from backend
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle both array and object responses
        if (Array.isArray(data)) {
            allProducts = data;
        } else if (data.products && Array.isArray(data.products)) {
            allProducts = data.products;
        } else if (data.data && Array.isArray(data.data)) {
            allProducts = data.data;
        } else {
            throw new Error('Unexpected data format');
        }
        
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        displayErrorMessage('Failed to load products. Please ensure the backend is running at http://127.0.0.1:8000');
    }
}

// Render products to the page
function renderProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    
    if (!productGrid) {
        console.error('Product grid element not found');
        return;
    }
    
    if (!products || products.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products available</p>';
        return;
    }
    
    productGrid.innerHTML = products.map(product => `
        <div class="card" data-product-id="${product.id}">
            <img src="${product.image_url || 'https://via.placeholder.com/220x220?text=No+Image'}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/220x220?text=No+Image'">
            <h3>${product.name}</h3>
            <p class="card-positive">✓ Quality Product</p>
            <div class="price">₹${parseFloat(product.price).toFixed(2)}</div>
            <div class="product-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-small btn-primary" onclick="addToWishlist('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price})" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;">❤️ Wishlist</button>
                <button class="btn btn-small btn-secondary" onclick="viewProductDetails('${product.id}')" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;">View</button>
            </div>
        </div>
    `).join('');
}

// Get product by ID from backend
async function getProductById(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product details');
        return null;
    }
}

// Update product in backend
async function updateProduct(productId, updatedData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        alert('Product updated successfully!');
        loadProducts(); // Reload products after update
        return result;
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product');
        return null;
    }
}

// Delete product from backend
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        alert('Product deleted successfully!');
        loadProducts(); // Reload products after deletion
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
        return null;
    }
}

// View product details with edit and delete options
async function viewProductDetails(productId) {
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) {
        alert('Product not found');
        return;
    }
    
    selectedProductForEdit = product;
    openProductDetailModal(product);
}

// Open product detail modal
function openProductDetailModal(product) {
    const modal = document.getElementById('productDetailModal') || createProductDetailModal();
    
    modal.querySelector('.product-detail-name').textContent = product.name;
    modal.querySelector('.product-detail-price').textContent = `₹${parseFloat(product.price).toFixed(2)}`;
    modal.querySelector('.product-detail-description').textContent = product.description || 'No description available';
    modal.querySelector('.product-detail-image').src = product.image_url || 'https://via.placeholder.com/300x300?text=No+Image';
    modal.querySelector('.product-detail-id').textContent = `ID: ${product.id}`;
    modal.querySelector('.product-detail-stock').textContent = `Stock: ${product.stock || 0}`;
    
    modal.style.display = 'block';
}

// Create product detail modal if it doesn't exist
function createProductDetailModal() {
    if (document.getElementById('productDetailModal')) {
        return document.getElementById('productDetailModal');
    }
    
    const modal = document.createElement('div');
    modal.id = 'productDetailModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Product Details</h2>
                <button class="close-btn" onclick="closeProductDetailModal()">&times;</button>
            </div>
            <div class="product-detail-content" style="padding: 1rem;">
                <img class="product-detail-image" src="" alt="Product" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                <h3 class="product-detail-name" style="font-size: 1.5rem; color: #333; margin-bottom: 0.5rem;"></h3>
                <p class="product-detail-id" style="color: #999; font-size: 0.9rem; margin-bottom: 0.5rem;"></p>
                <p class="product-detail-stock" style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;"></p>
                <div class="product-detail-price" style="font-size: 1.5rem; color: #ae2727; font-weight: 700; margin-bottom: 1rem;"></div>
                <p class="product-detail-description" style="color: #555; line-height: 1.6; margin-bottom: 1.5rem;"></p>
                <div class="product-detail-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="openEditProductModal()" style="flex: 1; min-width: 120px;">✏️ Edit</button>
                    <button class="btn btn-secondary" onclick="deleteProductAction()" style="flex: 1; min-width: 120px;">🗑️ Delete</button>
                    <button class="btn btn-secondary" onclick="closeProductDetailModal()" style="flex: 1; min-width: 120px;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Close product detail modal
function closeProductDetailModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Open edit product modal
function openEditProductModal() {
    if (!selectedProductForEdit) return;
    
    const modal = document.getElementById('editProductModal') || createEditProductModal();
    
    modal.querySelector('#editProductName').value = selectedProductForEdit.name;
    modal.querySelector('#editProductPrice').value = selectedProductForEdit.price;
    modal.querySelector('#editProductDescription').value = selectedProductForEdit.description || '';
    modal.querySelector('#editProductImage').value = selectedProductForEdit.image_url || '';
    modal.querySelector('#editProductStock').value = selectedProductForEdit.stock || 0;
    modal.querySelector('#editProductCategory').value = selectedProductForEdit.category || '';
    
    modal.style.display = 'block';
}

// Create edit product modal if it doesn't exist
function createEditProductModal() {
    if (document.getElementById('editProductModal')) {
        return document.getElementById('editProductModal');
    }
    
    const modal = document.createElement('div');
    modal.id = 'editProductModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Edit Product</h2>
                <button class="close-btn" onclick="closeEditProductModal()">&times;</button>
            </div>
            <div class="edit-product-content" style="padding: 1rem;">
                <form style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Product Name</label>
                        <input type="text" id="editProductName" placeholder="Enter product name" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Price</label>
                        <input type="number" id="editProductPrice" placeholder="Enter price" step="0.01" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Category</label>
                        <input type="text" id="editProductCategory" placeholder="Enter category" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Stock</label>
                        <input type="number" id="editProductStock" placeholder="Enter stock quantity" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Description</label>
                        <textarea id="editProductDescription" placeholder="Enter product description" rows="3" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-family: inherit;"></textarea>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Image URL</label>
                        <input type="text" id="editProductImage" placeholder="Enter image URL" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div class="form-actions" style="display: flex; gap: 0.5rem;">
                        <button type="button" class="btn btn-primary" onclick="saveProductChanges()" style="flex: 1;">Save Changes</button>
                        <button type="button" class="btn btn-secondary" onclick="closeEditProductModal()" style="flex: 1;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Close edit product modal
function closeEditProductModal() {
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save product changes
async function saveProductChanges() {
    if (!selectedProductForEdit) return;
    
    const updatedData = {
        name: document.querySelector('#editProductName').value,
        price: parseFloat(document.querySelector('#editProductPrice').value),
        description: document.querySelector('#editProductDescription').value,
        image_url: document.querySelector('#editProductImage').value,
        category: document.querySelector('#editProductCategory').value,
        stock: parseInt(document.querySelector('#editProductStock').value)
    };
    
    if (!updatedData.name || !updatedData.price) {
        alert('Please fill in all required fields (Name and Price)');
        return;
    }
    
    await updateProduct(selectedProductForEdit.id, updatedData);
    closeEditProductModal();
    closeProductDetailModal();
}

// Delete product action
async function deleteProductAction() {
    if (!selectedProductForEdit) return;
    await deleteProduct(selectedProductForEdit.id);
    closeProductDetailModal();
}

// Login Modal Functions
function openLoginModal() {
    alert('Login functionality coming soon!');
}

// Wishlist Functions
function openWishlist() {
    const modal = document.getElementById('wishlistModal');
    if (modal) {
        modal.style.display = 'block';
        updateWishlistDisplay();
    }
}

function closeWishlist() {
    const modal = document.getElementById('wishlistModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function addToWishlist(productId, productName, price) {
    // Check if already in wishlist
    const exists = wishlistItems.some(item => item.id == productId);
    
    if (exists) {
        alert(productName + ' is already in your wishlist! ❤️');
        return;
    }
    
    wishlistItems.push({ 
        id: productId, 
        name: productName, 
        price: price 
    });
    
    updateWishlistDisplay();
    alert(productName + ' added to wishlist! ❤️');
}

function removeFromWishlist(productId) {
    wishlistItems = wishlistItems.filter(item => item.id != productId);
    updateWishlistDisplay();
}

function updateWishlistDisplay() {
    const wishlistContent = document.getElementById('wishlistContent');
    
    if (!wishlistContent) return;
    
    if (wishlistItems.length === 0) {
        wishlistContent.innerHTML = `
            <div class="wishlist-empty">
                <p>❤️ Your wishlist is empty</p>
                <p style="font-size: 0.9rem; color: #999;">Start adding your favorite products!</p>
            </div>
        `;
    } else {
        let html = '';
        wishlistItems.forEach((item) => {
            html += `
                <div class="wishlist-item">
                    <div>
                        <div class="wishlist-item-name">${item.name}</div>
                        <div class="wishlist-item-price">₹${parseFloat(item.price).toFixed(2)}</div>
                    </div>
                    <button class="remove-wishlist" onclick="removeFromWishlist('${item.id}')">✕</button>
                </div>
            `;
        });
        wishlistContent.innerHTML = html;
    }
}

// Navigation Functions
function openSearch() {
    alert('Profile functionality coming soon!');
}

function openCart() {
    alert('Cart is empty');
}

// Display error message
function displayErrorMessage(message) {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ae2727;">${message}</p>`;
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const wishlistModal = document.getElementById('wishlistModal');
    const productDetailModal = document.getElementById('productDetailModal');
    const editProductModal = document.getElementById('editProductModal');
    
    if (wishlistModal && event.target === wishlistModal) {
        closeWishlist();
    }
    if (productDetailModal && event.target === productDetailModal) {
        closeProductDetailModal();
    }
    if (editProductModal && event.target === editProductModal) {
        closeEditProductModal();
    }
}
