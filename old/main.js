// // ------------------------------
// // Global Variables
// // ------------------------------
// const cart = JSON.parse(localStorage.getItem('cart')) || [];
// let currentSlide = 0;
// let testimonialSlide = 0;

// // ------------------------------
// // DOM Elements
// // ------------------------------
// document.addEventListener('DOMContentLoaded', function() {
//     // Navigation elements
//     const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
//     const navLinks = document.querySelector('.nav-links');
    
//     // Cart elements
//     const cartToggle = document.querySelector('.cart-action');
//     const cartSidebar = document.querySelector('.cart-sidebar');
//     const cartOverlay = document.querySelector('.cart-overlay');
//     const closeCart = document.querySelector('.close-cart');
//     const cartItemsContainer = document.getElementById('cart-items');
//     const cartCount = document.getElementById('cart-count');
//     const cartTotalAmount = document.getElementById('cart-total-amount');
    
//     // Payment modals
//     const mpesaModal = document.getElementById('mpesa-modal');
//     const cardModal = document.getElementById('card-modal');
//     const checkoutMpesa = document.getElementById('checkout-mpesa');
//     const checkoutCard = document.getElementById('checkout-card');
//     const closeMpesaModal = mpesaModal?.querySelector('.close-modal');
//     const closeCardModal = cardModal?.querySelector('.close-modal');
//     const mpesaAmount = document.getElementById('mpesa-amount');
//     const cardAmount = document.getElementById('card-amount');
//     const mpesaForm = document.getElementById('mpesa-form');
//     const cardForm = document.getElementById('card-form');
    
//     // Notification
//     const notification = document.getElementById('notification');
//     const notificationMessage = document.getElementById('notification-message');
    
//     // Carousel
//     const carouselItems = document.querySelectorAll('.carousel-item');
//     const carouselPrev = document.querySelector('.carousel-prev');
//     const carouselNext = document.querySelector('.carousel-next');
    
//     // Testimonials
//     const testimonialSlides = document.querySelectorAll('.testimonial-slide');
//     const testimonialDots = document.querySelectorAll('.dot');
//     const testimonialPrev = document.querySelector('.testimonial-prev');
//     const testimonialNext = document.querySelector('.testimonial-next');
    
//     // Add to cart buttons
//     const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
//     // Back to top button
//     const backToTopBtn = document.getElementById('back-to-top');
    
//     // Animation elements
//     const fadeInElements = document.querySelectorAll('.fade-in');
//     const animatedElements = document.querySelectorAll('[data-aos]');
    
//     // Blog category tabs (only on blog page)
//     const categoryTabs = document.querySelectorAll('.category-tab');
//     const blogCards = document.querySelectorAll('.blog-card');
    
//     // ------------------------------
//     // Event Listeners
//     // ------------------------------
    
//     // Mobile menu toggle
//     if (mobileMenuToggle) {
//         mobileMenuToggle.addEventListener('click', toggleMobileMenu);
//     }
    
//     // Cart toggle
//     if (cartToggle) {
//         cartToggle.addEventListener('click', toggleCart);
//     }
    
//     // Close cart
//     if (closeCart) {
//         closeCart.addEventListener('click', closeCartPanel);
//     }
    
//     // Cart overlay click to close
//     if (cartOverlay) {
//         cartOverlay.addEventListener('click', closeCartPanel);
//     }
    
//     // MPesa checkout
//     if (checkoutMpesa) {
//         checkoutMpesa.addEventListener('click', openMpesaModal);
//     }
    
//     // Card checkout
//     if (checkoutCard) {
//         checkoutCard.addEventListener('click', openCardModal);
//     }
    
//     // Close MPesa modal
//     if (closeMpesaModal) {
//         closeMpesaModal.addEventListener('click', () => closeModal(mpesaModal));
//     }
    
//     // Close Card modal
//     if (closeCardModal) {
//         closeCardModal.addEventListener('click', () => closeModal(cardModal));
//     }
    
//     // MPesa form submission
//     if (mpesaForm) {
//         mpesaForm.addEventListener('submit', handleMpesaPayment);
//     }
    
//     // Card form submission
//     if (cardForm) {
//         cardForm.addEventListener('submit', handleCardPayment);
//     }
    
