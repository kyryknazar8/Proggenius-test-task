import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('key_presses')
export class KeyPress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @CreateDateColumn()
  timestamp: Date;
}