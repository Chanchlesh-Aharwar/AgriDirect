package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Payment;
import com.agridirect.backend.entity.Transaction;
import com.agridirect.backend.repository.PaymentRepository;
import com.agridirect.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(@RequestBody Map<String, Long> request) {
        try {
            Long transactionId = request.get("transactionId");
            Transaction transaction = transactionRepository.findById(transactionId)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            if (transaction.getTransactionStatus() == Transaction.TransactionStatus.PAID) {
                return ResponseEntity.badRequest().body(Map.of("error", "Transaction already paid"));
            }

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", transaction.getTotalAmount().multiply(new BigDecimal("100")).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + transactionId);

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);

            Payment payment = new Payment();
            payment.setTransactionId(transactionId);
            payment.setRazorpayOrderId(razorpayOrder.get("id"));
            payment.setAmount(transaction.getTotalAmount());
            payment.setStatus(Payment.PaymentStatus.PENDING);
            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("razorpayOrderId", razorpayOrder.get("id"));
            response.put("amount", transaction.getTotalAmount().multiply(new BigDecimal("100")).intValue());
            response.put("currency", "INR");
            response.put("receipt", "txn_" + transactionId);
            response.put("razorpayKey", razorpayKeyId);

            return ResponseEntity.ok(response);

        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment initialization failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
        try {
            String razorpayOrderId = request.get("razorpayOrderId");
            String razorpayPaymentId = request.get("razorpayPaymentId");
            String razorpaySignature = request.get("razorpaySignature");

            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            String generatedSignature = generateSignature(razorpayOrderId + "|" + razorpayPaymentId, razorpayKeySecret);

            if (!generatedSignature.equals(razorpaySignature)) {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setErrorMessage("Signature verification failed");
                paymentRepository.save(payment);
                return ResponseEntity.badRequest().body(Map.of("error", "Payment verification failed"));
            }

            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            Transaction transaction = payment.getTransactionId() != null ?
                    transactionRepository.findById(payment.getTransactionId()).orElse(null) : null;
            if (transaction != null) {
                transaction.setTransactionStatus(Transaction.TransactionStatus.PAID);
                transactionRepository.save(transaction);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getPaymentByTransaction(@PathVariable Long transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .map(payment -> ResponseEntity.ok((Object) payment))
                .orElse(ResponseEntity.notFound().build());
    }

    private String generateSignature(String data, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes());
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature", e);
        }
    }
}