//     // Add to cart buttons
//     addToCartButtons.forEach(button => {
//         button.addEventListener('click', addToCart);
//     });
    
//     // Carousel navigation
//     if (carouselPrev && carouselNext) {
//         carouselPrev.addEventListener('click', prevSlide);
//         carouselNext.addEventListener('click', nextSlide);
//     }
    
//     // Testimonial navigation
//     if (testimonialPrev && testimonialNext) {
//         testimonialPrev.addEventListener('click', prevTestimonial);
//         testimonialNext.addEventListener('click', nextTestimonial);
        
//         testimonialDots.forEach((dot, index) => {
//             dot.addEventListener('click', () => goToTestimonial(index));
//         });
//     }
    
//     // Window scroll event for animations and back to top button
//     window.addEventListener('scroll', handleScroll);
    
//     // Back to top button
//     if (backToTopBtn) {
//         backToTopBtn.addEventListener('click', scrollToTop);
//     }
    
//     // Blog category filtering
//     if (categoryTabs.length > 0) {
//         categoryTabs.forEach(tab => {
//             tab.addEventListener('click', filterBlogPosts);
//         });
//     }
    
//     // ------------------------------
//     // Initialize the page
//     // ------------------------------
//     initPage();
    
//     // ------------------------------
//     // Functions
//     // ------------------------------
    
//     /**
//      * Initialize the page
//      */
//     function initPage() {
//         updateCartCount();
//         updateCartItems();
//         activateAnimations();
//         startCarousel();
        
//         // Show the first testimonial slide
//         if (testimonialSlides.length > 0) {
//             showTestimonial(0);
//         }
//     }
    
//     /**
//      * Toggle mobile menu
//      */
//     function toggleMobileMenu() {
//         navLinks.classList.toggle('active');
//         document.body.classList.toggle('menu-open');
//         mobileMenuToggle.classList.toggle('active');
        
//         // Toggle icon
//         const icon = mobileMenuToggle.querySelector('i');
//         if (icon.classList.contains('fa-bars')) {
//             icon.classList.remove('fa-bars');
//             icon.classList.add('fa-times');
//         } else {
//             icon.classList.remove('fa-times');
//             icon.classList.add('fa-bars');
//         }
//     }
    
//     /**
//      * Toggle cart sidebar
//      */
//     function toggleCart() {
//         cartSidebar.classList.toggle('active');
//         cartOverlay.classList.toggle('active');
//         document.body.classList.toggle('menu-open');
//     }
    
//     /**
//      * Close cart panel
//      */
//     function closeCartPanel() {
//         cartSidebar.classList.remove('active');
//         cartOverlay.classList.remove('active');
//         document.body.classList.remove('menu-open');
//     }
    
//     /**
//      * Add item to cart
//      */
//     function addToCart(event) {
//         const button = event.currentTarget;
//         const id = button.dataset.id;
//         const name = button.dataset.name;
//         const price = Number(button.dataset.price);
        
//         // Check if item is already in cart
//         const existingItemIndex = cart.findIndex(item => item.id === id);
        
//         if (existingItemIndex !== -1) {
//             // Item exists, increase quantity
//             cart[existingItemIndex].quantity += 1;
//         } else {
//             // Add new item
//             cart.push({
//                 id,
//                 name,
//                 price,
//                 quantity: 1,
//                 image: `https://via.placeholder.com/60x60?text=${name.replace(/\\s+/g, '+')}`
//             });
//         }
        
//         // Save cart to localStorage
//         saveCart();
        
//         // Update cart UI
//         updateCartCount();
//         updateCartItems();
        
//         // Show notification
//         showNotification(`${name} added to cart`);
        
//         // Open cart
//         toggleCart();
//     }
    
//     /**
//      * Update cart item quantity
//      */
//     function updateQuantity(id, change) {
//         const itemIndex = cart.findIndex(item => item.id === id);
        
//         if (itemIndex !== -1) {
//             // Update quantity
//             cart[itemIndex].quantity = Math.max(1, cart[itemIndex].quantity + change);
            
//             // Save cart
//             saveCart();
            
//             // Update UI
//             updateCartItems();
//             updateCartCount();
//         }
//     }
    
