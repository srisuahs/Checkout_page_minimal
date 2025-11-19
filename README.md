# ShopIt - Shopping Cart System 🛒

[![Java](https://img.shields.io/badge/Java-8+-orange.svg)](https://www.oracle.com/java/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> An intermediate-level shopping cart system demonstrating **JavaScript closures**, **callbacks**, and **JDBC** integration for database persistence.

![ShopIt Demo](https://via.placeholder.com/800x400/f5f5f5/333?text=ShopIt+Shopping+Cart)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Technologies](#-technologies)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [Promo Codes](#-promo-codes)
- [Customization](#-customization)
- [JavaScript Concepts](#-javascript-concepts)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## ✨ Features

### Core Functionality
- 🛍️ **Add/Remove Items** - Dynamic cart management with quantity controls
- 💰 **Promo Code System** - Automatic discount calculation with 8+ built-in codes
- 💾 **Persistent Storage** - Cart data saved using localStorage
- 🖼️ **Image Upload** - Custom items with optional product images
- 📊 **Discount Breakdown** - Visual display of original price, discount, and final total

### User Experience
- 🔔 **Toast Notifications** - Non-intrusive slide-in alerts (no popups!)
- 🔄 **Auto-Clear Discount** - Discount removes when cart is emptied
- 🗑️ **Reset Cart** - One-click cart clearing with confirmation
- 📱 **Responsive Design** - Mobile-friendly interface

### Backend
- 🗄️ **JDBC Integration** - SQLite database for order persistence
- 🔌 **REST API** - Simple HTTP endpoints for checkout and order retrieval
- 💼 **No External Dependencies** - Pure Java with built-in HTTP server

---

## 🎬 Demo

### Screenshot
![Cart Interface](https://via.placeholder.com/600x400/fff/333?text=Cart+Screenshot)

### Live Demo
*(Add your deployed link here if available)*

---

## 🛠️ Technologies

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Grid, Flexbox, Animations
- **JavaScript (ES6+)** - Vanilla JS with modern features
  - Closures for data encapsulation
  - Callbacks for async operations
  - Template literals
  - Array methods (map, reduce, filter)

### Backend
- **Java 8+** - Core backend logic
- **JDBC** - Database connectivity
- **SQLite** - Lightweight embedded database
- **HttpServer** - Built-in Java HTTP server

### Storage
- **localStorage** - Client-side cart persistence
- **SQLite Database** - Server-side order storage

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
# Check Java version (8 or higher required)
java -version

# Check Python version (for frontend server)
python --version

# Check Git
git --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/srisuahs/shopit-cart.git
   cd shopit-cart
   ```

2. **Download SQLite JDBC Driver**
   ```bash
   # Download from Maven Central
   curl -O https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.42.0.0/sqlite-jdbc-3.42.0.0.jar
   ```
   
   Or download manually from: [SQLite JDBC](https://github.com/xerial/sqlite-jdbc/releases)

3. **Compile Java Backend**
   ```bash
   javac ShopItServer.java
   ```

4. **Start Backend Server**
   ```bash
   # Windows
   java -cp ".;sqlite-jdbc-3.42.0.0.jar" ShopItServer
   
   # macOS/Linux
   java -cp ".:sqlite-jdbc-3.42.0.0.jar" ShopItServer
   ```
   
   Backend runs on `http://localhost:8080`

5. **Start Frontend Server**
   
   Open a new terminal:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```
   
   Or use VS Code **Live Server** extension

6. **Open in Browser**
   ```
   http://localhost:8000
   ```

---

## 📁 Project Structure

```
shopit-cart/
├── index.html              # Main HTML structure
├── styles.css              # Complete styling with animations
├── shopit.js               # Frontend logic (closures, callbacks)
├── ShopItServer.java       # Java backend with JDBC
├── sqlite-jdbc-3.45.0.0.jar # JDBC driver (download separately)
├── shopit.db               # SQLite database (auto-created)
├── README.md               # This file
└── LICENSE                 # MIT License
```

---

## 📖 Usage

### Adding Items to Cart

1. **Pre-loaded Items**: Sample items load automatically on first visit
2. **Custom Items**:
   - Enter item name
   - Enter price
   - (Optional) Upload product image
   - Click "Add to Cart"

### Applying Discounts

1. Add items to cart
2. Enter promo code in the field
3. Click the **→** button
4. View discount breakdown in totals section

### Checkout

1. Review cart items and total
2. Click **"CHECKOUT"** button
3. Order saves to database
4. Cart clears automatically
5. Confirmation notification appears

### Managing Cart

- **Increase/Decrease Quantity**: Use **+/-** buttons
- **Remove Item**: Click "Remove" button
- **Update Cart**: Click "UPDATE" to save changes
- **Reset Cart**: Click "RESET CART" to clear everything

---

## 💳 Promo Codes

Test the discount system with these built-in codes:

| Code | Discount | Description |
|------|----------|-------------|
| `SAVE10` | 10% | Standard discount |
| `SAVE20` | 20% | Better discount |
| `WELCOME` | 15% | New customer offer |
| `STUDENT` | 25% | Student discount |
| `FREESHIP` | 5% | Free shipping |
| `BLACKFRIDAY` | 30% | Black Friday sale |
| `VIP` | 40% | VIP member discount |
| `FIRST50` | 50% | First purchase special |

---

## 🎨 Customization

### Adding Your Own Promo Codes

Edit `shopit.js` around line 270:

```javascript
const promoCodes = {
  'SAVE10': { discount: 0.10, description: '10% off' },
  
  // Add your custom codes here:
  'MYCODE': { discount: 0.35, description: 'My custom 35% off' },
  'HOLIDAY': { discount: 0.40, description: 'Holiday special' }
};
```

**Discount values:**
- `0.10` = 10% off
- `0.25` = 25% off
- `0.50` = 50% off
- `1.00` = 100% off (free!)

### Changing Tax Rate

Edit `shopit.js` around line 85:

```javascript
const tax = subtotal * 0.08; // Change 0.08 to your tax rate
```

### Styling Modifications

Edit `styles.css` to customize:
- Colors
- Fonts
- Button styles
- Layout spacing
- Animations

---

## 💡 JavaScript Concepts

This project demonstrates key JavaScript patterns:

### Closures for Data Encapsulation

```javascript
function createCart() {
  let items = [];  // Private variable
  
  return {
    getItems: () => [...items],  // Closure accessing private data
    addItem: (item) => { items.push(item); }
  };
}
```

### Callbacks for Async Operations

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
items.map(item => `<div>${item.name}</div>`)
items.reduce((sum, item) => sum + item.price, 0)
items.filter(item => item.quantity > 0)
```

---

## 🔌 API Documentation

### Backend Endpoints

#### POST `/api/checkout`
Save order to database.

**Request Body:**
```json
{
  "items": [
    {"id": "xyz", "name": "Product", "price": 25.00, "quantity": 2}
  ],
  "totals": {
    "subtotal": 50.00,
    "tax": 4.00,
    "finalTotal": 54.00
  },
  "promoCode": "SAVE20",
  "timestamp": "2025-11-20T03:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": 1,
  "message": "Order saved successfully"
}
```

#### GET `/api/orders`
Retrieve all orders from database.

**Response:**
```json
[
  {
    "id": 1,
    "data": {...},
    "total": 54.00,
    "promoCode": "SAVE20",
    "createdAt": "2025-11-20 03:00:00"
  }
]
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_data TEXT NOT NULL,
  total_amount REAL NOT NULL,
  promo_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Viewing Orders

```bash
# Using SQLite CLI
sqlite3 shopit.db "SELECT * FROM orders;"

# Count total orders
sqlite3 shopit.db "SELECT COUNT(*) FROM orders;"

# View recent orders
sqlite3 shopit.db "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;"
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Add custom item with image
- [ ] Increase/decrease item quantity
- [ ] Remove individual items
- [ ] Apply valid promo code
- [ ] Apply invalid promo code
- [ ] View discount breakdown
- [ ] Complete checkout
- [ ] Reset cart
- [ ] Verify localStorage persistence (refresh page)
- [ ] Check database for saved orders

### Test Scenario

1. Add "Laptop" ($1000) and "Mouse" ($25)
2. Apply "SAVE20" code (20% off)
3. Expected totals:
   - Subtotal: $1,025.00
   - Tax (8%): $82.00
   - Discount: -$221.40
   - Final Total: $885.60
4. Checkout and verify order in database

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add some amazing feature"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style Guidelines

- Use ES6+ JavaScript features
- Add comments for complex logic
- Follow existing code formatting
- Test before submitting PR
- Update README if adding features

---

## 🐛 Troubleshooting

### Backend Issues

**"No suitable driver found for jdbc:sqlite"**
- Ensure `sqlite-jdbc-3.45.0.0.jar` is in the same directory
- Check classpath syntax (`;` for Windows, `:` for macOS/Linux)

**"Port 8080 already in use"**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8080 | xargs kill
```

### Frontend Issues

**Toast notifications not showing**
- Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
- Check browser console for errors
- Verify CSS file loaded correctly

**Cart not persisting**
- Check browser localStorage is enabled
- Clear site data and try again

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Project created for Web Technology Workshop
- Inspired by modern e-commerce platforms
- Built with focus on JavaScript fundamentals
- No frameworks used - pure vanilla JavaScript

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/shopit-cart?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/shopit-cart?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/shopit-cart)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/shopit-cart)

---

## 🎯 Future Enhancements

- [ ] User authentication system
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email order confirmations
- [ ] Admin dashboard
- [ ] Product search functionality
- [ ] Wish list feature
- [ ] Order history for users
- [ ] Multiple product categories
- [ ] Product reviews and ratings

---

**⭐ Star this repository if you found it helpful!**

**🐛 Found a bug? [Open an issue](https://github.com/yourusername/shopit-cart/issues)**

**💬 Have questions? Start a [discussion](https://github.com/yourusername/shopit-cart/discussions)**
