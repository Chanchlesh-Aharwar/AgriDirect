package com.agridirect.backend.repository;

import com.agridirect.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE m.transactionId = :transactionId ORDER BY m.createdAt ASC")
    List<Message> findByTransactionId(@Param("transactionId") Long transactionId);
    
    @Query("SELECT m FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId ORDER BY m.createdAt DESC")
    List<Message> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT m.transactionId FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId")
    List<Long> findDistinctConversations(@Param("userId") Long userId);
}
