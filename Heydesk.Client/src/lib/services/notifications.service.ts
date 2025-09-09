import * as signalR from "@microsoft/signalr";
import { config } from "../../../config";

export type Notification = {
  title: string;
  message: string;
  timestamp: string;
  correlationId?: string | null;
};

let connection: signalR.HubConnection | null = null;
let onAny: ((n: Notification) => void) | null = null;

export const notifications = {
  async start() {
    if (connection) return;
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.serverUrl}/hubs/notifications`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connection.onreconnecting((err) => {
      console.debug("[notifications] reconnecting", err?.message);
    });
    connection.onreconnected((cid) => {
      console.debug("[notifications] reconnected", cid);
    });
    connection.onclose((err) => {
      console.debug("[notifications] closed", err?.message);
    });

    connection.on("Notify", (notification: Notification) => {
      console.debug("[notifications] Notify received", notification);
      try {
        if (onAny) onAny(notification);
      } catch {}
    });

    await connection.start();
    console.debug("[notifications] started", connection.connectionId);
  },

  stop() {
    if (connection) {
      connection.stop();
      connection = null;
    }
  },

  onAny(handler: (n: Notification) => void) {
    onAny = handler;
    return () => {
      if (onAny === handler) onAny = null;
    };
  },
  async joinOrganization(organizationId: string) {
    // @ts-ignore
    await (connection as any)?.invoke?.("JoinOrganization", organizationId);
    console.debug("[notifications] joined org", organizationId);
  },
  async leaveOrganization(organizationId: string) {
    // @ts-ignore
    await (connection as any)?.invoke?.("LeaveOrganization", organizationId);
    console.debug("[notifications] left org", organizationId);
  },
};