//     /**
//      * Remove item from cart
//      */
//     function removeFromCart(id) {
//         const itemIndex = cart.findIndex(item => item.id === id);
        
//         if (itemIndex !== -1) {
//             // Get the item name for notification
//             const itemName = cart[itemIndex].name;
            
//             // Remove item
//             cart.splice(itemIndex, 1);
            
//             // Save cart
//             saveCart();
            
//             // Update UI
//             updateCartItems();
//             updateCartCount();
            
//             // Show notification
//             showNotification(`${itemName} removed from cart`);
//         }
//     }
    
//     /**
//      * Save cart to localStorage
//      */
//     function saveCart() {
//         localStorage.setItem('cart', JSON.stringify(cart));
//     }
    

//     /**
//      * Update cart count badge
//      */
//     function updateCartCount() {
//         if (!cartCount) return;
        
//         const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
//         cartCount.textContent = totalItems;
        
//         if (totalItems > 0) {
//             cartCount.style.display = 'flex';
//         } else {
//             cartCount.style.display = 'none';
//         }
//     }
    
//     /**
//      * Update cart items DOM
//      */
//     function updateCartItems() {
//         if (!cartItemsContainer || !cartTotalAmount) return;
        
//         if (cart.length === 0) {
//             // Cart is empty
//             cartItemsContainer.innerHTML = `
//                 <div class="cart-empty">
//                     <i class="fas fa-shopping-basket"></i>
//                     <p>Your cart is empty</p>
//                     <a href="#coffee-shop" class="btn primary" onclick="closeCartPanel()">Shop Now</a>
//                 </div>
//             `;
//             cartTotalAmount.textContent = 'KSh 0';
            
//             // Update modal amounts if they exist
//             if (mpesaAmount) mpesaAmount.textContent = 'KSh 0';
//             if (cardAmount) cardAmount.textContent = 'KSh 0';
            
//             return;
//         }
        
//         // Cart has items
//         let cartHTML = '';
        
//         cart.forEach(item => {
//             cartHTML += `
//                 <div class="cart-item">
//                     <div class="cart-item-image">
//                         <img src="${item.image}" alt="${item.name}">
//                     </div>
//                     <div class="cart-item-details">
//                         <div class="cart-item-title">${item.name}</div>
//                         <div class="cart-item-price">KSh ${item.price} x ${item.quantity}</div>
//                         <div class="cart-item-controls">
//                             <div class="quantity-control">
//                                 <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
//                                 <span class="quantity-value">${item.quantity}</span>
//                                 <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
//                             </div>
//                             <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
//                         </div>
//                     </div>
//                 </div>
//             `;
//         });
        
//         // Calculate total
//         const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
//         const formattedTotal = `KSh ${total.toLocaleString()}`;
        
//         // Update DOM
//         cartItemsContainer.innerHTML = cartHTML;
//         cartTotalAmount.textContent = formattedTotal;
        
//         // Update modal amounts if they exist
//         if (mpesaAmount) mpesaAmount.textContent = formattedTotal;
//         if (cardAmount) cardAmount.textContent = formattedTotal;
//     }
    
//     /**
//      * Open MPesa payment modal
//      */
//     function openMpesaModal() {
//         if (!mpesaModal || cart.length === 0) return;
        
//         mpesaModal.classList.add('active');
//     }
    
//     /**
//      * Open Card payment modal
//      */
//     function openCardModal() {
//         if (!cardModal || cart.length === 0) return;
        
//         cardModal.classList.add('active');
//     }
    
//     /**
//      * Close modal
//      */
//     function closeModal(modal) {
//         if (!modal) return;
        
//         modal.classList.remove('active');
//     }
    
//     /**
//      * Handle MPesa payment submission
//      */
//     function handleMpesaPayment(event) {
//         event.preventDefault();
        
//         const phoneNumber = document.getElementById('phone-number').value;
        
//         if (!phoneNumber || phoneNumber.length < 10) {
//             showNotification('Please enter a valid phone number', 'error');
//             return;
//         }
        
//         // In a real implementation, this would make an API call to MPesa
//         // Simulating a successful payment for demo purposes
//         setTimeout(() => {
//             closeModal(mpesaModal);
//             closeCartPanel();
//             clearCart();
//             showNotification('Payment successful! Check your phone for confirmation.');
//         }, 1500);
//     }
    
