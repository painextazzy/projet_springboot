// src/services/websocketService.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "https://projetspringboot-production.up.railway.app/ws";

class WebSocketService {
  constructor() {
    this.client = null;
    this.tableListeners = [];
    this.commandesListeners = [];
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
          console.log("📡 Message commandes reçu:", message.body);
          this.commandesListeners.forEach((listener) => listener(message.body));
        });

        // Écouter les tables
        this.client.subscribe("/topic/tables", (message) => {
          console.log("📡 Message tables reçu:", message.body);
          try {
            const data = JSON.parse(message.body);
            this.tableListeners.forEach((listener) => listener(data));
          } catch (e) {
            // Si c'est une simple string (pas de JSON)
            this.tableListeners.forEach((listener) => listener(message.body));
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

  subscribeToTables(callback) {
    this.tableListeners.push(callback);
    return () => {
      this.tableListeners = this.tableListeners.filter((cb) => cb !== callback);
    };
  }

  subscribeToCommandes(callback) {
    this.commandesListeners.push(callback);
    return () => {
      this.commandesListeners = this.commandesListeners.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // Compatibilité
  subscribe(callback) {
    this.tableListeners.push(callback);
    this.commandesListeners.push(callback);
    return () => {
      this.tableListeners = this.tableListeners.filter((cb) => cb !== callback);
      this.commandesListeners = this.commandesListeners.filter(
        (cb) => cb !== callback,
      );
    };
  }
}

export default new WebSocketService();
