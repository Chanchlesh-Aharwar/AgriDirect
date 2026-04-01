package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Lot;
import com.agridirect.backend.repository.LotRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

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

    @GetMapping("/farmer/{farmerId}")
    public List<Lot> getFarmerLots(@PathVariable Long farmerId) {
        return lotRepository.findByFarmerId(farmerId);
    }

    @GetMapping("/{id}")
    public Lot getLotById(@PathVariable Long id) {
        return lotRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public Lot createLot(@RequestBody Lot lot) {
        lot.setStatus(Lot.Status.OPEN);
        lot.setCurrentPrice(lot.getBasePrice());
        
        BigDecimal totalPrice = calculateTotalPrice(lot.getQuantity(), lot.getUnit(), lot.getBasePrice());
        lot.setTotalPrice(totalPrice);
        
        return lotRepository.save(lot);
    }

    private BigDecimal calculateTotalPrice(BigDecimal quantity, Lot.Unit unit, BigDecimal basePrice) {
        BigDecimal multiplier = switch (unit) {
            case KG -> BigDecimal.ONE;
            case QUINTAL -> new BigDecimal("100");
            case TON -> new BigDecimal("1000");
            default -> BigDecimal.ONE;
        };
        return quantity.multiply(multiplier).multiply(basePrice);
    }

    @PutMapping("/{id}")
    public Lot updateLot(@PathVariable Long id, @RequestBody Lot lot) {
        Lot existing = lotRepository.findById(id).orElseThrow();
        existing.setCropName(lot.getCropName());
        existing.setDescription(lot.getDescription());
        existing.setQuantity(lot.getQuantity());
        existing.setUnit(lot.getUnit());
        existing.setBasePrice(lot.getBasePrice());
        existing.setExpiryTime(lot.getExpiryTime());
        return lotRepository.save(existing);
    }

    @PutMapping("/{id}/close")
    public Lot closeLot(@PathVariable Long id) {
        Lot lot = lotRepository.findById(id).orElseThrow();
        lot.setStatus(Lot.Status.CLOSED);
        return lotRepository.save(lot);
    }

    @PutMapping("/{id}/sold")
    public Lot markAsSold(@PathVariable Long id) {
        Lot lot = lotRepository.findById(id).orElseThrow();
        lot.setStatus(Lot.Status.SOLD);
        return lotRepository.save(lot);
    }

    @DeleteMapping("/{id}")
    public void deleteLot(@PathVariable Long id) {
        lotRepository.deleteById(id);
    }
}
