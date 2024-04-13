import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataProcessModule } from './modules/data-processor/data-processor.module';
import { Restaurant } from './modules/data-management/entities/restaurant.entity';
import { Promotion } from './modules/data-management/entities/promotion.entity';
import { Rating } from './modules/data-management/entities/ratting.entity';
import { Product } from './modules/data-management/entities/product.entity';
import { DataManagementModule } from './modules/data-management/data-management.module';

@Module({
  imports: [
    DataProcessModule,
    DataManagementModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      entities: [Restaurant, Promotion, Rating, Product],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
