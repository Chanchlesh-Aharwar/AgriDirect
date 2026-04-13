package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Bid;
import com.agridirect.backend.entity.Lot;
import com.agridirect.backend.entity.Transaction;
import com.agridirect.backend.repository.BidRepository;
import com.agridirect.backend.repository.LotRepository;
import com.agridirect.backend.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private LotRepository lotRepository;

    @Autowired
    private BidRepository bidRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        return transactionRepository.findById(id)
                .map(t -> ResponseEntity.ok((Object) t))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Transaction> getUserTransactions(@PathVariable Long userId) {
        return transactionRepository.findByWinnerId(userId);
    }

    @GetMapping("/lot/{lotId}")
    public Transaction getTransactionByLot(@PathVariable Long lotId) {
        return transactionRepository.findByLotId(lotId).orElse(null);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createTransaction(@RequestBody CreateTransactionRequest request) {
        Lot lot = lotRepository.findById(request.getLotId()).orElse(null);
        if (lot == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"Lot not found\"}");
        }

        Bid highestBid = bidRepository.findHighestBid(request.getLotId()).orElse(null);
        if (highestBid == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"No bids found for this lot\"}");
        }

        BigDecimal totalUnits = getTotalUnits(lot.getQuantity(), lot.getUnit());
        BigDecimal finalPrice = totalUnits.multiply(highestBid.getBidAmount());
        
        lot.setTotalPrice(finalPrice);
        lot.setStatus(Lot.Status.SOLD);
        lotRepository.save(lot);

        BigDecimal platformFee = finalPrice.multiply(new BigDecimal("0.02"));
        BigDecimal gstAmount = platformFee.multiply(new BigDecimal("0.18"));
        BigDecimal totalAmount = finalPrice.add(platformFee).add(gstAmount);

        Transaction transaction = new Transaction();
        transaction.setLotId(lot.getId());
        transaction.setWinnerId(highestBid.getRestaurantId());
        transaction.setFinalPrice(finalPrice);
        transaction.setPlatformFee(platformFee);
        transaction.setGstAmount(gstAmount);
        transaction.setTotalAmount(totalAmount);
        transaction.setTransactionStatus(Transaction.TransactionStatus.PENDING);

        highestBid.setStatus(Bid.Status.ACCEPTED);
        bidRepository.save(highestBid);

        return ResponseEntity.ok(transactionRepository.save(transaction));
    }

    private BigDecimal getTotalUnits(BigDecimal quantity, Lot.Unit unit) {
        BigDecimal multiplier = switch (unit) {
            case KG -> BigDecimal.ONE;
            case QUINTAL -> new BigDecimal("100");
            case TON -> new BigDecimal("1000");
            default -> BigDecimal.ONE;
        };
        return quantity.multiply(multiplier);
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id) {
        return transactionRepository.findById(id)
                .map(transaction -> {
                    transaction.setTransactionStatus(Transaction.TransactionStatus.PAID);
                    return ResponseEntity.ok(transactionRepository.save(transaction));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> markAsCompleted(@PathVariable Long id) {
        return transactionRepository.findById(id)
                .map(transaction -> {
                    transaction.setTransactionStatus(Transaction.TransactionStatus.COMPLETED);
                    return ResponseEntity.ok(transactionRepository.save(transaction));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class CreateTransactionRequest {
        public Long lotId;

        public Long getLotId() {
            return lotId;
        }

        public void setLotId(Long lotId) {
            this.lotId = lotId;
        }
    }
}
