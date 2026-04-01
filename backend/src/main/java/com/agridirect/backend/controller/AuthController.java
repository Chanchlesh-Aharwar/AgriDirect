package com.agridirect.backend.controller;

import com.agridirect.backend.entity.User;
import com.agridirect.backend.repository.UserRepository;
import com.agridirect.backend.security.jwtutil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (repo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User user = new User();
        user.setName(request.get("name"));
        user.setEmail(email);
        user.setPassword(encoder.encode(request.get("password")));
        user.setRole(request.get("role"));
        user.setPhone(request.get("phone"));

        repo.save(user);

        return ResponseEntity.ok(Map.of("message", "Registered Successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        User dbUser = repo.findByEmail(email).orElse(null);

        if (dbUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        if (!encoder.matches(password, dbUser.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtutil.generateToken(dbUser.getEmail(), dbUser.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", dbUser.getRole(),
                "id", dbUser.getId(),
                "name", dbUser.getName() != null ? dbUser.getName() : ""
        ));
    }
}
