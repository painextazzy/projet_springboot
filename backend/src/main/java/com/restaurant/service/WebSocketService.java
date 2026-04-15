package com.restaurant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyCommandeChanged() {
        messagingTemplate.convertAndSend("/topic/commandes", "REFRESH");
    }
    
    // ✅ Méthode existante (sans paramètres)
    public void notifyTableChanged() {
        messagingTemplate.convertAndSend("/topic/tables", "TABLE_UPDATED");
    }
    
    // ✅ NOUVELLE MÉTHODE : avec ID et status
    public void notifyTableChanged(Long tableId, String status) {
        Map<String, Object> data = new HashMap<>();
        data.put("action", "TABLE_UPDATED");
        data.put("tableId", tableId);
        data.put("status", status);
        messagingTemplate.convertAndSend("/topic/tables", data);
    }
    
    public void notifyDataChanged() {
        messagingTemplate.convertAndSend("/topic/commandes", "REFRESH");
        messagingTemplate.convertAndSend("/topic/tables", "TABLE_UPDATED");
    }
}