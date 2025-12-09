package in.ethiccode.paymentservice.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Controller
public class IndexController {

    // Fallback: serve index.html for root and SPA routes
    @GetMapping(value = {"/", "/{path:[^\\.]*}", "/**/{path:[^\\.]*}"})
    public ResponseEntity<?> serveIndex() {
        try {
            Resource resource = new ClassPathResource("/static/index.html");
            if (resource.exists()) {
                String content = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(content);
            } else {
                // If React build doesn't exist, return a simple message
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body("""
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Payment Service API</title>
                                <style>
                                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                                    h1 { color: #333; }
                                    .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
                                    code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
                                </style>
                            </head>
                            <body>
                                <h1>💳 Payment Microservice API</h1>
                                <p>Backend is running! Frontend build is not available.</p>
                                <h2>Available Endpoints:</h2>
                                <div class="endpoint">
                                    <strong>GET</strong> <code>/ping</code> - Health check
                                </div>
                                <div class="endpoint">
                                    <strong>POST</strong> <code>/api/v1/payments/init</code> - Initiate payment
                                </div>
                                <div class="endpoint">
                                    <strong>POST</strong> <code>/api/v1/payments/verify</code> - Verify payment
                                </div>
                                <div class="endpoint">
                                    <strong>GET</strong> <code>/api/v1/payments/status/{orderId}</code> - Get payment status
                                </div>
                                <div class="endpoint">
                                    <strong>POST</strong> <code>/api/v1/payments/webhook</code> - Webhook endpoint
                                </div>
                            </body>
                            </html>
                            """);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error loading frontend");
        }
    }
}

