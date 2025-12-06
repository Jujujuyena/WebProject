// API Base URL
const API_URL = 'http://localhost:5000/api';

// Global Variables
let cart = [];
let products = [];
let currentUser = null;
let currentProductId = null;

// Check if user is logged in
const token = localStorage.getItem('token');
if (token) {
    currentUser = JSON.parse(localStorage.getItem('user'));
    updateAuthUI();
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();

    updateCartCount();
    
});

// Toggle Mobile Menu
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    
    if (navMenu && hamburger && !navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
        closeMenu();
    }
});

// Load Products from API
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();
        
        if (result.success) {
            products = result.data;
            displayProducts(products);
            loadFloweringPlants(); // ✅ Products load howar por call koro
            loadOrnaments();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Display Products Function
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No products found</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = `
            <div class="product-card" data-id="${product._id}" onclick="showProductDetail('${product._id}')">
                <div class="product-image">
                    <img src="http://localhost:5000${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3>${product.name}</h3>
                    <p>${product.namebn}</p>
                    <div class="rating-display">
                        <span class="stars" style="font-size: 1rem;">
                            ${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}
                        </span>
                        <span style="font-size: 0.9rem; color: #666;">(${product.numReviews || 0})</span>
                    </div>
                    <div class="product-price">৳${product.price}</div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product._id}')">
                        🛒 Add to Cart
                    </button>
                </div>
            </div>
        `;
        productsGrid.innerHTML += productCard;
    });
}

// Search Products
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchValue = searchInput.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchValue) ||
        product.namebn.includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue)
    );
    displayProducts(filteredProducts);
}

// Filter by Category
function filterCategory(category) {
    const filteredProducts = products.filter(product => 
        product.category === category
    );
    displayProducts(filteredProducts);
    
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Filter by Price
function filterByPrice() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;
    
    const filterValue = priceFilter.value;
    let filteredProducts = products;
    
    if (filterValue === 'low') {
        filteredProducts = products.filter(p => p.price < 500);
    } else if (filterValue === 'medium') {
        filteredProducts = products.filter(p => p.price >= 500 && p.price <= 1000);
    } else if (filterValue === 'high') {
        filteredProducts = products.filter(p => p.price > 1000);
    }
    
    displayProducts(filteredProducts);
}

// Add to Cart (for Flowers)
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    
    if (!product) return;
    
    // Get existing cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item._id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            _id: product._id,
            name: product.name,
            nameBn: product.namebn,
            price: product.price,
            image: product.image,
            quantity: 1,
            type: 'flower'
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart! পণ্য কার্টে যোগ করা হয়েছে!', 'success');
}

// Update Cart Count
function updateCartCount() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Show Cart Modal
function showCart() {
  const modal = document.getElementById('cart-modal');
  const cartItems = document.getElementById('cart-items');
  if (!modal || !cartItems) return;

  cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; padding: 2rem;">Your cart is empty! আপনার কার্ট খালি!</p>';
    const totalPrice = document.getElementById('total-price');
    if (totalPrice) totalPrice.textContent = '0';

    // subtotal & shipping reset
    const itemsTotalEl = document.getElementById('items-total');
    const shippingEl = document.getElementById('shipping-fee');
    if (itemsTotalEl) itemsTotalEl.textContent = '0';
    if (shippingEl) shippingEl.textContent = '50';
  } else {
    cartItems.innerHTML = '';
    let itemsTotal = 0;

    cart.forEach(item => {
      itemsTotal += item.price * item.quantity;

      const cartItem = `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>Quantity: ${item.quantity}</p>
            <p class="cart-item-price">৳${item.price} x ${item.quantity} = ৳${item.price * item.quantity}</p>
          </div>
          <button class="remove-item" onclick="removeFromCart('${item._id || item.id}')">Remove</button>
        </div>
      `;
      cartItems.innerHTML += cartItem;
    });

    const shipping = 50;
    const grandTotal = itemsTotal + shipping;

    const itemsTotalEl = document.getElementById('items-total');
    const shippingEl = document.getElementById('shipping-fee');
    if (itemsTotalEl) itemsTotalEl.textContent = itemsTotal;
    if (shippingEl) shippingEl.textContent = shipping;

    const totalPrice = document.getElementById('total-price');
    if (totalPrice) totalPrice.textContent = grandTotal;
  }

  modal.style.display = 'block';
}


function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
}

