// src/services/websocketService.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL =
  import.meta.env.VITE_WS_URL ;

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = [];
    this.isConnected = false;
  }

  connect() {
    if (this.client && this.client.active) {
      console.log("WebSocket déjà connecté");
      return;
    }

    console.log("🔌 Connexion à:", WS_URL);

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      onConnect: () => {
        console.log("✅ WebSocket connecté");
        this.isConnected = true;

        // Écouter les commandes
        this.client.subscribe("/topic/commandes", (message) => {
          console.log("📡 Message reçu:", message.body);
          this.listeners.forEach((listener) => listener(message.body));
        });

        // Écouter les tables
        this.client.subscribe("/topic/tables", (message) => {
          console.log("📡 Message tables reçu:", message.body);
          try {
            const data = JSON.parse(message.body);
            this.listeners.forEach((listener) => listener(data));
          } catch (e) {
            this.listeners.forEach((listener) => listener(message.body));
          }
        });
      },
      onDisconnect: () => {
        console.log("WebSocket déconnecté");
        this.isConnected = false;
      },
      onStompError: (error) => {
        console.error("STOMP error:", error);
      },
      reconnectDelay: 5000,
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client && this.client.active) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

export default new WebSocketService();
