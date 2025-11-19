# ShopIt Shopping Cart - Complete Setup Guide

## 🎯 Features

✅ **Toast Notifications** - No alert() popups, elegant slide-in notifications  
✅ **Discount Breakdown** - Shows original price (strikethrough), discount amount, and final price  
✅ **Auto-Clear Discount** - Discount removes automatically when cart is empty  
✅ **Reset Cart Button** - Clear entire cart with confirmation dialog  
✅ **Custom Promo Codes** - Easy to add your own codes in JavaScript  
✅ **JDBC Backend** - SQLite database with JDBC for order persistence  
✅ **localStorage** - Cart persists across browser sessions  
✅ **Image Upload** - Add custom items with optional images  

---

## 📁 Complete File List

shopit/
├── index.html           ← Complete HTML with Reset Cart button
├── styles.css           ← Complete CSS with notification styles
├── shopit.js            ← Complete JavaScript with all features
├── ShopItServer.java    ← Java JDBC backend
└── README.md            ← This file
```

---

## 🚀 Quick Start

### Step 1: Start Backend

```powershell
cd C:\Users\Administrator\Desktop\web-tech-worklshop\Final_project\shopit

# Compile Java (if not already compiled)
javac ShopItServer.java

# Run with JDBC driver (as you have it working)
java -cp ".;sqlite-jdbc-3.42.0.0.jar" ShopItServer
```

You should see:
```
=== ShopIt Server Starting ===
✓ SQLite JDBC Driver loaded successfully
✓ Database initialized successfully
✓ ShopIt JDBC Server started on http://localhost:8080
✓ Database: shopit.db
```

### Step 2: Start Frontend

Open **NEW PowerShell window**:

```powershell
cd C:\Users\Administrator\Desktop\web-tech-worklshop\Final_project\shopit

# Option 1: Python HTTP server
python -m http.server 8000

# Option 2: VS Code Live Server
# Right-click index.html → "Open with Live Server"
```

### Step 3: Open in Browser

Navigate to: **http://localhost:8000**

---

## ✨ Test All Features

### 1. Toast Notifications

- **Add item** → Green success toast slides in from right ✓
- **Remove item** → Blue info toast ✓
- **Apply invalid promo** → Red error toast ✓
- **All toasts auto-hide after 4 seconds**
- **Click × to close manually**

### 2. Discount Breakdown

1. Add items to cart
2. Apply promo code "SAVE20"
3. See in totals section:
   - **Subtotal**: $X.XX
   - **Tax (8%)**: $X.XX
   - **Discount (SAVE20)**: -$X.XX ← New row in red
   - **Total**: ~~$X.XX~~ $X.XX ← Original strikethrough, final price

### 3. Auto-Clear Discount

1. Apply any promo code
2. Remove all items one by one
3. When last item removed:
   - Toast: "Cart is now empty. Discount removed." ✓
   - Discount row disappears ✓

### 4. Reset Cart Button

1. Add multiple items
2. Apply promo code
3. Click **"RESET CART"** button
4. Confirmation dialog appears
5. Click OK → Everything clears ✓
6. Toast: "Cart has been reset" ✓

### 5. Checkout with JDBC

1. Add items to cart
2. Apply promo code (optional)
3. Click **"CHECKOUT"**
4. Toast: "Processing order..." then "Order confirmed! Order ID: 1" ✓
5. Check backend console: "✓ Order 1 saved successfully" ✓
6. Check database:
   ```powershell
   sqlite3 shopit.db "SELECT * FROM orders;"
   ```

---

## 💳 Built-in Promo Codes

Test these codes:

| Code | Discount | Description |
|------|----------|-------------|
| `SAVE10` | 10% off | Standard discount |
| `SAVE20` | 20% off | Better discount |
| `WELCOME` | 15% off | New customer offer |
| `STUDENT` | 25% off | Student discount |
| `FREESHIP` | 5% off | Free shipping |
| `BLACKFRIDAY` | 30% off | Black Friday sale |
| `VIP` | 40% off | VIP members |
| `FIRST50` | 50% off | First purchase |

---

## 🎨 Adding Your Own Promo Codes

Open `shopit.js`, find line ~270:

```javascript
const promoCodes = {
  'SAVE10': { discount: 0.10, description: '10% off' },
  'SAVE20': { discount: 0.20, description: '20% off' },
  
  // ADD YOUR CUSTOM CODES HERE:
  'MYCODE': { discount: 0.35, description: 'My special 35% off' },
  'HOLIDAY': { discount: 0.40, description: 'Holiday sale' },
  'CLEARANCE': { discount: 0.60, description: 'Clearance 60% off' }
};
```

**Discount values:**
- `0.10` = 10% off
- `0.25` = 25% off
- `0.50` = 50% off
- `1.00` = 100% off (free!)

Save the file and refresh your browser!

---

## 🗄️ Database Structure

The SQLite database has this structure:

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_data TEXT NOT NULL,           -- Full JSON of cart items
  total_amount REAL NOT NULL,          -- Final total after discount
  promo_code TEXT,                     -- Applied promo code (if any)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

View orders:
```powershell
# View all orders
sqlite3 shopit.db "SELECT id, total_amount, promo_code, created_at FROM orders;"

