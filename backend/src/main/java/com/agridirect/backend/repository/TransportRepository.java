package com.agridirect.backend.repository;

import com.agridirect.backend.entity.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Long> {
    Optional<Transport> findByTrackingId(String trackingId);
    Optional<Transport> findByTransactionId(Long transactionId);
    List<Transport> findByStatus(Transport.DeliveryStatus status);
}
