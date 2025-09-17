import { useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { config } from "../../../config";

export function useHubConnection() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${config.serverUrl}/hubs/chat`, {
        withCredentials: true, // Important for cookie-based auth
      })
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await newConnection.start();
        setConnection(newConnection);
        setIsConnected(true);
        console.log("SignalR Connected");
      } catch (error) {
        console.error("SignalR Connection Error:", error);
        setIsConnected(false);
      }
    };

    const stopConnection = async () => {
      try {
        await newConnection.stop();
        setConnection(null);
        setIsConnected(false);
        console.log("SignalR Disconnected");
      } catch (error) {
        console.error("SignalR Disconnect Error:", error);
      }
    };

    // Start connection
    startConnection();

    // Cleanup on unmount
    return () => {
      stopConnection();
    };
  }, []);

  return { connection, isConnected };
}
