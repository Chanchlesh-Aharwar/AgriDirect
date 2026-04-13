package com.agridirect.backend.controller;

import com.agridirect.backend.entity.Message;
import com.agridirect.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping("/transaction/{transactionId}")
    public List<Message> getMessages(@PathVariable Long transactionId) {
        return messageRepository.findByTransactionId(transactionId);
    }

    @GetMapping("/user/{userId}")
    public List<Message> getUserMessages(@PathVariable Long userId) {
        return messageRepository.findByUserId(userId);
    }

    @GetMapping("/unread/{userId}")
    public long getUnreadCount(@PathVariable Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    @GetMapping("/conversations/{userId}")
    public List<Long> getConversations(@PathVariable Long userId) {
        return messageRepository.findDistinctConversations(userId);
    }

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        message.setCreatedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(messageRepository.save(message));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Message> markAsRead(@PathVariable Long id) {
        return messageRepository.findById(id)
                .map(message -> {
                    message.setIsRead(true);
                    return ResponseEntity.ok(messageRepository.save(message));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all/{userId}/{transactionId}")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId, @PathVariable Long transactionId) {
        List<Message> messages = messageRepository.findByTransactionId(transactionId);
        messages.stream()
                .filter(m -> m.getReceiverId().equals(userId) && !m.isIsRead())
                .forEach(m -> {
                    m.setIsRead(true);
                    messageRepository.save(m);
                });
        return ResponseEntity.ok().build();
    }
}
