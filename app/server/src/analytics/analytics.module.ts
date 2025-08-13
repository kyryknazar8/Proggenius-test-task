import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsGateway } from './gateways/analytics.gateway';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  providers: [AnalyticsService, AnalyticsGateway],
  controllers: [AnalyticsController]
})
export class AnalyticsModule {}
