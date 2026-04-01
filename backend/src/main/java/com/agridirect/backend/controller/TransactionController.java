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
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

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
    public Transaction createTransaction(@RequestBody CreateTransactionRequest request) {
        Lot lot = lotRepository.findById(request.getLotId()).orElseThrow();
        Bid highestBid = bidRepository.findHighestBid(request.getLotId()).orElseThrow();

        BigDecimal finalPrice = lot.getTotalPrice() != null ? lot.getTotalPrice() : highestBid.getBidAmount();
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

        lot.setStatus(Lot.Status.SOLD);
        lotRepository.save(lot);

        highestBid.setStatus(Bid.Status.ACCEPTED);
        bidRepository.save(highestBid);

        return transactionRepository.save(transaction);
    }

    @PutMapping("/{id}/pay")
    public Transaction markAsPaid(@PathVariable Long id) {
        Transaction transaction = transactionRepository.findById(id).orElseThrow();
        transaction.setTransactionStatus(Transaction.TransactionStatus.PAID);
        return transactionRepository.save(transaction);
    }

    @PutMapping("/{id}/complete")
    public Transaction markAsCompleted(@PathVariable Long id) {
        Transaction transaction = transactionRepository.findById(id).orElseThrow();
        transaction.setTransactionStatus(Transaction.TransactionStatus.COMPLETED);
        return transactionRepository.save(transaction);
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
