/**
 * ShopIt Shopping Cart System - COMPLETE VERSION
 * Features:
 * - Toast notifications (no alert popups)
 * - Discount breakdown display
 * - Auto-clear discount when cart empties
 * - Reset cart button
 * - Custom promo codes
 * - localStorage persistence
 * - JDBC backend integration
 */

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'success') {
  const existing = document.getElementById('notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
    <span class="notification-message">${message}</span>
    <button class="notification-close" onclick="closeNotification()">×</button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.getElementById('notification')) {
      closeNotification();
    }
  }, 4000);
}

function closeNotification() {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.classList.add('notification-hiding');
    setTimeout(() => notification.remove(), 300);
  }
}

window.closeNotification = closeNotification;

// ============================================
// CART MODULE - Using Closure Pattern
// ============================================

function createCart() {
  let items = [];
  let promoCode = null;
  let discountRate = 0;

  const loadFromStorage = () => {
    const saved = localStorage.getItem('shopit-cart');
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load cart from storage:', e);
        items = [];
      }
    }
  };

  const saveToStorage = () => {
    localStorage.setItem('shopit-cart', JSON.stringify(items));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.08;
    let total = subtotal + tax;
    let discountAmount = 0;
    let finalTotal = total;
    
    if (promoCode && discountRate > 0) {
      discountAmount = total * discountRate;
      finalTotal = total - discountAmount;
    }
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
      hasDiscount: discountRate > 0
    };
  };

  loadFromStorage();

  return {
    getItems: () => [...items],
    
    addItem: (name, price, imageData = null) => {
      const newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name: name,
        price: parseFloat(price),
        quantity: 1,
        image: imageData,
        addedAt: new Date().toISOString()
      };
      
      items.push(newItem);
      saveToStorage();
      return newItem;
    },

    updateQuantity: (itemId, delta) => {
      const item = items.find(i => i.id === itemId);
      if (item) {
        const newQuantity = item.quantity + delta;
        if (newQuantity > 0) {
          item.quantity = newQuantity;
          saveToStorage();
          return true;
        }
      }
      return false;
    },

    removeItem: (itemId) => {
      const index = items.findIndex(i => i.id === itemId);
      if (index !== -1) {
        items.splice(index, 1);
        saveToStorage();
        
        // Auto-clear discount if cart is empty
        if (items.length === 0) {
          promoCode = null;
          discountRate = 0;
        }
        
        return true;
      }
      return false;
    },

    applyPromo: (code, validationCallback) => {
      const result = validationCallback(code);
      if (result.valid) {
        promoCode = code;
        discountRate = result.discount;
        return { success: true, discount: result.discount, description: result.description };
      }
      return { success: false, message: 'Invalid promo code' };
    },

    clearPromo: () => {
      promoCode = null;
      discountRate = 0;
    },

    getPromoCode: () => promoCode,

    getTotals: calculateTotals,
    
    clearCart: () => {
      items = [];
      promoCode = null;
      discountRate = 0;
      saveToStorage();
    },

    getItemCount: () => items.length,
    save: saveToStorage
  };
}

const cart = createCart();

// ============================================
// UI RENDERING FUNCTIONS
// ============================================

