import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = [];
  }

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        console.log("✅ WebSocket connecté");
        this.client.subscribe("/topic/commandes", (message) => {
          console.log("📡 WebSocket message reçu:", message.body);
          this.listeners.forEach((listener) => listener());
        });
      },
      onDisconnect: () => {
        console.log("WebSocket déconnecté");
      },
      onStompError: (error) => {
        console.error("STOMP error:", error);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
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
