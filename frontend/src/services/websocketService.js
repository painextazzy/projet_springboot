import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "https://projetspringboot-production.up.railway.app/ws";

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = [];
  }

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      onConnect: () => {
        console.log("WebSocket connecté");
        this.client.subscribe("/topic/commandes", (message) => {
          console.log("WebSocket message reçu:", message.body);
          this.listeners.forEach((listener) => listener());
        });
        this.client.subscribe("/topic/tables", (message) => {
          console.log(" Message tables reçu:", message.body);
          this.tablesListeners.forEach((listener) => listener(message.body));
        });
      },
      onDisconnect: () => {
        console.log("WebSocket déconnecté");
      },
      onStompError: (error) => {
        console.error("STOMP error:", error);
      },
      reconnectDelay: 5000,
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
