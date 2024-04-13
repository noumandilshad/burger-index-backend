import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '@nestjs/config';
import { DataManagementController } from './data-management.controller';
import { DataManagementService } from './data-management.service';
import { S3Service } from 'src/services/s3.service';
import { ElasticSearchService } from './elastic-search.service';

import { Restaurant } from './entities/restaurant.entity';
import { Product } from './entities/product.entity';
import { Promotion } from './entities/promotion.entity';
import { Rating } from './entities/ratting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Promotion, Restaurant, Rating])],
  controllers: [DataManagementController],
  providers: [
    ElasticSearchService,
    DataManagementService,
    S3Service,
    ConfigService,
  ],
})
export class DataManagementModule {}
