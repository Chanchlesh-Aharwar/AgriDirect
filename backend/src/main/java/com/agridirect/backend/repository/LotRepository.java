package com.agridirect.backend.repository;

import com.agridirect.backend.entity.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LotRepository extends JpaRepository<Lot, Long> {
    List<Lot> findByFarmerId(Long farmerId);
    List<Lot> findByStatus(Lot.Status status);
    List<Lot> findByStatusNot(Lot.Status status);
    List<Lot> findByStatusAndFarmerId(Lot.Status status, Long farmerId);
}
