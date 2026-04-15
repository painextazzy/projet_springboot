import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ✅ Valeur par défaut si la variable d'environnement n'existe pas
const WS_URL = import.meta.env.VITE_WS_URL;

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = []; // Pour les commandes
    this.tablesListeners = []; // Pour les tables
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

        // Subscribe aux commandes
        this.client.subscribe("/topic/commandes", () => {
          console.log("📡 Message commandes reçu");
          this.listeners.forEach((listener) => listener());
        });

        // Subscribe aux tables
        this.client.subscribe("/topic/tables", () => {
          console.log("📡 Message tables reçu");
          this.tablesListeners.forEach((listener) => listener());
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

  // Pour les commandes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  // Pour les tables
  subscribeToTables(callback) {
    this.tablesListeners.push(callback);
    return () => {
      this.tablesListeners = this.tablesListeners.filter(
        (cb) => cb !== callback,
      );
    };
  }
}

export default new WebSocketService();
