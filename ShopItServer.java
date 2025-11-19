import java.io.*;
import java.net.*;
import java.sql.*;
import java.util.*;
import com.sun.net.httpserver.*;

/**
 * ShopIt JDBC Backend Server
 * Uses SQLite database with JDBC for cart persistence
 */
public class ShopItServer {
    
    private static final String DB_URL = "jdbc:sqlite:shopit.db";
    
    public static void main(String[] args) throws Exception {
        System.out.println("=== ShopIt Server Starting ===");
        
        // Explicitly load SQLite JDBC driver
        try {
            Class.forName("org.sqlite.JDBC");
            System.out.println("✓ SQLite JDBC Driver loaded successfully");
        } catch (ClassNotFoundException e) {
            System.err.println("✗ ERROR: SQLite JDBC Driver not found!");
            System.err.println("Make sure sqlite-jdbc-3.45.0.0.jar is in the classpath");
            System.exit(1);
        }
        
        // Initialize database
        initializeDatabase();
        
        // Create HTTP server
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/api/checkout", new CheckoutHandler());
        server.createContext("/api/orders", new OrdersHandler());
        server.setExecutor(null);
        server.start();
        
        System.out.println("✓ ShopIt JDBC Server started on http://localhost:8080");
        System.out.println("✓ Database: shopit.db");
        System.out.println("Press Ctrl+C to stop the server");
        System.out.println("=================================");
    }
    
    /**
     * Initialize SQLite database and create orders table
     */
    private static void initializeDatabase() {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            String createTableSQL = 
                "CREATE TABLE IF NOT EXISTS orders (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "order_data TEXT NOT NULL, " +
                "total_amount REAL NOT NULL, " +
                "promo_code TEXT, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
            
            try (Statement stmt = conn.createStatement()) {
                stmt.execute(createTableSQL);
                System.out.println("✓ Database initialized successfully");
            }
        } catch (SQLException e) {
            System.err.println("✗ Database initialization error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Handler for checkout API endpoint
     * POST /api/checkout
     */
    static class CheckoutHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCORSHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            
            if (!"POST".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
                return;
            }
            
            try {
                String requestBody = readRequestBody(exchange);
                System.out.println("Received checkout request");
                
                double totalAmount = extractTotalFromJSON(requestBody);
                String promoCode = extractPromoCodeFromJSON(requestBody);
                int orderId = saveOrder(requestBody, totalAmount, promoCode);
                
                String response = String.format(
                    "{\"success\": true, \"orderId\": %d, \"message\": \"Order saved successfully\"}",
                    orderId
                );
                sendResponse(exchange, 200, response);
                System.out.println("✓ Order " + orderId + " saved successfully (Total: $" + totalAmount + ")");
                
            } catch (Exception e) {
                System.err.println("✗ Checkout error: " + e.getMessage());
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\": \"Checkout failed\"}");
            }
        }
        
        /**
         * Save order to database using JDBC
         */
        private int saveOrder(String orderData, double totalAmount, String promoCode) throws SQLException {
            String insertSQL = "INSERT INTO orders (order_data, total_amount, promo_code) VALUES (?, ?, ?)";
            
            try (Connection conn = DriverManager.getConnection(DB_URL);
                 PreparedStatement pstmt = conn.prepareStatement(insertSQL, Statement.RETURN_GENERATED_KEYS)) {
                
                pstmt.setString(1, orderData);
                pstmt.setDouble(2, totalAmount);
                pstmt.setString(3, promoCode);
                pstmt.executeUpdate();
                
                try (ResultSet rs = pstmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
                throw new SQLException("Failed to save order");
            }
        }
        
        /**
         * Extract total amount from JSON
         */
        private double extractTotalFromJSON(String json) {
            try {
                // Look for finalTotal first (with discount), then total
                String finalTotalPattern = "\"finalTotal\"\\s*:\\s*(\\d+\\.?\\d*)";
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(finalTotalPattern);
                java.util.regex.Matcher matcher = pattern.matcher(json);
                
                if (matcher.find()) {
                    return Double.parseDouble(matcher.group(1));
                }
                
                // Fallback to regular total
                String totalPattern = "\"total\"\\s*:\\s*(\\d+\\.?\\d*)";
                pattern = java.util.regex.Pattern.compile(totalPattern);
                matcher = pattern.matcher(json);
                
                if (matcher.find()) {
                    return Double.parseDouble(matcher.group(1));
                }
                
                return 0.0;
            } catch (Exception e) {
                return 0.0;
            }
        }
        
        /**
         * Extract promo code from JSON
         */
        private String extractPromoCodeFromJSON(String json) {
            try {
                String promoPattern = "\"promoCode\"\\s*:\\s*\"([^\"]+)\"";
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(promoPattern);
                java.util.regex.Matcher matcher = pattern.matcher(json);
                
                if (matcher.find()) {
                    return matcher.group(1);
                }
                return null;
            } catch (Exception e) {
                return null;
            }
        }
    }
    
    /**
     * Handler for orders retrieval endpoint
     * GET /api/orders
     */
    static class OrdersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCORSHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            
            if (!"GET".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
                return;
            }
            
            try {
                List<String> orders = getAllOrders();
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < orders.size(); i++) {
                    if (i > 0) json.append(",");
                    json.append(orders.get(i));
                }
                json.append("]");
                sendResponse(exchange, 200, json.toString());
            } catch (Exception e) {
                System.err.println("✗ Orders retrieval error: " + e.getMessage());
                sendResponse(exchange, 500, "{\"error\": \"Failed to retrieve orders\"}");
            }
        }
        
        /**
         * Get all orders from database using JDBC
         */
        private List<String> getAllOrders() throws SQLException {
            List<String> orders = new ArrayList<>();
            String selectSQL = "SELECT id, order_data, total_amount, promo_code, created_at FROM orders ORDER BY created_at DESC";
            
            try (Connection conn = DriverManager.getConnection(DB_URL);
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(selectSQL)) {
                
                while (rs.next()) {
                    String promoCode = rs.getString("promo_code");
                    String orderJson = String.format(
                        "{\"id\": %d, \"data\": %s, \"total\": %.2f, \"promoCode\": %s, \"createdAt\": \"%s\"}",
                        rs.getInt("id"),
                        rs.getString("order_data"),
                        rs.getDouble("total_amount"),
                        promoCode != null ? "\"" + promoCode + "\"" : "null",
                        rs.getString("created_at")
                    );
                    orders.add(orderJson);
                }
            }
            return orders;
        }
    }
    
    // Helper methods
    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), "UTF-8"))) {
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                body.append(line);
            }
            return body.toString();
        }
    }
    
    private static void addCORSHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }
    
    private static void sendResponse(HttpExchange exchange, int code, String response) 
            throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        byte[] bytes = response.getBytes("UTF-8");
        exchange.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
