// API Base URL
const API_URL = 'http://localhost:5000/api';

// Global Variables
let allProducts = [];
let allOrders = [];
let currentEditProductId = null;
let currentOrderId = null;

// Check Authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'admin') {
    alert('You must be logged in as admin to access this page');
    window.location.href = 'index.html';
}

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('admin-name').textContent = user.name;
    loadDashboardData();
    loadProducts();
    loadOrders();
});

// Show Section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'products': 'Manage Products',
        'orders': 'Manage Orders',
        'users': 'Manage Users'
    };
    document.getElementById('page-title').textContent = titles[section];
    
    // Add active to clicked nav item
    event.target.classList.add('active');
    
    // Load data for section
    if (section === 'products') loadProducts();
    if (section === 'orders') loadOrders();
    if (section === 'users') loadUsers();
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Load products count
        const productsRes = await fetch(`${API_URL}/products`);
        const productsData = await productsRes.json();
        document.getElementById('total-products').textContent = productsData.count || 0;
        
        // Load orders
        const ordersRes = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        
        if (ordersData.success) {
            document.getElementById('total-orders').textContent = ordersData.count || 0;
            
            // Calculate revenue
            const revenue = ordersData.data.reduce((sum, order) => sum + order.totalPrice, 0);
            document.getElementById('total-revenue').textContent = `৳${revenue}`;
            
            // Show recent orders
            displayRecentOrders(ordersData.data.slice(0, 5));
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Display Recent Orders
function displayRecentOrders(orders) {
    const container = document.getElementById('recent-orders-list');
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No orders yet</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-item">
            <div>
                <strong>Order #${order._id.slice(-6)}</strong><br>
                <small>${new Date(order.createdAt).toLocaleDateString()}</small>
            </div>
            <div>
                <span class="status-badge status-${order.orderStatus.toLowerCase()}">
                    ${order.orderStatus}
                </span>
            </div>
            <div>
                <strong>৳${order.totalPrice}</strong>
            </div>
        </div>
    `).join('');
}

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();
        
        if (result.success) {
            allProducts = result.data;
            displayProducts(allProducts);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Display Products
function displayProducts(products) {
    const tbody = document.getElementById('products-tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><div style="font-size: 2rem;">${product.image}</div></td>
            <td>
                <strong>${product.name}</strong><br>
                <small>${product.namebn}</small>
            </td>
            <td>${product.category}</td>
            <td>৳${product.price}</td>
            <td>${product.stock}</td>
            <td>
                <span class="status-badge ${product.isAvailable ? 'status-available' : 'status-unavailable'}">
                    ${product.isAvailable ? 'Available' : 'Unavailable'}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="editProduct('${product._id}')">Edit</button>
                <button class="btn-delete" onclick="deleteProduct('${product._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Show Add Product Modal
function showAddProductModal() {
    currentEditProductId = null;
    document.getElementById('product-modal-title').textContent = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').style.display = 'block';
}

// Close Product Modal
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Edit Product
function editProduct(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    
    currentEditProductId = productId;
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    
    document.getElementById('product-id').value = product._id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-namebn').value = product.namebn;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-available').checked = product.isAvailable;
    
    document.getElementById('product-modal').style.display = 'block';
}

// Handle Product Submit
async function handleProductSubmit(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        namebn: document.getElementById('product-namebn').value,
        description: document.getElementById('product-description').value,
        category: document.getElementById('product-category').value,
        price: Number(document.getElementById('product-price').value),
        stock: Number(document.getElementById('product-stock').value),
        image: document.getElementById('product-image').value,
        isAvailable: document.getElementById('product-available').checked
    };
    
    try {
        let response;
        
        if (currentEditProductId) {
            // Update existing product
            response = await fetch(`${API_URL}/products/${currentEditProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(currentEditProductId ? 'Product updated successfully' : 'Product added successfully', 'success');
            closeProductModal();
            loadProducts();
            loadDashboardData();
        } else {
            showNotification(result.message || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Failed to save product', 'error');
    }
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product deleted successfully', 'success');
            loadProducts();
            loadDashboardData();
        } else {
            showNotification(result.message || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

// Load Orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            allOrders = result.data;
            displayOrders(allOrders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

// Display Orders
function displayOrders(orders) {
    const tbody = document.getElementById('orders-tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order._id.slice(-6)}</td>
            <td>${order.user?.name || 'N/A'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>৳${order.totalPrice}</td>
            <td>
                <span class="status-badge ${order.isPaid ? 'status-delivered' : 'status-pending'}">
                    ${order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
            </td>
            <td>
                <span class="status-badge status-${order.orderStatus.toLowerCase()}">
                    ${order.orderStatus}
                </span>
            </td>
            <td>
                <button class="btn-view" onclick="viewOrder('${order._id}')">View</button>
            </td>
        </tr>
    `).join('');
}

// Filter Orders
function filterOrders() {
    const status = document.getElementById('order-status-filter').value;
    
    if (status === 'all') {
        displayOrders(allOrders);
    } else {
        const filtered = allOrders.filter(order => order.orderStatus === status);
        displayOrders(filtered);
    }
}

// View Order Details
function viewOrder(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (!order) return;
    
    currentOrderId = orderId;
    
    const orderDetails = `
        <p><strong>Order ID:</strong> #${order._id.slice(-6)}</p>
        <p><strong>Customer:</strong> ${order.user?.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.user?.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
        <p><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Payment Status:</strong> ${order.isPaid ? 'Paid' : 'Unpaid'}</p>
        ${order.giftMessage ? `<p><strong>Gift Message:</strong> ${order.giftMessage}</p>` : ''}
        <hr style="margin: 1rem 0;">
        <h3>Order Items:</h3>
        ${order.orderItems.map(item => `
            <p>${item.name} x ${item.quantity} = ৳${item.price * item.quantity}</p>
        `).join('')}
        <hr style="margin: 1rem 0;">
        <p><strong>Items Price:</strong> ৳${order.itemsPrice}</p>
        <p><strong>Shipping:</strong> ৳${order.shippingPrice}</p>
        <p><strong>Total:</strong> ৳${order.totalPrice}</p>
    `;
    
    document.getElementById('order-details').innerHTML = orderDetails;
    document.getElementById('order-status-update').value = order.orderStatus;
    document.getElementById('order-modal').style.display = 'block';
}

// Close Order Modal
function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// Update Order Status
async function updateOrderStatus() {
    const newStatus = document.getElementById('order-status-update').value;
    
    try {
        const response = await fetch(`${API_URL}/orders/${currentOrderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderStatus: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Order status updated successfully', 'success');
            closeOrderModal();
            loadOrders();
            loadDashboardData();
        } else {
            showNotification(result.message || 'Update failed', 'error');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Failed to update order', 'error');
    }
}

// Load Users
async function loadUsers() {
    // This would require a new API endpoint
    // For now, show a message
    document.getElementById('users-tbody').innerHTML = 
        '<tr><td colspan="6" style="text-align: center;">User management feature coming soon</td></tr>';
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}