// Remove from Cart
function removeFromCart(itemId) {
    cart = cart.filter(item => (item._id || item.id) !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showCart();
}

// Proceed to Checkout
async function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty! আপনার কার্ট খালি!');
        return;
    }
    
    if (!currentUser) {
        closeCart();
        showLogin();
        showNotification('Please login to checkout', 'error');
        return;
    }
    
    await createSimpleOrder();
}

// Create Simple Order (Cash on Delivery)
async function createSimpleOrder() {
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
        showNotification('Please login first', 'error');
        showLogin();
        return;
    }
    
    try {
        const orderData = {
            orderItems: cart.map(item => ({
                product: item._id || item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            })),
            shippingAddress: {
                name: currentUser.name,
                phone: currentUser.phone,
                address: 'Sylhet, Bangladesh',
                city: 'Sylhet',
                district: 'Sylhet',
                postalCode: '3114'
            },
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            giftMessage: '',
            paymentMethod: 'Cash on Delivery',
            itemsPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shippingPrice: 50,
            taxPrice: 0,
            totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50
        };
        
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Order placed successfully! অর্ডার সফল হয়েছে!', 'success');
            
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            closeCart();
            
            alert(`✅ Order placed successfully!\n\nOrder ID: #${result.data._id.slice(-6)}\nPayment: Cash on Delivery\n\nThank you for your order!`);
        } else {
            showNotification(result.message || 'Order failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to create order', 'error');
    }
}

// Login Modal Functions
function showLogin() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'block';
    closeSignup();
}

function closeLogin() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = event.target[0].value;
    const password = event.target[1].value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data;
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data));
            
            showNotification('Login successful! লগইন সফল হয়েছে!', 'success');
            closeLogin();
            updateAuthUI();
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Signup Modal Functions
function showSignup() {
    const modal = document.getElementById('signup-modal');
    if (modal) modal.style.display = 'block';
    closeLogin();
}

function closeSignup() {
    const modal = document.getElementById('signup-modal');
    if (modal) modal.style.display = 'none';
}

