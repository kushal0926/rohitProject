const search_btn = document.getElementById("search-btn");
const cart_btn = document.getElementById("cart-btn");

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
// cart buttons
// ----------------------------------------------------------------------

cart_btn.addEventListener("click", () => {
  window.location.href = "cart.html";
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
  const existingProduct = cart.find((item) => item.id === product.id);

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
      quantity: 1,
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
  const newCart = cart.filter((item) => item.id !== productId);
  saveCart(newCart);
  return newCart;
}

// -----------------------------------------------------------------
// update quantity
// -------------------------------------
function changeQuantity(productId, newQuantity) {
  const cart = getCart();
  const product = cart.find((item) => item.id === productId);

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
// calculating total price
// ----------------------------------------------
const DELIVERY_FEE = 5;

function calculateTotal() {
  const cart = getCart();
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
  });

  return total;
}

// --------------------------------------------------------------------------------
// displaying the cart items in the cart page
// ------------------------------------------------
function displayCart() {
  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return;

  const itemsTotalElement = document.querySelector(
    '[data-summary="items-total"]',
  );
  const deliveryElement = document.querySelector('[data-summary="delivery"]');
  const totalElement = document.querySelector('[data-summary="total"]');
  const cart = getCart();

  // deleting cart items
  cartContainer.innerHTML = "";

  // showing each products
  cart.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "product-card";
    itemDiv.style.cssText =
      "flex-direction: row; align-items: center; gap: 24px; padding: 16px;";
    itemDiv.setAttribute("data-item-id", item.id);

    const subtotal = item.price * item.quantity;
    const qtyInputId = `qty-${item.id}`;

    itemDiv.innerHTML = `
            <div style="width: 120px; height: 120px; flex-shrink: 0;">
                <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            </div>

            <div style="flex: 1;">
                <h3 class="product-title" style="margin-bottom: 4px;">${item.name}</h3>
                <p class="product-price" style="margin-bottom: 12px;">$${item.price.toFixed(2)}</p>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <label for="${qtyInputId}">Qty:</label>
                    <input id="${qtyInputId}" type="number" min="1" value="${item.quantity}" style="width: 70px; padding: 6px;" data-item-id="${item.id}">
                    <button class="add-to-cart-btn" style="background: #ff6b6b;" data-action="remove" data-item-id="${item.id}">Remove</button>
                </div>
            </div>

            <div style="font-size: 19px; font-weight: bold;">
                Subtotal: $${subtotal.toFixed(2)}
            </div>
        `;

    cartContainer.appendChild(itemDiv);
  });

  // updating summary totals
  const itemsTotal = calculateTotal();
  const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = itemsTotal + delivery;

  if (itemsTotalElement) {
    itemsTotalElement.textContent = `$${itemsTotal.toFixed(2)}`;
  }
  if (deliveryElement) {
    deliveryElement.textContent = `$${delivery.toFixed(2)}`;
  }
  if (totalElement) {
    totalElement.textContent = `$${grandTotal.toFixed(2)}`;
  }

  // event listeners
  cartEventListeners();
}

// ------------------------------------------------------------------------
// function for event listeners
// -----------------------------------------------------------------------
function cartEventListeners() {
  // handiling quantity chages
  document
    .querySelectorAll('#cart-items input[type="number"]')
    .forEach((input) => {
      input.addEventListener("change", (e) => {
        const itemId = e.target.getAttribute("data-item-id");
        const newQty = parseInt(e.target.value) || 1;
        changeQuantity(itemId, newQty);
        displayCart();
      });
    });

  // handling the remove button for deleting
  document
    .querySelectorAll('#cart-items button[data-action="remove"]')
    .forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemId = e.target.getAttribute("data-item-id");
        removeProductFromCart(itemId);
        displayCart();
      });
    });
}

// handiling add to crt
document.addEventListener("click", function (e) {
  // checking if the user is clicking the add to cart button
  if (e.target.classList.contains("add-to-cart-btn")) {
    const button = e.target;
    const productCard = button.closest(".product-card");

    // now getting the product information
    const name = productCard.querySelector(".product-title").textContent;
    const priceText = productCard.querySelector(".product-price").textContent;
    const image = productCard.querySelector(".product-image img").src;

    //  price number (removing $ and other characters)
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

    // creating unique id for product name
    const id = name.toLowerCase().replace(/\s+/g, "-");

    // product adding to the cart
    addProductToCart({
      id: id,
      name: name,
      price: price,
      image: image,
    });

    // showing the user has added the product
    button.textContent = "Added";
    button.style.backgroundColor = "#28a745";

    // making it switch to add to cart after 1 sec
    setTimeout(() => {
      button.textContent = "Add to Cart";
      button.style.backgroundColor = "";
    }, 1000);
  }
});

// making the card loads the products if it refresh
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", displayCart);
} else {
  displayCart();
}
