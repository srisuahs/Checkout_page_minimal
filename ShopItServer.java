import java.io.*;
import java.net.*;
import java.sql.*;
import java.util.*;
import com.sun.net.httpserver.*;

/**
 * ShopIt JDBC Backend Server - WITH CANCEL AND DELETE ENDPOINTS
 */
public class ShopItServer {
    
    private static final String DB_URL = "jdbc:sqlite:shopit.db";
    
    public static void main(String[] args) throws Exception {
        System.out.println("=== ShopIt Server Starting ===");
        
        // Load SQLite JDBC driver
        try {
            Class.forName("org.sqlite.JDBC");
            System.out.println("✓ SQLite JDBC Driver loaded successfully");
        } catch (ClassNotFoundException e) {
            System.err.println("✗ ERROR: SQLite JDBC Driver not found!");
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
        System.out.println("✓ Endpoints: /api/checkout, /api/orders, /api/orders/{id}/cancel, /api/orders/{id} [DELETE]");
        System.out.println("Press Ctrl+C to stop the server");
        System.out.println("=================================");
    }
    
    private static void initializeDatabase() {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            String sql = "CREATE TABLE IF NOT EXISTS orders (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "order_data TEXT NOT NULL, " +
                "total_amount REAL NOT NULL, " +
                "promo_code TEXT, " +
                "status TEXT DEFAULT 'active', " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
            
            try (Statement stmt = conn.createStatement()) {
                stmt.execute(sql);
                System.out.println("✓ Database initialized successfully");
            }
        } catch (SQLException e) {
            System.err.println("✗ Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    static class CheckoutHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCORSHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            
            if (!"POST".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            
            try {
                String body = readBody(exchange);
                System.out.println("Received checkout request");
                
                double total = extractTotal(body);
                String promo = extractPromo(body);
                int orderId = saveOrder(body, total, promo);
                
                String response = String.format(
                    "{\"success\":true,\"orderId\":%d,\"message\":\"Order saved successfully\"}",
                    orderId
                );
                
                sendResponse(exchange, 200, response);
                System.out.println("✓ Order " + orderId + " saved ($" + total + ")");
                
            } catch (Exception e) {
                System.err.println("✗ Checkout error: " + e.getMessage());
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
        
        private int saveOrder(String data, double total, String promo) throws SQLException {
            String sql = "INSERT INTO orders (order_data, total_amount, promo_code, status) VALUES (?, ?, ?, 'active')";
            
            try (Connection conn = DriverManager.getConnection(DB_URL);
                 PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                
                ps.setString(1, data);
                ps.setDouble(2, total);
                ps.setString(3, promo);
                ps.executeUpdate();
                
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }
            throw new SQLException("Failed to save order");
        }
        
        private double extractTotal(String json) {
            try {
                java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"finalTotal\"\\s*:\\s*(\\d+\\.?\\d*)");
                java.util.regex.Matcher m = p.matcher(json);
                if (m.find()) return Double.parseDouble(m.group(1));
                
                p = java.util.regex.Pattern.compile("\"total\"\\s*:\\s*(\\d+\\.?\\d*)");
                m = p.matcher(json);
                if (m.find()) return Double.parseDouble(m.group(1));
            } catch (Exception e) {}
            return 0.0;
        }
        
        private String extractPromo(String json) {
            try {
                java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"promoCode\"\\s*:\\s*\"([^\"]+)\"");
                java.util.regex.Matcher m = p.matcher(json);
                if (m.find()) return m.group(1);
            } catch (Exception e) {}
            return null;
        }
    }
    
    static class OrdersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCORSHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            
            // Handle DELETE /api/orders/{id}
            if (method.equals("DELETE") && path.matches("/api/orders/\\d+")) {
                handleDeleteOrder(exchange, path);
                return;
            }
            
            // Handle POST /api/orders/{id}/cancel
            if (method.equals("POST") && path.matches("/api/orders/\\d+/cancel")) {
                handleCancelOrder(exchange, path);
                return;
            }
            
            // Handle GET /api/orders
            if (method.equals("GET") && path.equals("/api/orders")) {
                handleGetOrders(exchange);
                return;
            }
            
            sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
        
        private void handleGetOrders(HttpExchange exchange) throws IOException {
            try {
                List<String> orders = getOrders();
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < orders.size(); i++) {
                    if (i > 0) json.append(",");
                    json.append(orders.get(i));
                }
                json.append("]");
                
                sendResponse(exchange, 200, json.toString());
                System.out.println("✓ Retrieved " + orders.size() + " orders");
                
            } catch (Exception e) {
                System.err.println("✗ Orders error: " + e.getMessage());
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
        
        private void handleCancelOrder(HttpExchange exchange, String path) throws IOException {
            try {
                String[] parts = path.split("/");
                int orderId = Integer.parseInt(parts[3]);
                
                boolean success = cancelOrder(orderId);
                
                if (success) {
                    String response = String.format(
                        "{\"success\":true,\"orderId\":%d,\"message\":\"Order cancelled successfully\"}",
                        orderId
                    );
                    sendResponse(exchange, 200, response);
                    System.out.println("✓ Order " + orderId + " cancelled");
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Order not found or already cancelled\"}");
                }
                
            } catch (Exception e) {
                System.err.println("✗ Cancel error: " + e.getMessage());
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
        
        private void handleDeleteOrder(HttpExchange exchange, String path) throws IOException {
            try {
                String[] parts = path.split("/");
                int orderId = Integer.parseInt(parts[3]);
                
                boolean success = deleteOrder(orderId);
                
                if (success) {
                    String response = String.format(
                        "{\"success\":true,\"orderId\":%d,\"message\":\"Order deleted successfully\"}",
                        orderId
                    );
                    sendResponse(exchange, 200, response);
                    System.out.println("✓ Order " + orderId + " deleted");
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
                }
                
            } catch (Exception e) {
                System.err.println("✗ Delete error: " + e.getMessage());
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
        
        private boolean cancelOrder(int orderId) throws SQLException {
            String sql = "UPDATE orders SET status = 'cancelled' WHERE id = ? AND status = 'active'";
            
            try (Connection conn = DriverManager.getConnection(DB_URL);
                 PreparedStatement ps = conn.prepareStatement(sql)) {
                
                ps.setInt(1, orderId);
                int updated = ps.executeUpdate();
                return updated > 0;
            }
        }
        
        private boolean deleteOrder(int orderId) throws SQLException {
            String sql = "DELETE FROM orders WHERE id = ? AND status = 'cancelled'";
            
            try (Connection conn = DriverManager.getConnection(DB_URL);
                 PreparedStatement ps = conn.prepareStatement(sql)) {
                
                ps.setInt(1, orderId);
                int deleted = ps.executeUpdate();
                return deleted > 0;
            }
        }
        
        private List<String> getOrders() throws SQLException {
            List<String> list = new ArrayList<>();
            String sql = "SELECT id, order_data, total_amount, promo_code, status, created_at " +
                        "FROM orders ORDER BY created_at DESC";
            
            try (Connection conn = DriverManager.getConnection(DB_URL);
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {
                
                while (rs.next()) {
                    String promo = rs.getString("promo_code");
                    String status = rs.getString("status");
                    String item = String.format(
                        "{\"id\":%d,\"data\":%s,\"total\":%.2f,\"promoCode\":%s,\"status\":\"%s\",\"createdAt\":\"%s\"}",
                        rs.getInt("id"),
                        rs.getString("order_data"),
                        rs.getDouble("total_amount"),
                        promo != null ? "\"" + promo + "\"" : "null",
                        status != null ? status : "active",
                        rs.getString("created_at")
                    );
                    list.add(item);
                }
            }
            return list;
        }
    }
    
    // Helper methods
    private static String readBody(HttpExchange exchange) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), "UTF-8"))) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }
    
    private static void addCORSHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().add("Access-Control-Max-Age", "3600");
    }
    
    private static void sendResponse(HttpExchange exchange, int code, String resp) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        byte[] bytes = resp.getBytes("UTF-8");
        exchange.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
