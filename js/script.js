const search_btn = document.getElementById("search-btn");
const cart_btn = document.getElementById("cart-btn");
const user_btn = document.getElementById("user-btn");

// --------------------------------------------------------------------------
// Search bar
// -----------------------------------------------------------------------------
search_btn.addEventListener("click", () => {
    let overlay = document.getElementById("search-popup-overlay");

    // If it already exists, just show it again
    if (overlay) {
        overlay.style.display = "flex";
        const input = overlay.querySelector(".search-popup-input");
        if (input) {
            input.focus();
        }
        return;
    }

    overlay = document.createElement("div");
    overlay.id = "search-popup-overlay";
    overlay.className = "search-popup-overlay";

    overlay.innerHTML = `
          <div class="search-popup">
            <h3>Search products</h3>
            <input
              type="text"
              class="search-popup-input"
              placeholder="Type to search..."
            />
            <div class="search-popup-actions">
              <button type="button" class="search-popup-button secondary" data-search-action="close">
                Close
              </button>
              <button type="button" class="search-popup-button primary" data-search-action="submit">
                Search
              </button>
            </div>
          </div>
        `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector(".search-popup-input");
    if (input) {
        input.focus();
    }

    // Close when clicking on overlay background
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeSearchPopup();
        }
    });

    // Buttons inside popup
    overlay.querySelectorAll("[data-search-action]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const action = e.currentTarget.getAttribute("data-search-action");
            if (action === "close") {
                closeSearchPopup();
            } else if (action === "submit") {
                closeSearchPopup();
            }
        });
    });
});

// -------------------------------------------------------------------------------
// Cart Buttons
// ----------------------------------------------------------------------

cart_btn.addEventListener("click", () => {
    window.location.href = "cart.html";
});

// ------------------------------------------------------------------------
// User Button
// --------------------------------------------

user_btn.addEventListener("click", () => {
    window.location.href = "user.html";
});

// making a function for the search bar if click it will close
function closeSearchPopup() {
    const overlay = document.getElementById("search-popup-overlay");
    if (overlay) {
        overlay.style.display = "none";
    }
}


// --------------------------------------------------------------------------
// adding and deleting products to the cart
// --------------------------------

// getting cart from the browsers storage
function getCart() {
    const saved = localStorage.getItem("shopping_cart");
    return saved ? JSON.parse(saved) : [];
}

//  saving the data in the browser storage so we can get it later
function saveCart(cart) {
    localStorage.setItem("shopping_cart", JSON.stringify(cart));
}

// -----------------------------------------------------------------------
// adding product to the cart
// ---------------------------------------------
function addProductToCart(product) {
    const cart = getCart();
    
    // chcking if the product exists in the cart already or not
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        // if the added product already exists in the cart we are just gonna increment the quantity
        existingProduct.quantity += 1;
    } else {
        // if the product is not there then we are gonna add the product
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart(cart);
    return cart;
}

// --------------------------------------------------------------------------------
// removing product from cart
// ----------------------------------------------
function removeProductFromCart(productId) {
    const cart = getCart();
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
    return newCart;
}

// -----------------------------------------------------------------
// update quantity
// -------------------------------------
function changeQuantity(productId, newQuantity) {
    const cart = getCart();
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        if (newQuantity <= 0) {
            // removing the product if the quntity is less than zero
            return removeProductFromCart(productId);
        }
        product.quantity = newQuantity;
        saveCart(cart);
    }
    
    return cart;
}

// ---------------------------------------------------------------------
// CALCULATE TOTAL PRICE
// ----------------------------------------------
function calculateTotal() {
    const cart = getCart();
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    return total;
}

// --------------------------------------------------------------------------------
// DISPLAY CART ON PAGE
// ------------------------------------------------
function displayCart() {
    const cartContainer = document.getElementById("cart-items");
    const totalContainer = document.getElementById("cart-total");
    
    if (!cartContainer) return; // Not on cart page
    
    const cart = getCart();
    
    // Empty cart message
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (totalContainer) totalContainer.textContent = "$0.00";
        return;
    }
    
    // Clear container
    cartContainer.innerHTML = "";
    
    // Show each product
    cart.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "product-card";
        itemDiv.style.cssText = "flex-direction: row; align-items: center; gap: 1.5rem; padding: 1rem;";
        itemDiv.setAttribute("data-item-id", item.id);
        
        const subtotal = item.price * item.quantity;
        const qtyInputId = `qty-${item.id}`;
        
        itemDiv.innerHTML = `
            <div style="width: 120px; height: 120px; flex-shrink: 0;">
                <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            </div>

            <div style="flex: 1;">
                <h3 class="product-title" style="margin-bottom: .25rem;">${item.name}</h3>
                <p class="product-price" style="margin-bottom: .75rem;">$${item.price.toFixed(2)}</p>

                <div style="display: flex; align-items: center; gap: .75rem;">
                    <label for="${qtyInputId}">Qty:</label>
                    <input id="${qtyInputId}" type="number" min="1" value="${item.quantity}" style="width: 70px; padding: .4rem;" data-item-id="${item.id}">
                    <button class="add-to-cart-btn" style="background: #ff6b6b;" data-action="remove" data-item-id="${item.id}">Remove</button>
                </div>
            </div>

            <div style="font-size: 1.2rem; font-weight: bold;">
                Subtotal: $${subtotal.toFixed(2)}
            </div>
        `;
        
        cartContainer.appendChild(itemDiv);
    });
    
    // Update total
    if (totalContainer) {
        totalContainer.textContent = `$${calculateTotal().toFixed(2)}`;
    }
    
    // Attach event listeners for quantity changes and remove buttons
    attachCartEventListeners();
}

// ------------------------------------------------------------------------
// ATTACH EVENT LISTENERS
// -----------------------------------------------------------------------
function attachCartEventListeners() {
    // Handle quantity changes
    document.querySelectorAll('#cart-items input[type="number"]').forEach(input => {
        input.addEventListener("change", (e) => {
            const itemId = e.target.getAttribute("data-item-id");
            const newQty = parseInt(e.target.value) || 1;
            changeQuantity(itemId, newQty);
            displayCart(); // Re-render to update subtotals and totals
        });
    });

    // Handle remove button clicks
    document.querySelectorAll('#cart-items button[data-action="remove"]').forEach(button => {
        button.addEventListener("click", (e) => {
            const itemId = e.target.getAttribute("data-item-id");
            removeProductFromCart(itemId);
            displayCart(); // Re-render cart
        });
    });
}

// ------------------------------------------------------------------------------------------
// "ADD TO CART" BUTTON HANDLER
// ----------------------------------------------------
document.addEventListener("click", function(e) {
    // Check if "Add to Cart" button was clicked
    if (e.target.classList.contains("add-to-cart-btn")) {
        const button = e.target;
        const productCard = button.closest(".product-card");
        
        // Get product information from the card
        const name = productCard.querySelector(".product-title").textContent;
        const priceText = productCard.querySelector(".product-price").textContent;
        const image = productCard.querySelector(".product-image img").src;
        
        // Extract price number (remove $ and other characters)
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
        
        // Create unique ID from product name
        const id = name.toLowerCase().replace(/\s+/g, "-");
        
        // Add to cart
        addProductToCart({
            id: id,
            name: name,
            price: price,
            image: image
        });
        
        // Show feedback
        button.textContent = "Added!";
        button.style.backgroundColor = "#28a745";
        
        setTimeout(() => {
            button.textContent = "Add to Cart";
            button.style.backgroundColor = "";
        }, 1000);
    }
});

// Load cart when page loads
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", displayCart);
} else {
    displayCart();
}