package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Lot;
import com.agridirect.backend.repository.LotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lots")
@CrossOrigin(origins = "http://localhost:5173")
public class LotController {

    @Autowired
    private LotRepository lotRepository;

    @GetMapping
    public List<Lot> getAllOpenLots() {
        return lotRepository.findByStatus(Lot.Status.OPEN);
    }

    @GetMapping("/all")
    public List<Lot> getAllLots() {
        return lotRepository.findAll();
    }

    @GetMapping("/farmer/{farmerId}")
    public List<Lot> getFarmerLots(@PathVariable Long farmerId) {
        return lotRepository.findByFarmerId(farmerId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLotById(@PathVariable Long id) {
        return lotRepository.findById(id)
                .map(lot -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", lot.getId());
                    response.put("farmerId", lot.getFarmerId());
                    response.put("cropName", lot.getCropName());
                    response.put("description", lot.getDescription());
                    response.put("quantity", lot.getQuantity());
                    response.put("unit", lot.getUnit());
                    response.put("basePrice", lot.getBasePrice());
                    response.put("currentPrice", lot.getCurrentPrice());
                    response.put("totalPrice", lot.getTotalPrice());
                    response.put("status", lot.getStatus());
                    response.put("expiryTime", lot.getExpiryTime());
                    response.put("createdAt", lot.getCreatedAt());
                    if (lot.getImageData() != null) {
                        response.put("imageData", Base64.getEncoder().encodeToString(lot.getImageData()));
                    }
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createLot(
            @RequestParam("farmerId") Long farmerId,
            @RequestParam("cropName") String cropName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("quantity") BigDecimal quantity,
            @RequestParam("unit") String unit,
            @RequestParam("basePrice") BigDecimal basePrice,
            @RequestParam("expiryTime") String expiryTime,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            Lot lot = new Lot();
            lot.setFarmerId(farmerId);
            lot.setCropName(cropName);
            lot.setDescription(description);
            lot.setQuantity(quantity);
            lot.setUnit(Lot.Unit.valueOf(unit));
            lot.setBasePrice(basePrice);
            lot.setCurrentPrice(basePrice);
            lot.setStatus(Lot.Status.OPEN);
            lot.setLocation(location);
            
            if (expiryTime != null && !expiryTime.isEmpty()) {
                try {
                    java.time.Instant instant = java.time.Instant.parse(expiryTime);
                    lot.setExpiryTime(instant.atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
                } catch (Exception ex) {
                    lot.setExpiryTime(java.time.LocalDateTime.parse(expiryTime.substring(0, 19)));
                }
            }

            if (image != null && !image.isEmpty()) {
                lot.setImageData(image.getBytes());
            }

            Lot saved = lotRepository.save(lot);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create lot: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lot> updateLot(@PathVariable Long id, @RequestBody Lot lot) {
        return lotRepository.findById(id)
                .map(existing -> {
                    existing.setCropName(lot.getCropName());
                    existing.setDescription(lot.getDescription());
                    existing.setQuantity(lot.getQuantity());
                    existing.setUnit(lot.getUnit());
                    existing.setBasePrice(lot.getBasePrice());
                    existing.setExpiryTime(lot.getExpiryTime());
                    return ResponseEntity.ok(lotRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Lot> closeLot(@PathVariable Long id) {
        return lotRepository.findById(id)
                .map(lot -> {
                    lot.setStatus(Lot.Status.CLOSED);
                    return ResponseEntity.ok(lotRepository.save(lot));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/sold")
    public ResponseEntity<Lot> markAsSold(@PathVariable Long id) {
        return lotRepository.findById(id)
                .map(lot -> {
                    lot.setStatus(Lot.Status.SOLD);
                    return ResponseEntity.ok(lotRepository.save(lot));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLot(@PathVariable Long id) {
        if (lotRepository.existsById(id)) {
            lotRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}