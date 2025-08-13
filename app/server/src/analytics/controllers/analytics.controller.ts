import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Для SEO
  @Get('stats')
  async getInitialStats() {
    return this.analyticsService.getStats();
  }

  // Для статичних сторінок /key/:key
  @Get('key/:key')
  async getKeyData(@Param('key') key: string) {
    const details = await this.analyticsService.getKeyDetails(key);
    if (!details) {
      throw new NotFoundException(`Data for key ${key} not found`);
    }
    const neighbors = await this.analyticsService.getNeighbourKeys(key);
    return {
      ...details,
      navigation: {
        prev: neighbors.prev ? `/key/${neighbors.prev}` : null,
        next: neighbors.prev ? `/key/${neighbors.next}` : null,
      },
    };
  }
}
