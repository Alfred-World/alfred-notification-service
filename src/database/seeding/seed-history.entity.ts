import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('__seed_history')
export class SeedHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'seeder_name', type: 'varchar', length: 500 })
  seederName: string;

  @Column({ name: 'executed_at', type: 'timestamptz', default: () => 'NOW()' })
  executedAt: Date;

  @Column({ name: 'success', type: 'boolean' })
  success: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'duration_ms', type: 'bigint', default: 0 })
  durationMs: string;
}
