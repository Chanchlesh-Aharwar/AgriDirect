package com.agridirect.backend.repository;

import com.agridirect.backend.entity.WeatherCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WeatherRepository extends JpaRepository<WeatherCache, Long> {
    Optional<WeatherCache> findByCity(String city);
}
