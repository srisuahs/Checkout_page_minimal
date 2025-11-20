/**
 * Orders Page JavaScript - Complete Rewrite
 * Matches main cart page styling exactly
 */

// Notification system
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

// Load and display orders
async function loadOrders() {
  const container = document.getElementById('orders-list');
  
  try {
    const response = await fetch('http://localhost:8080/api/orders');
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const orders = await response.json();
    
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="cart-container">
          <div class="empty-cart">
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet.</p>
            <button class="btn-secondary" onclick="window.location.href='index.html'">Start Shopping</button>
          </div>
        </div>
      `;
      return;
    }
    
    // Display orders
    container.innerHTML = orders.map(order => renderOrder(order)).join('');
    
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = `
      <div class="cart-container">
        <div class="empty-cart">
          <h2>Unable to Load Orders</h2>
          <p>Make sure the backend server is running on port 8080.</p>
          <button class="btn-secondary" onclick="loadOrders()">Retry</button>
        </div>
      </div>
    `;
  }
}

// Render a single order - MATCHING CART STYLE
function renderOrder(order) {
  const orderData = typeof order.data === 'string' ? JSON.parse(order.data) : order.data;
  const items = orderData.items || [];
  const totals = orderData.totals || {};
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const isCancelled = order.status === 'cancelled';
  
  return `
    <div class="cart-container order-container ${isCancelled ? 'cancelled-order' : ''}" data-order-id="${order.id}">
      <!-- Order Header -->
      <div class="order-header-row">
        <div class="order-info-group">
          <h2>Order #${order.id}</h2>
          <p class="order-date">${date}</p>
          <span class="status-badge status-${order.status}">${isCancelled ? 'Cancelled' : 'Active'}</span>
        </div>
        <div class="order-total-group">
          <span class="order-total-label">Total</span>
          <span class="order-total-amount">$${order.total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Cart Table Header (Same as main cart) -->
      <div class="cart-table-header">
        <span>Product</span>
        <span>Price</span>
        <span>Quantity</span>
        <span>Total</span>
      </div>

      <!-- Order Items (Same structure as cart items) -->
      ${items.map(item => `
        <div class="cart-item">
          <div class="product-info">
            ${item.image ? 
              `<img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-img">` : 
              `<div class="cart-img-placeholder">No Image</div>`
            }
            <div class="product-details">
              <h3>${escapeHtml(item.name)}</h3>
              <p>SKU: ${item.id}</p>
            </div>
          </div>
          <div class="price">$${item.price.toFixed(2)}</div>
          <div class="quantity-controls">
            <span class="qty-display">${item.quantity}</span>
          </div>
          <div class="total-price">$${(item.quantity * item.price).toFixed(2)}</div>
        </div>
      `).join('')}

      <!-- Order Summary (Same as checkout section) -->
      <div class="checkout-section order-summary-section">
        <div class="totals">
          <div class="subtotal-row">
            <span>SUBTOTAL</span>
            <span>$${totals.subtotal ? totals.subtotal.toFixed(2) : '0.00'}</span>
          </div>
          <div class="tax-row">
            <span>TAX (8%)</span>
            <span>$${totals.tax ? totals.tax.toFixed(2) : '0.00'}</span>
          </div>
          ${order.promoCode ? `
            <div class="discount-row">
              <span>DISCOUNT (${order.promoCode})</span>
              <span>-$${totals.discountAmount ? totals.discountAmount.toFixed(2) : '0.00'}</span>
            </div>
          ` : ''}
          <div class="total-row">
            <span>TOTAL</span>
            <span>$${order.total.toFixed(2)}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="button-row order-action-buttons">
          ${!isCancelled ? `
            <button class="btn-update" onclick="cancelOrder(${order.id})">CANCEL ORDER</button>
          ` : `
            <button class="btn-reset" onclick="deleteOrder(${order.id})">DELETE ORDER</button>
            <button class="btn-update" onclick="window.location.href='index.html'">SHOP AGAIN</button>
          `}
        </div>
      </div>
    </div>
  `;
}

// Cancel an order
async function cancelOrder(orderId) {
  const confirmed = confirm('Are you sure you want to cancel this order?');
  
  if (!confirmed) return;
  
  try {
    showNotification('Cancelling order...', 'info');
    
    const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }
    
    showNotification('Order cancelled successfully!', 'success');
    
    // Reload orders
    setTimeout(() => {
      loadOrders();
    }, 1000);
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    showNotification('Failed to cancel order. Please try again.', 'error');
  }
}

// Delete a cancelled order
async function deleteOrder(orderId) {
  const confirmed = confirm('Are you sure you want to permanently delete this order?');
  
  if (!confirmed) return;
  
  try {
    showNotification('Deleting order...', 'info');
    
    const response = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete order');
    }
    
    showNotification('Order deleted successfully!', 'success');
    
    // Reload orders
    setTimeout(() => {
      loadOrders();
    }, 1000);
    
  } catch (error) {
    console.error('Error deleting order:', error);
    showNotification('Failed to delete order. Please try again.', 'error');
  }
}

window.cancelOrder = cancelOrder;
window.deleteOrder = deleteOrder;

// Helper function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Update cart badge
function updateCartBadge() {
  const saved = localStorage.getItem('shopit-cart');
  if (saved) {
    try {
      const items = JSON.parse(saved);
      document.getElementById('cart-count').textContent = items.length;
    } catch (e) {
      document.getElementById('cart-count').textContent = '0';
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  updateCartBadge();
});
