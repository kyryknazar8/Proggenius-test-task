import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Inject, UsePipes, ValidationPipe, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AnalyticsService } from '../services/analytics.service';
import { KeyPressDto } from '../dto/keyPres.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class AnalyticsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => AnalyticsService))
    private readonly analyticsService: AnalyticsService,
  ) {}

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
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async handleKeyPress(
    client: Socket,
    @MessageBody() payload: KeyPressDto,
  ): Promise<void> {
    await this.analyticsService.handleKeyPress(payload.key);
  }
}
