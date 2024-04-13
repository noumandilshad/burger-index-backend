// rating.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  uuid: number;

  @Column()
  rating: string;

  @Column()
  platformStoreRating: string;

  @Column({ type: 'text', nullable: true })
  totalRating: string | null;

  @Column({ nullable: true })
  detailsLabel: string | null;

  @Column({ nullable: true })
  totalRatingLabel: string | null;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.ratingsInfo)
  restaurant: Restaurant;
}
