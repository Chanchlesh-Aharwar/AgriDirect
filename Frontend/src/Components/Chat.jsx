import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import API from "../Services/api";

function Chat({ transactionId, receiverId, senderRole, currentUserId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/transaction/${transactionId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [transactionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await API.post("/messages", {
        transactionId: transactionId,
        senderId: currentUserId,
        receiverId: receiverId,
        content: newMessage,
        senderRole: senderRole
      });
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-card"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "350px",
        maxHeight: "500px",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        overflow: "hidden"
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        borderBottom: "1px solid rgba(58, 95, 64, 0.1)",
        background: "rgba(168, 224, 95, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageCircle size={20} color="var(--deep-moss)" />
          <span style={{ fontWeight: 600, color: "var(--deep-moss)" }}>Chat</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <X size={20} color="var(--text-muted)" />
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  alignSelf: isOwn ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isOwn 
                    ? "linear-gradient(135deg, var(--fresh-leaf), var(--fresh-leaf-dark))"
                    : "rgba(255, 255, 255, 0.8)",
                  color: isOwn ? "var(--deep-moss)" : "var(--text-dark)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ fontSize: "13px", wordBreak: "break-word" }}>{msg.content}</div>
                <div style={{ 
                  fontSize: "10px", 
                  marginTop: "4px", 
                  opacity: 0.7,
                  textAlign: isOwn ? "right" : "left"
                }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{
        display: "flex",
        gap: "8px",
        padding: "12px",
        borderTop: "1px solid rgba(58, 95, 64, 0.1)"
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "20px",
            border: "1px solid rgba(58, 95, 64, 0.2)",
            background: "rgba(255, 255, 255, 0.8)",
            outline: "none",
            fontSize: "14px"
          }}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: "10px",
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, var(--fresh-leaf), var(--fresh-leaf-dark))",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Send size={18} color="var(--deep-moss)" />
        </motion.button>
      </form>
    </motion.div>
  );
}

export default Chat;