async function handleSignup(event) {
    event.preventDefault();
    
    const name = event.target[0].value;
    const email = event.target[1].value;
    const phone = event.target[2].value;
    const password = event.target[3].value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data;
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data));
            
            showNotification('Registration successful! রেজিস্ট্রেশন সফল হয়েছে!', 'success');
            closeSignup();
            updateAuthUI();
        } else {
            showNotification(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// Update Auth UI
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    
    if (authButtons && currentUser) {
        authButtons.innerHTML = `
            <span style="color: white; margin-right: 1rem;">Welcome, ${currentUser.name}!</span>
            <button class="btn-login" onclick="logout()">Logout</button>
        `;
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    const authButtons = document.getElementById('authButtons');
    if (authButtons) {
        authButtons.innerHTML = `
            <button class="btn-login" onclick="showLogin()">Login</button>
            <button class="btn-signup" onclick="showSignup()">Sign Up</button>
        `;
    }
    
    showNotification('Logged out successfully!', 'success');
}

// Product Detail Modal Functions
async function showProductDetail(productId) {
    currentProductId = productId;
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    document.getElementById('detail-image').innerHTML = `
        <img src="http://localhost:5000${product.image}" alt="${product.name}">
    `;

    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-namebn').textContent = product.namebn;
    document.getElementById('detail-description').textContent = product.description || 'No description available.';
    document.getElementById('detail-price').textContent = `৳${product.price}`;
    document.getElementById('detail-category').textContent = product.category;
    document.getElementById('detail-stock').textContent = product.stock;
    
    const stars = '★'.repeat(Math.round(product.rating || 0)) + '☆'.repeat(5 - Math.round(product.rating || 0));
    document.getElementById('detail-stars').textContent = stars;
    document.getElementById('detail-rating-text').textContent = `${product.rating || 0} (${product.numReviews || 0} reviews)`;
    
    document.getElementById('detail-add-cart').onclick = () => {
        addToCart(productId);
        closeProductDetail();
    };
    
    displayReviews(product.reviews || []);
    
    const reviewForm = document.getElementById('add-review-form');
    if (reviewForm) {
        reviewForm.style.display = currentUser ? 'block' : 'none';
    }
    
    document.getElementById('product-detail-modal').style.display = 'block';
}

function closeProductDetail() {
    document.getElementById('product-detail-modal').style.display = 'none';
}

// Display Reviews
function displayReviews(reviews) {
    const container = document.getElementById('reviews-list');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div>
                    <div class="review-author">${review.name}</div>
                    <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                </div>
                <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="review-comment">${review.comment}</div>
        </div>
    `).join('');
}

// Star Rating Interaction
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('star')) {
        const rating = e.target.dataset.rating;
        const ratingInput = document.getElementById('review-rating');
        if (ratingInput) ratingInput.value = rating;
        
        document.querySelectorAll('.star').forEach(star => {
            if (star.dataset.rating <= rating) {
                star.classList.add('active');
                star.textContent = '★';
            } else {
                star.classList.remove('active');
                star.textContent = '☆';
            }
        });
    }
});

// Submit Review
async function submitReview(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login to submit a review', 'error');
        return;
    }
    
    const authToken = localStorage.getItem('token');
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;
    
    if (!rating) {
        showNotification('Please select a rating', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${currentProductId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ rating, comment })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Review submitted successfully!', 'success');
            document.getElementById('review-rating').value = '';
            document.getElementById('review-comment').value = '';
            document.querySelectorAll('.star').forEach(star => {
                star.classList.remove('active');
                star.textContent = '☆';
            });
            closeProductDetail();
            loadProducts();
        } else {
            showNotification(result.message || 'Failed to submit review', 'error');
        }
    } catch (error) {
        console.error('Review submission error:', error);
        showNotification('Failed to submit review', 'error');
    }
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
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

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const cartModal = document.getElementById('cart-modal');
    const productModal = document.getElementById('product-detail-modal');
    
    if (event.target === loginModal) closeLogin();
    if (event.target === signupModal) closeSignup();
    if (event.target === cartModal) closeCart();
    if (event.target === productModal) closeProductDetail();
}

// ==================== CHAT FUNCTIONS ====================

// Open Chat
function openChatBox() {
    document.getElementById("chat-popup").style.display = "flex";
}

// Close Chat
function closeChatBox() {
    document.getElementById("chat-popup").style.display = "none";
}

// Send message
function sendMessage(e) {
    if (e.key === "Enter") sendManual();
}

function sendManual() {
    const input = document.getElementById("chat-input");
    const body = document.getElementById("chat-body");

    if (input.value.trim() === "") return;

    // User Message
    let userMsg = document.createElement("p");
    userMsg.className = "user-msg";
    userMsg.textContent = input.value;
    body.appendChild(userMsg);

    // Admin receive (Backend API Example)
    fetch("http://localhost:5000/api/chat-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: input.value,
            time: new Date()
        })
    });

    // Bot Auto Reply
    setTimeout(() => {
        let bot = document.createElement("p");
        bot.className = "bot-msg";
        bot.textContent = "Thanks! We will reply shortly 😊";
        body.appendChild(bot);
        body.scrollTop = body.scrollHeight;
    }, 600);

    input.value = "";
    body.scrollTop = body.scrollHeight;
}








function loadFloweringPlants() {
    const grid = document.getElementById('flowering-plants-grid');
    if (!grid) return;

    // Filter flowering plants
    const flowering = products.filter(p => 
        p.category === 'flowering-plant' || 
        p.category === 'Flowering Plant'
    );

    grid.innerHTML = '';

    if (flowering.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding:2rem;">No flowering plants available</p>';
        return;
    }

    flowering.forEach(product => {
        const card = `
            <div class="product-card" onclick="showProductDetail('${product._id}')">
                <div class="product-image">
                    <img src="http://localhost:5000${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3>${product.name}</h3>
                    <p>${product.namebn}</p>
                    <div class="rating-display">
                        <span class="stars">
                            ${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}
                        </span>
                        <span>(${product.numReviews || 0})</span>
                    </div>
                    <div class="product-price">৳${product.price}</div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product._id}')">
                        🛒 Add to Cart
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}




function loadOrnaments() {
  const grid = document.getElementById('ornaments-grid');
  if (!grid) return;

  const ornaments = products.filter(p => p.category === 'ornament');

  grid.innerHTML = '';
  ornaments.forEach(product => {
    const card = document.createElement('div');
    card.className = 'ornament-card';

    card.innerHTML = `
      <div class="product-image"
           style="background-image:url('http://localhost:5000${product.image}')"></div>
      <p>${product.name}</p>
      <span class="ornament-caption-bn">${product.namebn}</span>
      <div class="product-price">৳${product.price}</div>
      <button class="btn-primary"
              onclick="addToCart(${product._id || product.id}); event.stopPropagation();">
        🛒 Add to Cart
      </button>
    `;

    card.addEventListener('click', () => {
      showProductDetail(product._id || product.id);
    });

    grid.appendChild(card);
  });
}
