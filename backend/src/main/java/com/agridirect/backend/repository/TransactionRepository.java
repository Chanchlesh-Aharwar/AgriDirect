package com.agridirect.backend.repository;

import com.agridirect.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWinnerId(Long winnerId);
    Optional<Transaction> findByLotId(Long lotId);
    List<Transaction> findByTransactionStatus(Transaction.TransactionStatus status);
}