//     /**
//      * Handle Card payment submission
//      */
//     function handleCardPayment(event) {
//         event.preventDefault();
        
//         const cardNumber = document.getElementById('card-number').value;
//         const expiryDate = document.getElementById('expiry-date').value;
//         const cvv = document.getElementById('cvv').value;
//         const cardName = document.getElementById('card-name').value;
        
//         if (!cardNumber || !expiryDate || !cvv || !cardName) {
//             showNotification('Please fill all payment details', 'error');
//             return;
//         }
        
//         // Disable the submit button to prevent multiple submissions
//         const submitButton = document.getElementById('stripe-submit');
//         const buttonText = document.getElementById('button-text');
//         const spinner = document.getElementById('spinner');
        
//         submitButton.disabled = true;
//         buttonText.classList.add('hidden');
//         spinner.classList.remove('hidden');
        
//         // In a real implementation, this would make an API call to payment processor
//         // Simulating a server request with timeout
//         setTimeout(() => {
//             // Simulate success (in a real app, check for valid response)
//             closeModal(cardModal);
//             closeCartPanel();
//             clearCart();
//             showNotification('Payment successful! Your order is confirmed.');
            
//             // Re-enable the submit button
//             submitButton.disabled = false;
//             buttonText.classList.remove('hidden');
//             spinner.classList.add('hidden');
//         }, 1500);
//     }
    
//     /**
//      * Clear the cart after successful purchase
//      */
//     function clearCart() {
//         // Clear cart array
//         cart.length = 0;
        
//         // Save to localStorage
//         saveCart();
        
//         // Update UI
//         updateCartCount();
//         updateCartItems();
//     }
    
//     /**
//      * Show notification toast
//      */
//     function showNotification(message, type = 'success') {
//         if (!notification || !notificationMessage) return;
        
//         // Set the message
//         notificationMessage.textContent = message;
        
//         // Set the notification type
//         notification.className = 'notification';
//         notification.classList.add(type);
        
//         // Show the notification
//         notification.classList.add('active');
        
//         // Hide after 3 seconds
//         setTimeout(() => {
//             notification.classList.remove('active');
//         }, 3000);
//     }
    
//     /**
//      * Image carousel navigation - next slide
//      */
//     function nextSlide() {
//         if (carouselItems.length === 0) return;
        
//         currentSlide = (currentSlide + 1) % carouselItems.length;
//         updateCarousel();
//     }
    
//     /**
//      * Image carousel navigation - previous slide
//      */
//     function prevSlide() {
//         if (carouselItems.length === 0) return;
        
//         currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length;
//         updateCarousel();
//     }
    
//     /**
//      * Update carousel display
//      */
//     function updateCarousel() {
//         carouselItems.forEach((item, index) => {
//             item.classList.remove('active');
//             if (index === currentSlide) {
//                 item.classList.add('active');
//             }
//         });
//     }
    
//     /**
//      * Start carousel auto-rotation
//      */
//     function startCarousel() {
//         if (carouselItems.length <= 1) return;
        
//         // Auto rotate every 5 seconds
//         setInterval(() => {
//             nextSlide();
//         }, 5000);
//     }
    
//     /**
//      * Testimonial navigation - next slide
//      */
//     function nextTestimonial() {
//         if (testimonialSlides.length === 0) return;
        
//         testimonialSlide = (testimonialSlide + 1) % testimonialSlides.length;
//         showTestimonial(testimonialSlide);
//     }
    
//     /**
//      * Testimonial navigation - previous slide
//      */
//     function prevTestimonial() {
//         if (testimonialSlides.length === 0) return;
        
//         testimonialSlide = (testimonialSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
//         showTestimonial(testimonialSlide);
//     }
    
//     /**
//      * Go to specific testimonial slide
//      */
//     function goToTestimonial(index) {
//         if (testimonialSlides.length === 0 || index < 0 || index >= testimonialSlides.length) return;
        
//         testimonialSlide = index;
//         showTestimonial(testimonialSlide);
//     }
    
