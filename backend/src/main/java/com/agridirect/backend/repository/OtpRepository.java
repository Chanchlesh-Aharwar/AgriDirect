package com.agridirect.backend.repository;

import com.agridirect.backend.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    
    @Query("SELECT o FROM Otp o WHERE o.phoneNumber = :phone AND o.purpose = :purpose AND o.verified = false ORDER BY o.createdAt DESC")
    Optional<Otp> findLatestByPhoneAndPurpose(@Param("phone") String phone, @Param("purpose") String purpose);
    
    @Query("SELECT o FROM Otp o WHERE o.phoneNumber = :phone AND o.otpCode = :otp AND o.purpose = :purpose AND o.verified = false")
    Optional<Otp> findByPhoneAndOtpAndPurpose(@Param("phone") String phone, @Param("otp") String otp, @Param("purpose") String purpose);
    
    void deleteByPhoneNumber(String phoneNumber);
}