# Count orders
sqlite3 shopit.db "SELECT COUNT(*) FROM orders;"

# View recent orders
sqlite3 shopit.db "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;"
```

---

## 🧪 Complete Test Scenario

### Scenario: Full Purchase Flow with Discount

1. **Start both servers** (backend + frontend)
2. **Add custom item:**
   - Name: "Laptop"
   - Price: 1000
   - Upload image (optional)
   - Click "Add to Cart"
   - See: Green toast "Laptop added to cart!"

3. **Add another item:**
   - Name: "Mouse"
   - Price: 25
   - Click "Add to Cart"

4. **Check totals:**
   - Subtotal: $1025.00
   - Tax (8%): $82.00
   - Total: $1107.00

5. **Apply promo code:**
   - Enter: "SAVE20"
   - Click → button
   - See: Green toast "Promo code applied! 20% off - You save 20%"

6. **Check discount breakdown:**
   - Subtotal: $1025.00
   - Tax (8%): $82.00
   - Discount (SAVE20): -$221.40
   - Total: ~~$1107.00~~ **$885.60**

7. **Checkout:**
   - Click "CHECKOUT"
   - Toast: "Processing order..."
   - Toast: "Order confirmed! Order ID: 1. Total: $885.60"
   - Backend console: "✓ Order 1 saved successfully (Total: $885.6)"
   - Cart clears automatically

8. **Verify in database:**
   ```powershell
   sqlite3 shopit.db "SELECT * FROM orders WHERE id=1;"
   ```

---

## 🎯 JavaScript Concepts Demonstrated

### Closures
```javascript
function createCart() {
  let items = [];  // Private variable
  let promoCode = null;  // Private variable
  
  return {
    getItems: () => [...items],  // Closure accessing private items
    addItem: (name, price) => { items.push(...); }  // Closure modifying items
  };
}
```

### Callbacks
```javascript
// FileReader callback
reader.onload = function(e) {
  cart.addItem(name, price, e.target.result);
};

// Validation callback
cart.applyPromo(code, validatePromoCode);
```

### Higher-Order Functions
```javascript
items.map(item => `<div>...</div>`)
items.reduce((sum, item) => sum + item.price, 0)
```

---

## 🐛 Troubleshooting

### Backend Issues

**"No suitable driver found"**
- Make sure `sqlite-jdbc-3.45.0.0.jar` is in your folder
- Run with: `java -cp ".;sqlite-jdbc-3.45.0.0.jar" ShopItServer`
- Check Java version: `java -version` (needs 8+)

**"Port 8080 already in use"**
```powershell
# Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Frontend Issues

**Notifications not showing**
- Check browser console (F12) for errors
- Make sure `styles.css` includes notification styles
- Hard refresh: Ctrl+F5

**Discount not showing**
- Apply a promo code first
- Make sure items are in cart
- Check that you're using the new `shopit.js`

**Reset button not working**
- Check that `index.html` has `<button id="reset-cart">`
- Check browser console for errors
- Verify JavaScript is loading

---

## 📦 File Dependencies

```
index.html
  ├── styles.css  (loads all styles including notifications)
  └── shopit.js   (loads all JavaScript features)

ShopItServer.java
  └── sqlite-jdbc-3.45.0.0.jar  (JDBC driver)

shopit.js
  └── localStorage  (browser storage)
  └── http://localhost:8080/api/checkout  (backend API)

Backend creates:
  └── shopit.db  (SQLite database file)
```

---

## 🚀 Next Steps

**Enhancements you can add:**

1. **User Authentication**
   - Login/Register system
   - User-specific carts
   - Order history per user

2. **Admin Dashboard**
   - View all orders
   - Manage promo codes
   - Sales analytics

3. **Payment Integration**
   - Stripe or PayPal
   - Credit card processing
   - Receipt generation

4. **Email Notifications**
   - Order confirmation emails
   - Shipping updates
   - Promo code announcements

5. **Advanced Features**
   - Product categories
   - Search functionality
   - Wish list
   - Product reviews

---

## 📚 Learning Resources

- **Closures**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
- **Callbacks**: https://developer.mozilla.org/en-US/docs/Glossary/Callback_function
- **JDBC Tutorial**: https://docs.oracle.com/javase/tutorial/jdbc/
- **SQLite Documentation**: https://www.sqlite.org/docs.html

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:8000
- [ ] No console errors (F12)
- [ ] Can add custom items
- [ ] Toast notifications appear
- [ ] Can apply promo codes
- [ ] Discount shows breakdown
- [ ] Reset cart button works
- [ ] Checkout saves to database
- [ ] shopit.db file exists
- [ ] Orders visible in database

---

## 🎉 You're Done!

You now have a fully functional shopping cart with:
- Toast notifications (no popups!)
- Discount breakdown display
- Auto-clear discount
- Reset cart button
- Custom promo codes
- JDBC database persistence
- localStorage cart
- Image uploads

**Everything works together perfectly!**

For questions or issues, check:
- Browser console (F12)
- Backend server console
- Database: `sqlite3 shopit.db "SELECT * FROM orders;"`

Happy coding! 🛒✨
