import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyPress } from '../entities/key-press.entity';
import { Interval } from '@nestjs/schedule';
import { AnalyticsGateway } from '../gateways/analytics.gateway';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private keyCounts = new Map<string, number>();
  private keyPressBuffer: { key: string }[] = [];

  constructor(
    @InjectRepository(KeyPress)
    private readonly keyPressRepository: Repository<KeyPress>,
    private readonly analyticsGateway: AnalyticsGateway,
  ) {}

  // При старті завантажуємо початкову статистику з бд
  async onModuleInit() {
    console.log('Initializing statistics from DB...');
    const stats = await this.getStatsFromDb();
    this.keyCounts = new Map(stats.map((s) => [s.key, Number(s.count)]));
    console.log('Statistics initialized.');
  }

  async handleKeyPress(key: string): Promise<void> {
    this.keyPressBuffer.push({ key });

    const currentCount = this.keyCounts.get(key) || 0;
    this.keyCounts.set(key, currentCount + 1);

    this.broadcastStatsUpdate();
  }

  // Кожні 10 секунд зберігаємо статистику в бд
  @Interval(10000)
  async saveBufferToDb() {
    if (this.keyPressBuffer.length === 0) {
      return;
    }

    console.log(`Saving ${this.keyPressBuffer.length} keys to DB...`);
    const bufferToSave = [...this.keyPressBuffer];
    this.keyPressBuffer = [];

    try {
      const entities = bufferToSave.map((item) =>
        this.keyPressRepository.create(item),
      );

      await this.keyPressRepository.save(entities);
      console.log('Buffer saved successfully.');
    } catch (error) {
      console.error('Failed to save buffer to DB', error);
      // Повертаємо дані назад у буфер якщо помилка
      this.keyPressBuffer.unshift(...bufferToSave);
    }
  }

  broadcastStatsUpdate() {
    const statsForClient = Array.from(this.keyCounts.entries()).map(
      ([key, count]) => ({ key, count }),
    );
    statsForClient.sort((a, b) => b.count - a.count);
    this.analyticsGateway.server.emit('statsUpdate', statsForClient);
  }

  async getStats(): Promise<{ key: string; count: number }[]> {
    return Array.from(this.keyCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  }

  private async getStatsFromDb(): Promise<{ key: string; count: string }[]> {
    return this.keyPressRepository
      .createQueryBuilder('key_press')
      .select('key_press.key', 'key')
      .addSelect('COUNT(key_press.key)', 'count')
      .groupBy('key_press.key')
      .getRawMany();
  }

  // Методи для Додаткового завдання №2
  async getKeyDetails(
    key: string,
  ): Promise<{ key: string; count: number } | null> {
    const count = this.keyCounts.get(key);
    return count ? { key, count } : null;
  }

  async getNeighbourKeys(
    key: string,
  ): Promise<{ prev: string | null; next: string | null }> {
    const sortedKeys = Array.from(this.keyCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([keyName]) => keyName);

    const currentIndex = sortedKeys.indexOf(key);
    if (currentIndex === -1) {
      return { prev: null, next: null };
    }

    const prev = currentIndex > 0 ? sortedKeys[currentIndex - 1] : null;
    const next =
      currentIndex < sortedKeys.length - 1
        ? sortedKeys[currentIndex + 1]
        : null;

    return { prev, next };
  }
}
