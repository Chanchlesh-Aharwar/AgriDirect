package com.agridirect.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lot_id")
    private Long lotId;

    @Column(name = "restaurant_id")
    private Long restaurantId;

    @Column(name = "bid_amount", precision = 12, scale = 2)
    private BigDecimal bidAmount;

    @Column(name = "bid_time")
    private LocalDateTime bidTime = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum Status { PENDING, ACCEPTED, REJECTED }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id", insertable = false, updatable = false)
    private Lot lot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", insertable = false, updatable = false)
    private User restaurant;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public BigDecimal getBidAmount() { return bidAmount; }
    public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }

    public LocalDateTime getBidTime() { return bidTime; }
    public void setBidTime(LocalDateTime bidTime) { this.bidTime = bidTime; }

    public Lot getLot() { return lot; }
    public void setLot(Lot lot) { this.lot = lot; }

    public User getRestaurant() { return restaurant; }
    public void setRestaurant(User restaurant) { this.restaurant = restaurant; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