//     /**
//      * Show testimonial slide
//      */
//     function showTestimonial(index) {
//         testimonialSlides.forEach((slide, i) => {
//             slide.style.display = i === index ? 'block' : 'none';
//         });
        
//         testimonialDots.forEach((dot, i) => {
//             dot.classList.toggle('active', i === index);
//         });
//     }
    
//     /**
//      * Handle scroll events
//      */
//     function handleScroll() {
//         const scrollPosition = window.scrollY;
        
//         // Back to top button visibility
//         if (backToTopBtn) {
//             if (scrollPosition > 500) {
//                 backToTopBtn.classList.add('active');
//             } else {
//                 backToTopBtn.classList.remove('active');
//             }
//         }
        
//         // Fade-in animations
//         fadeInElements.forEach(element => {
//             if (isElementInViewport(element)) {
//                 element.classList.add('active');
//             }
//         });
        
//         // AOS animations
//         animatedElements.forEach(element => {
//             if (isElementInViewport(element)) {
//                 element.classList.add('aos-animate');
//             }
//         });
//     }
    
//     /**
//      * Check if element is in viewport
//      */
//     function isElementInViewport(el) {
//         const rect = el.getBoundingClientRect();
//         return (
//             rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
//             rect.bottom >= 0 &&
//             rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
//             rect.right >= 0
//         );
//     }
    
//     /**
//      * Activate animations on page load
//      */
//     function activateAnimations() {
//         // Initial check for elements in viewport
//         setTimeout(() => {
//             handleScroll();
//         }, 100);
//     }
    
//     /**
//      * Scroll to top of page
//      */
//     function scrollToTop() {
//         window.scrollTo({
//             top: 0,
//             behavior: 'smooth'
//         });
//     }
    
//     /**
//      * Filter blog posts by category
//      */
//     function filterBlogPosts(event) {
//         const selectedCategory = event.currentTarget.dataset.category;
        
//         // Update active tab
//         categoryTabs.forEach(tab => {
//             tab.classList.toggle('active', tab === event.currentTarget);
//         });
        
//         // Filter posts
//         blogCards.forEach(card => {
//             if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
//                 card.style.display = 'block';
//             } else {
//                 card.style.display = 'none';
//             }
//         });
//     }
// });

// // ------------------------------------
// // Make functions available globally
// // ------------------------------------

// /**
//  * Update cart item quantity
//  */
// function updateQuantity(id, change) {
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];
//     const itemIndex = cart.findIndex(item => item.id === id);
    
//     if (itemIndex !== -1) {
//         // Update quantity
//         cart[itemIndex].quantity = Math.max(1, cart[itemIndex].quantity + change);
        
//         // Save cart
//         localStorage.setItem('cart', JSON.stringify(cart));
        
//         // Update UI
//         const cartItemsContainer = document.getElementById('cart-items');
//         const cartCount = document.getElementById('cart-count');
//         const cartTotalAmount = document.getElementById('cart-total-amount');
//         const mpesaAmount = document.getElementById('mpesa-amount');
//         const cardAmount = document.getElementById('card-amount');
        
//         if (cartItemsContainer && cartTotalAmount) {
//             // Update cart items
//             let cartHTML = '';
            
//             cart.forEach(item => {
//                 cartHTML += `
//                     <div class="cart-item">
//                         <div class="cart-item-image">
//                             <img src="${item.image}" alt="${item.name}">
//                         </div>
//                         <div class="cart-item-details">
//                             <div class="cart-item-title">${item.name}</div>
//                             <div class="cart-item-price">KSh ${item.price} x ${item.quantity}</div>
//                             <div class="cart-item-controls">
//                                 <div class="quantity-control">
//                                     <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
//                                     <span class="quantity-value">${item.quantity}</span>
//                                     <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
//                                 </div>
//                                 <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
//                             </div>
//                         </div>
//                     </div>
//                 `;
//             });
            
//             // Calculate total
//             const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
//             const formattedTotal = `KSh ${total.toLocaleString()}`;
            
//             // Update DOM
//             cartItemsContainer.innerHTML = cartHTML;
//             cartTotalAmount.textContent = formattedTotal;
            
//             // Update modal amounts if they exist
//             if (mpesaAmount) mpesaAmount.textContent = formattedTotal;
//             if (cardAmount) cardAmount.textContent = formattedTotal;
//         }
        
