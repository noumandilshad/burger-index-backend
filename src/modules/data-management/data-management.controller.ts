import { Controller, Get, Put, Query } from '@nestjs/common';
import { DataManagementService } from './data-management.service';
import { Product } from './entities/product.entity';
import { Promotion } from './entities/promotion.entity';
import { Rating } from './entities/ratting.entity';
import { Restaurant } from './entities/restaurant.entity';
import { ElasticSearchService } from './elastic-search.service';

@Controller('data-management')
export class DataManagementController {
  constructor(
    private readonly dataManagementService: DataManagementService,
    private readonly elasticSearchService: ElasticSearchService,
  ) {}

  @Get('products')
  async getAllProducts(): Promise<Product[]> {
    return await this.dataManagementService.getAllProducts();
  }

  @Get('promotions')
  async getAllPromotions(): Promise<Promotion[]> {
    return await this.dataManagementService.getAllPromotions();
  }

  @Get('rattings')
  async getAllRatings(): Promise<Rating[]> {
    return await this.dataManagementService.getAllRatings();
  }

  @Get('restaurants')
  async getAllRestaurants(): Promise<Restaurant[]> {
    return await this.dataManagementService.getAllRestaurants();
  }

  @Get('search')
  async search(
    @Query('index') index: string,
    @Query('query') query: string,
    @Query('fields') fields: any,
  ): Promise<any> {
    const searchQuery = fields.map((field) => ({ match: { [field]: query } }));

    console.log({ searchQuery });

    return await this.elasticSearchService.search(index, searchQuery);
  }
}
