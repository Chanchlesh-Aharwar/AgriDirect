package com.agridirect.backend.repository;

import com.agridirect.backend.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByLotId(Long lotId);
    List<Bid> findByRestaurantId(Long restaurantId);
    
    @Query("SELECT b FROM Bid b WHERE b.lotId = :lotId ORDER BY b.bidAmount DESC")
    List<Bid> findTopBidsByLotId(@Param("lotId") Long lotId);
    
    @Query("SELECT b FROM Bid b WHERE b.lotId = :lotId ORDER BY b.bidAmount DESC")
    Optional<Bid> findHighestBid(@Param("lotId") Long lotId);
}
