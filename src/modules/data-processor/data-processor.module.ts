import { Module } from '@nestjs/common';
import { DataProcessorController } from './data-processor.scheduler';
import { DataProcessorService } from './data-processor.service';
import { S3Service } from 'src/services/s3.service';
import { ConfigService } from '@nestjs/config';
import { DataManagementService } from '../data-management/data-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../data-management/entities/product.entity';
import { Promotion } from '../data-management/entities/promotion.entity';
import { Restaurant } from '../data-management/entities/restaurant.entity';
import { Rating } from '../data-management/entities/ratting.entity';
import { ElasticSearchService } from '../data-management/elastic-search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Promotion, Restaurant, Rating])],
  controllers: [DataProcessorController],
  providers: [
    DataProcessorService,
    DataManagementService,
    S3Service,
    ConfigService,
    ElasticSearchService,
  ],
})
export class DataProcessModule {}
