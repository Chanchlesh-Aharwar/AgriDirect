package com.agridirect.backend.controller;

import com.agridirect.backend.entity.User;
import com.agridirect.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public User getProfile(@PathVariable Long id) {
        return userRepository.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public User updateProfile(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userRepository.findById(id).orElseThrow();
        user.setName(updatedUser.getName());
        user.setPhone(updatedUser.getPhone());
        return userRepository.save(user);
    }
}
