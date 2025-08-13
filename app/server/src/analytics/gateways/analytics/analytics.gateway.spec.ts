import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsGateway } from './analytics.gateway';

describe('AnalyticsGateway', () => {
  let gateway: AnalyticsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsGateway],
    }).compile();

    gateway = module.get<AnalyticsGateway>(AnalyticsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
