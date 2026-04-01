package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Transport;
import com.agridirect.backend.entity.Transaction;
import com.agridirect.backend.repository.TransportRepository;
import com.agridirect.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transport")
@CrossOrigin(origins = "http://localhost:5173")
public class TransportController {

    @Autowired
    private TransportRepository transportRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createTransport(@RequestBody Map<String, Object> request) {
        try {
            Long transactionId = Long.valueOf(request.get("transactionId").toString());
            String deliveryAddress = (String) request.get("deliveryAddress");

            Transaction transaction = transactionRepository.findById(transactionId)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            if (transaction.getTransactionStatus() != Transaction.TransactionStatus.PAID) {
                return ResponseEntity.badRequest().body(Map.of("error", "Transaction must be paid before creating transport"));
            }

            Transport transport = new Transport();
            transport.setTransactionId(transactionId);
            transport.setTrackingId("TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            transport.setDeliveryAddress(deliveryAddress);
            transport.setStatus(Transport.DeliveryStatus.PENDING);
            transport.setEstimatedDelivery(LocalDateTime.now().plusDays(3));

            transport = transportRepository.save(transport);

            return ResponseEntity.ok(transport);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assignDriver(@RequestBody Map<String, String> request) {
        try {
            Long transportId = Long.valueOf(request.get("transportId"));
            String driverName = request.get("driverName");
            String driverPhone = request.get("driverPhone");
            String vehicleNumber = request.get("vehicleNumber");

            Transport transport = transportRepository.findById(transportId)
                    .orElseThrow(() -> new RuntimeException("Transport not found"));

            transport.setDriverName(driverName);
            transport.setDriverPhone(driverPhone);
            transport.setVehicleNumber(vehicleNumber);
            transport.setStatus(Transport.DeliveryStatus.ASSIGNED);

            transportRepository.save(transport);

            return ResponseEntity.ok(transport);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Transport transport = transportRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Transport not found"));

            String statusStr = request.get("status");
            Transport.DeliveryStatus newStatus = Transport.DeliveryStatus.valueOf(statusStr);

            transport.setStatus(newStatus);

            if (newStatus == Transport.DeliveryStatus.DELIVERED) {
                transport.setActualDelivery(LocalDateTime.now());
            }

            transportRepository.save(transport);

            return ResponseEntity.ok(transport);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransport(@PathVariable Long id) {
        return transportRepository.findById(id)
                .map(transport -> ResponseEntity.ok((Object) transport))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tracking/{trackingId}")
    public ResponseEntity<?> getByTrackingId(@PathVariable String trackingId) {
        return transportRepository.findByTrackingId(trackingId)
                .map(transport -> ResponseEntity.ok((Object) transport))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getByTransaction(@PathVariable Long transactionId) {
        return transportRepository.findByTransactionId(transactionId)
                .map(transport -> ResponseEntity.ok((Object) transport))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getByStatus(@PathVariable String status) {
        Transport.DeliveryStatus deliveryStatus = Transport.DeliveryStatus.valueOf(status);
        List<Transport> transports = transportRepository.findByStatus(deliveryStatus);
        return ResponseEntity.ok(transports);
    }
}
