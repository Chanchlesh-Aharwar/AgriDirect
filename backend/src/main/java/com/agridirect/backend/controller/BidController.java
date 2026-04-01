package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Bid;
import com.agridirect.backend.entity.Lot;
import com.agridirect.backend.repository.BidRepository;
import com.agridirect.backend.repository.LotRepository;
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
    public List<Bid> getBidsForLot(@PathVariable Long lotId) {
        return bidRepository.findTopBidsByLotId(lotId);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<Bid> getRestaurantBids(@PathVariable Long restaurantId) {
        return bidRepository.findByRestaurantId(restaurantId);
    }

    @PostMapping
    public Bid placeBid(@RequestBody Bid bid) {
        Lot lot = lotRepository.findById(bid.getLotId()).orElseThrow();
        
        if (lot.getStatus() != Lot.Status.OPEN) {
            throw new RuntimeException("Lot is not open for bidding");
        }

        if (bid.getBidAmount().compareTo(lot.getCurrentPrice()) <= 0) {
            throw new RuntimeException("Bid must be higher than current price");
        }

        Bid savedBid = bidRepository.save(bid);
        
        lot.setCurrentPrice(bid.getBidAmount());
        lotRepository.save(lot);

        return savedBid;
    }

    @PutMapping("/{bidId}/accept")
    public Bid acceptBid(@PathVariable Long bidId) {
        Bid bid = bidRepository.findById(bidId).orElseThrow();
        Lot lot = lotRepository.findById(bid.getLotId()).orElseThrow();
        
        lot.setStatus(Lot.Status.SOLD);
        
        BigDecimal finalTotalPrice = calculateFinalPrice(lot.getQuantity(), lot.getUnit(), bid.getBidAmount());
        lot.setTotalPrice(finalTotalPrice);
        
        lotRepository.save(lot);
        
        bid.setStatus(Bid.Status.ACCEPTED);
        return bidRepository.save(bid);
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
    public Bid getHighestBid(@PathVariable Long lotId) {
        return bidRepository.findHighestBid(lotId).orElse(null);
    }
}
