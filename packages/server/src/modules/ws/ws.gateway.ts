import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    client.emit('connected', { clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('subscribe:blueprint')
  handleSubscribeBlueprint(client: Socket, payload: { blueprintId: number }) {
    client.join(`blueprint:${payload.blueprintId}`);
    client.emit('subscribed', { channel: `blueprint:${payload.blueprintId}` });
  }

  @SubscribeMessage('subscribe:host')
  handleSubscribeHost(client: Socket, payload: { hostId: string }) {
    client.join(`host:${payload.hostId}`);
    client.emit('subscribed', { channel: `host:${payload.hostId}` });
  }

  @SubscribeMessage('subscribe:install')
  handleSubscribeInstall(client: Socket, payload: { taskId: number }) {
    client.join(`install:${payload.taskId}`);
    client.emit('subscribed', { channel: `install:${payload.taskId}` });
  }

  // ── Broadcast helpers ──────────────────────────────────
  broadcastBlueprintUpdate(blueprintId: number, event: string, data: any) {
    this.server.to(`blueprint:${blueprintId}`).emit(event, data);
  }

  broadcastHostUpdate(hostId: string, event: string, data: any) {
    this.server.to(`host:${hostId}`).emit(event, data);
  }

  broadcastInstallProgress(taskId: number, progress: number, log: string) {
    this.server.to(`install:${taskId}`).emit('install:progress', { taskId, progress, log });
  }

  broadcastInstallComplete(taskId: number) {
    this.server.to(`install:${taskId}`).emit('install:complete', { taskId });
  }

  broadcastAlert(ruleId: number, hostId: string, value: number, severity: string) {
    this.server.emit('alert:triggered', { ruleId, hostId, value, severity, timestamp: new Date().toISOString() });
  }

  broadcastHealthUpdate(status: string, version: string) {
    this.server.emit('health:update', { status, version });
  }

  getClientCount(): number {
    return this.connectedClients.size;
  }
}
