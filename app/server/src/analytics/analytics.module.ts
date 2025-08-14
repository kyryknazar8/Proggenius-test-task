import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsGateway } from './gateways/analytics.gateway';
import { AnalyticsController } from './controllers/analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyPress } from './entities/key-press.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KeyPress])],
  providers: [AnalyticsService, AnalyticsGateway],
  controllers: [AnalyticsController],
  exports: [AnalyticsService, AnalyticsGateway],
})
export class AnalyticsModule {}
