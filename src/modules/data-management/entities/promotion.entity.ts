// promotion.entity.ts
import { Entity, ManyToOne, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  uuid: number;

  @Column()
  id: string;

  @Column()
  date: string;

  @Column({ nullable: true })
  endDate: string | null;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  discountPercent: string | null;

  @Column({ nullable: true })
  price: string | null;

  @Column({ nullable: true })
  mov: string | null;

  @Column()
  restaurantFunded: boolean;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.promotions)
  restaurant: Restaurant;

  // Add other columns as per schema
}
