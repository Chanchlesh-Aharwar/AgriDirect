package com.agridirect.backend.controller;

import com.agridirect.backend.entity.User;
import com.agridirect.backend.repository.UserRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository repo, PasswordEncoder encoder){
        this.repo = repo;
        this.encoder = encoder;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user){

        if(repo.findByEmail(user.getEmail()).isPresent()){
            return "Email already exists";
        }

        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);

        return "Registered Successfully";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user){

        User dbUser = repo.findByEmail(user.getEmail()).orElseThrow();

        if(encoder.matches(user.getPassword(), dbUser.getPassword())){
            return "Login Success";
        }

        return "Invalid Credentials";
    }

    @GetMapping("/test")
    public String test(){
        return "Backend Working ✅";
    }
}