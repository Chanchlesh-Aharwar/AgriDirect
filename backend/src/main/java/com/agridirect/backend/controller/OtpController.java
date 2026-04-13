package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Otp;
import com.agridirect.backend.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/otp")
@CrossOrigin(origins = "http://localhost:5173")
public class OtpController {

    @Autowired
    private OtpRepository otpRepository;

    private static final int OTP_VALIDITY_MINUTES = 10;

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String purpose = request.getOrDefault("purpose", "REGISTRATION");

        if (phone == null || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
        }

        phone = phone.trim();
        if (!phone.matches("\\d{10}")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid phone number. Must be 10 digits."));
        }

        otpRepository.findLatestByPhoneAndPurpose(phone, purpose).ifPresent(otpRepository::delete);

        String otp = generateOtp();
        
        Otp otpEntity = new Otp();
        otpEntity.setPhoneNumber(phone);
        otpEntity.setOtpCode(otp);
        otpEntity.setPurpose(purpose);
        otpEntity.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
        otpEntity.setVerified(false);
        
        otpRepository.save(otpEntity);

        System.out.println("=================================================================");
        System.out.println("OTP for " + phone + ": " + otp);
        System.out.println("=================================================================");
        
        return ResponseEntity.ok(Map.of(
            "message", "OTP sent successfully",
            "phone", maskPhone(phone),
            "expiresIn", OTP_VALIDITY_MINUTES + " minutes",
            "debugOtp", otp
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String otp = request.get("otp");
        String purpose = request.getOrDefault("purpose", "REGISTRATION");

        if (phone == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone and OTP are required"));
        }

        Otp otpEntity = otpRepository.findByPhoneAndOtpAndPurpose(phone, otp, purpose)
                .orElse(null);

        if (otpEntity == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }

        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired"));
        }

        if (otpEntity.isVerified()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP already used"));
        }

        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        return ResponseEntity.ok(Map.of(
            "message", "OTP verified successfully",
            "verified", true
        ));
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        request.put("purpose", request.getOrDefault("purpose", "REGISTRATION"));
        return sendOtp(request);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private String maskPhone(String phone) {
        if (phone.length() == 10) {
            return phone.substring(0, 3) + "*****" + phone.substring(8);
        }
        return phone;
    }
}