function renderCart() {
  const cartList = document.getElementById('cart-list');
  const items = cart.getItems();

  if (items.length === 0) {
    cartList.innerHTML = `
      <div class="empty-cart">
        <h2>Your bag is empty</h2>
        <p>Add some items to get started!</p>
      </div>
    `;
    updateCartBadge();
    updateTotals();
    return;
  }

  cartList.innerHTML = items.map(item => `
    <div class="cart-item" data-item-id="${item.id}">
      <div class="product-info">
        ${item.image ? 
          `<img src="${item.image}" alt="${item.name}" class="cart-img">` : 
          `<div class="cart-img" style="background: #e0e0e0; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 10px; color: #999;">No Image</span>
          </div>`
        }
        <div class="product-details">
          <h3>${escapeHtml(item.name)}</h3>
          <p>Always Available</p>
        </div>
      </div>
      <div class="price">$${item.price.toFixed(2)}</div>
      <div class="quantity-controls">
        <button class="qty-btn" onclick="handleQuantityChange('${item.id}', -1)">−</button>
        <span class="qty-display">${item.quantity}</span>
        <button class="qty-btn" onclick="handleQuantityChange('${item.id}', 1)">+</button>
        <button class="remove-btn" onclick="handleRemoveItem('${item.id}')">Remove</button>
      </div>
      <div class="total-price">$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');

  updateCartBadge();
  updateTotals();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  badge.textContent = cart.getItemCount();
}

function updateTotals() {
  const totals = cart.getTotals();
  
  // Update basic totals
  document.getElementById('subtotal').textContent = totals.subtotal.toFixed(2);
  document.getElementById('tax').textContent = totals.tax.toFixed(2);
  
  // Handle discount display
  const discountRow = document.getElementById('discount-row');
  const totalRow = document.getElementById('total-row');
  
  if (totals.hasDiscount) {
    // Show discount breakdown
    if (!discountRow) {
      const newDiscountRow = document.createElement('div');
      newDiscountRow.id = 'discount-row';
      newDiscountRow.className = 'discount-row';
      newDiscountRow.innerHTML = `
        <span>DISCOUNT (${cart.getPromoCode()})</span>
        <span>-$<span id="discount-amount">0.00</span></span>
      `;
      totalRow.parentNode.insertBefore(newDiscountRow, totalRow);
    }
    
    document.getElementById('discount-amount').textContent = totals.discountAmount.toFixed(2);
    
    // Show original total with strikethrough and final total
    const totalSpan = totalRow.querySelector('span:last-child');
    totalSpan.innerHTML = `<span class="original-total">$${totals.total.toFixed(2)}</span> $${totals.finalTotal.toFixed(2)}`;
  } else {
    // Remove discount row if exists
    if (discountRow) {
      discountRow.remove();
    }
    
    // Show regular total
    const totalSpan = totalRow.querySelector('span:last-child');
    totalSpan.textContent = `$${totals.total.toFixed(2)}`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// EVENT HANDLERS
// ============================================

window.handleQuantityChange = function(itemId, delta) {
  cart.updateQuantity(itemId, delta);
  renderCart();
};

window.handleRemoveItem = function(itemId) {
  cart.removeItem(itemId);
  renderCart();
  
  // Show notification based on cart state
  if (cart.getItemCount() === 0) {
    showNotification('Cart is now empty. Discount removed.', 'info');
  } else {
    showNotification('Item removed from cart', 'info');
  }
};

/**
 * Handle adding custom item with image upload (Callback pattern)
 */
function handleAddCustomItem() {
  const nameInput = document.getElementById('custom-name');
  const priceInput = document.getElementById('custom-price');
  const imageInput = document.getElementById('custom-image');

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name) {
    showNotification('Please enter an item name', 'error');
    return;
  }

  if (!price || price <= 0) {
    showNotification('Please enter a valid price', 'error');
    return;
  }

  // Handle image upload with FileReader (Callback pattern)
  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    
    // Callback executed when image is loaded
    reader.onload = function(e) {
      cart.addItem(name, price, e.target.result);
      renderCart();
      showNotification(`${name} added to cart!`, 'success');
      
      nameInput.value = '';
      priceInput.value = '';
      imageInput.value = '';
    };
    
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    cart.addItem(name, price, null);
    renderCart();
    showNotification(`${name} added to cart!`, 'success');
    
    nameInput.value = '';
    priceInput.value = '';
  }
}

/**
 * Promo code validation (Callback pattern)
 * ADD YOUR CUSTOM CODES HERE
 */
function validatePromoCode(code) {
  const promoCodes = {
    // Default codes
    'SAVE10': { discount: 0.10, description: '10% off' },
    'SAVE20': { discount: 0.20, description: '20% off' },
    'WELCOME': { discount: 0.15, description: '15% off for new customers' },
    
    // Custom codes - EASILY ADD MORE:
    'STUDENT': { discount: 0.25, description: '25% student discount' },
    'FREESHIP': { discount: 0.05, description: 'Free shipping' },
    'BLACKFRIDAY': { discount: 0.30, description: 'Black Friday 30% off' },
    'VIP': { discount: 0.40, description: 'VIP member 40% off' },
    'FIRST50': { discount: 0.50, description: 'First purchase 50% off!' }
  };

  const promo = promoCodes[code.toUpperCase()];
  if (promo) {
    return { valid: true, discount: promo.discount, description: promo.description };
  }
  return { valid: false };
}

function handleApplyPromo() {
  const promoInput = document.getElementById('promo');
  const code = promoInput.value.trim();

  if (!code) {
    showNotification('Please enter a promo code', 'error');
    return;
  }

  // Check if cart is empty
  if (cart.getItemCount() === 0) {
    showNotification('Add items to cart before applying promo code', 'error');
    promoInput.value = '';
    return;
  }

  const result = cart.applyPromo(code, validatePromoCode);

  if (result.success) {
    const discount = (result.discount * 100).toFixed(0);
    showNotification(`✓ Promo code applied! ${result.description} - You save ${discount}%`, 'success');
    renderCart();
  } else {
    showNotification('Invalid promo code. Try SAVE10, SAVE20, or WELCOME', 'error');
  }

  promoInput.value = '';
}

/**
 * Handle checkout - Send data to JDBC backend
 */
function handleCheckout() {
  const items = cart.getItems();
  
  if (items.length === 0) {
    showNotification('Your cart is empty!', 'error');
    return;
  }

  const totals = cart.getTotals();
  const orderData = {
    items: items,
    totals: totals,
    promoCode: cart.getPromoCode(),
    timestamp: new Date().toISOString()
  };

  showNotification('Processing order...', 'info');

  // Send to JDBC backend
  fetch('http://localhost:8080/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Checkout failed');
  })
  .then(data => {
    showNotification(`✓ Order confirmed! Order ID: ${data.orderId}. Total: $${totals.finalTotal.toFixed(2)}`, 'success');
    cart.clearCart();
    renderCart();
  })
  .catch(error => {
    console.error('Checkout error:', error);
    showNotification('Checkout failed. Make sure backend is running on port 8080.', 'error');
  });
}

function handleUpdateCart() {
  cart.save();
  showNotification('Cart updated successfully!', 'success');
}

/**
 * Handle reset cart - Clear everything with confirmation
 */
function handleResetCart() {
  if (cart.getItemCount() === 0) {
    showNotification('Cart is already empty', 'info');
    return;
  }
  
  // Confirm before clearing
  const confirmed = confirm('Are you sure you want to clear your entire cart?');
  if (confirmed) {
    cart.clearCart();
    renderCart();
    showNotification('Cart has been reset', 'success');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  renderCart();

  document.getElementById('add-custom').addEventListener('click', handleAddCustomItem);
  document.getElementById('apply-promo').addEventListener('click', handleApplyPromo);
  document.getElementById('update-cart').addEventListener('click', handleUpdateCart);
  document.getElementById('checkout').addEventListener('click', handleCheckout);
  document.getElementById('reset-cart').addEventListener('click', handleResetCart);

  // Optional: Add sample items for demo
  if (cart.getItemCount() === 0) {
    cart.addItem('INGROWN FACE DUO', 60.00, null);
    cart.addItem('Route Package Protection', 1.00, null);
    renderCart();
  }
});
