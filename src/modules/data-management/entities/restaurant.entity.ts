// restaurant.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Promotion } from './promotion.entity';
import { Rating } from './ratting.entity';
import { Product } from './product.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  uuid: number;

  @Column()
  type: string;

  @Column('decimal', { precision: 10, scale: 8 })
  lat: number;

  @Column('decimal', { precision: 11, scale: 8 })
  lng: number;

  @Column({ nullable: true })
  neighbourhood: string | null;

  @Column({ nullable: true })
  phoneNumberOne: string | null;

  @Column({ nullable: true })
  phoneNumberTwo: string | null;

  @Column()
  cityCode: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  cityName: string | null;

  @Column('json')
  categoryTags: string[];

  @Column()
  scrape_date: string;

  @OneToMany(() => Product, (product) => product.restaurant)
  products: Product[];

  @OneToMany(() => Promotion, (promotion) => promotion.restaurant)
  promotions: Promotion[];

  @OneToMany(() => Rating, (rating) => rating.restaurant)
  ratingsInfo: Rating[];
}
