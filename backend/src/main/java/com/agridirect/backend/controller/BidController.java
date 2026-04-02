package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Bid;
import com.agridirect.backend.entity.Lot;
import com.agridirect.backend.repository.BidRepository;
import com.agridirect.backend.repository.LotRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "http://localhost:5173")
public class BidController {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private LotRepository lotRepository;

    @GetMapping("/lot/{lotId}")
    public ResponseEntity<List<Bid>> getBidsForLot(@PathVariable Long lotId) {
        List<Bid> bids = bidRepository.findByLotId(lotId);
        return ResponseEntity.ok(bids);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Bid>> getRestaurantBids(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(bidRepository.findByRestaurantId(restaurantId));
    }

    @PostMapping
    public ResponseEntity<?> placeBid(@RequestBody Bid bid) {
        Lot lot = lotRepository.findById(bid.getLotId()).orElse(null);
        if (lot == null) {
            return ResponseEntity.badRequest().body("Lot not found");
        }
        
        if (lot.getStatus() != Lot.Status.OPEN) {
            return ResponseEntity.badRequest().body("Lot is not open for bidding");
        }

        if (bid.getBidAmount().compareTo(lot.getCurrentPrice()) <= 0) {
            return ResponseEntity.badRequest().body("Bid must be higher than current price");
        }

        Bid savedBid = bidRepository.save(bid);
        
        lot.setCurrentPrice(bid.getBidAmount());
        lotRepository.save(lot);

        return ResponseEntity.ok(savedBid);
    }

    @PutMapping("/{bidId}/accept")
    public ResponseEntity<?> acceptBid(@PathVariable Long bidId) {
        Bid bid = bidRepository.findById(bidId).orElse(null);
        if (bid == null) {
            return ResponseEntity.notFound().build();
        }
        
        Lot lot = lotRepository.findById(bid.getLotId()).orElse(null);
        if (lot == null) {
            return ResponseEntity.badRequest().body("Lot not found");
        }
        
        lot.setStatus(Lot.Status.SOLD);
        
        BigDecimal finalTotalPrice = calculateFinalPrice(lot.getQuantity(), lot.getUnit(), bid.getBidAmount());
        lot.setTotalPrice(finalTotalPrice);
        
        lotRepository.save(lot);
        
        bid.setStatus(Bid.Status.ACCEPTED);
        return ResponseEntity.ok(bidRepository.save(bid));
    }

    private BigDecimal calculateFinalPrice(BigDecimal quantity, Lot.Unit unit, BigDecimal finalBidAmount) {
        BigDecimal multiplier = switch (unit) {
            case KG -> BigDecimal.ONE;
            case QUINTAL -> new BigDecimal("100");
            case TON -> new BigDecimal("1000");
            default -> BigDecimal.ONE;
        };
        return quantity.multiply(multiplier).multiply(finalBidAmount);
    }

    @GetMapping("/highest/{lotId}")
    public ResponseEntity<Bid> getHighestBid(@PathVariable Long lotId) {
        return bidRepository.findHighestBid(lotId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