//         if (cartCount) {
//             const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
//             cartCount.textContent = totalItems;
            
//             if (totalItems > 0) {
//                 cartCount.style.display = 'flex';
//             } else {
//                 cartCount.style.display = 'none';
//             }
//         }
//     }
// }

// /**
//  * Remove item from cart
//  */
// function removeFromCart(id) {
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];
//     const itemIndex = cart.findIndex(item => item.id === id);
    
//     if (itemIndex !== -1) {
//         // Get the item name for notification
//         const itemName = cart[itemIndex].name;
        
//         // Remove item
//         cart.splice(itemIndex, 1);
        
//         // Save cart
//         localStorage.setItem('cart', JSON.stringify(cart));
        
//         // Update UI
//         const cartItemsContainer = document.getElementById('cart-items');
//         const cartCount = document.getElementById('cart-count');
//         const cartTotalAmount = document.getElementById('cart-total-amount');
//         const notification = document.getElementById('notification');
//         const notificationMessage = document.getElementById('notification-message');
//         const mpesaAmount = document.getElementById('mpesa-amount');
//         const cardAmount = document.getElementById('card-amount');
        
//         if (cartItemsContainer && cartTotalAmount) {
//             if (cart.length === 0) {
//                 // Cart is empty
//                 cartItemsContainer.innerHTML = `
//                     <div class="cart-empty">
//                         <i class="fas fa-shopping-basket"></i>
//                         <p>Your cart is empty</p>
//                         <a href="#coffee-shop" class="btn primary" onclick="closeCartPanel()">Shop Now</a>
//                     </div>
//                 `;
//                 cartTotalAmount.textContent = 'KSh 0';
                
//                 // Update modal amounts if they exist
//                 if (mpesaAmount) mpesaAmount.textContent = 'KSh 0';
//                 if (cardAmount) cardAmount.textContent = 'KSh 0';
//             } else {
//                 // Cart has items
//                 let cartHTML = '';
                
//                 cart.forEach(item => {
//                     cartHTML += `
//                         <div class="cart-item">
//                             <div class="cart-item-image">
//                                 <img src="${item.image}" alt="${item.name}">
//                             </div>
//                             <div class="cart-item-details">
//                                 <div class="cart-item-title">${item.name}</div>
//                                 <div class="cart-item-price">KSh ${item.price} x ${item.quantity}</div>
//                                 <div class="cart-item-controls">
//                                     <div class="quantity-control">
//                                         <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
//                                         <span class="quantity-value">${item.quantity}</span>
//                                         <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
//                                     </div>
//                                     <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
//                                 </div>
//                             </div>
//                         </div>
//                     `;
//                 });
                
//                 // Calculate total
//                 const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
//                 const formattedTotal = `KSh ${total.toLocaleString()}`;
                
//                 // Update DOM
//                 cartItemsContainer.innerHTML = cartHTML;
//                 cartTotalAmount.textContent = formattedTotal;
                
//                 // Update modal amounts if they exist
//                 if (mpesaAmount) mpesaAmount.textContent = formattedTotal;
//                 if (cardAmount) cardAmount.textContent = formattedTotal;
//             }
//         }
        
//         if (cartCount) {
//             const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
//             cartCount.textContent = totalItems;
            
//             if (totalItems > 0) {
//                 cartCount.style.display = 'flex';
//             } else {
//                 cartCount.style.display = 'none';
//             }
//         }
        
//         // Show notification
//         if (notification && notificationMessage) {
//             notificationMessage.textContent = `${itemName} removed from cart`;
//             notification.className = 'notification';
//             notification.classList.add('active');
            
//             setTimeout(() => {
//                 notification.classList.remove('active');
//             }, 3000);
//         }
//     }
// }

// /**
//  * Close cart panel from global scope
//  */
// function closeCartPanel() {
//     const cartSidebar = document.querySelector('.cart-sidebar');
//     const cartOverlay = document.querySelector('.cart-overlay');
    
//     if (cartSidebar && cartOverlay) {
//         cartSidebar.classList.remove('active');
//         cartOverlay.classList.remove('active');
//         document.body.classList.remove('menu-open');
//     }
// } 