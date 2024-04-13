// product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  uuid: number;

  @Column()
  platform: string;

  @Column()
  platformProductId: string;

  @Column()
  category: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true, length: 1000 })
  imageUrl: string;

  @Column()
  isAvailable: boolean;

  @Column()
  isPopular: boolean;

  @Column()
  isSoldOut: boolean;

  @Column()
  currency: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  discountedPrice: string | null;

  @Column({ nullable: true })
  discountAmount: string | null;

  @Column({ nullable: true })
  priceDiscountPercent: string | null;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.products)
  restaurant: Restaurant;
}
