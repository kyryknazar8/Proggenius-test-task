import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnalyticsService } from '../services/analytics.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class AnalyticsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly analyticsService: AnalyticsService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // Відправляємо статистику новому клієнту
    const stats = await this.analyticsService.getStats();
    client.emit('statsUpdate', stats);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('keyPress')
  async handleKeyPress(
    client: Socket,
    payload: { key: string },
  ): Promise<void> {
    await this.analyticsService.handleKeyPress(payload.key);
  }
}
