import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics/analytics.service';
import { AnalyticsGateway } from './gateways/analytics/analytics.gateway';
import { AnalyticsController } from './controllers/analytics/analytics.controller';

@Module({
  providers: [AnalyticsService, AnalyticsGateway],
  controllers: [AnalyticsController]
})
export class AnalyticsModule {}
