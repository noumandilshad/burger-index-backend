import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Promotion } from './entities/promotion.entity';
import { Rating } from './entities/ratting.entity';
import { Restaurant } from './entities/restaurant.entity';
import { ElasticSearchService } from './elastic-search.service';

@Injectable()
export class DataManagementService {
  constructor(
    private readonly elasticSearchService: ElasticSearchService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async insertProducts(products): Promise<Product> {
    console.log({
      functionName: 'insertProducts',
      event: 'Function Invoked.',
      params: {
        products,
      },
    });

    if (!products || !products.length) return;

    const mappedProducts = this.mapProducts(products);

    return await this.productRepository.save(mappedProducts);
  }

  async insertPromotions(promotions): Promise<Promotion> {
    console.log({
      functionName: 'insertPromotions',
      event: 'Function Invoked.',
      params: {
        promotions,
      },
    });

    if (!promotions || !promotions.length) return;
    const mappedPromotions = this.mapPromotions(promotions);
    return await this.promotionRepository.save(mappedPromotions);
  }

  async insertRestaurants(restaurant): Promise<Restaurant> {
    console.log({
      functionName: 'insertRestaurants',
      event: 'Function Invoked.',
      params: {
        restaurant,
      },
    });

    if (!restaurant || !restaurant.length) return;
    return await this.promotionRepository.save(restaurant);
  }

  async insertRatings(ratting): Promise<Rating> {
    console.log({
      functionName: 'insertRatings',
      event: 'Function Invoked.',
      params: {
        ratting,
      },
    });

    ratting?.forEach((ratting) => console.log('ratting', ratting));

    if (!ratting || !ratting.length) return;
    return await this.promotionRepository.save(ratting);
  }

  async insertRecord(data) {
    try {
      const restaurantData = {
        type: data.type,
        lat: data.location.lat,
        lng: data.location.lng,
        neighbourhood: data.neighbourhood || null,
        phoneNumberOne: data.phoneNumberOne || null,
        phoneNumberTwo: data.phoneNumberTwo || null,
        cityCode: data.cityCode,
        imageUrl: data.imageUrl,
        cityName: data.cityName || null,
        categoryTags: data.categoryTags,
        scrape_date: data.scrape_date,
      };
      const restaurant = await this.restaurantRepository.save(restaurantData);
      await this.elasticSearchService.indexDocument('restaurants', restaurant);

      const mappedProducts = data.products.map((productData) => {
        const product = new Product();

        product.platform = productData.platform;
        product.platformProductId = productData.platformProductId;
        product.category = productData.category;
        product.name = productData.name;
        product.description = productData.description;
        product.imageUrl = productData.imageUrl;
        product.isAvailable = productData.isAvailable;
        product.isPopular = productData.isPopular;
        product.isSoldOut = productData.isSoldOut;
        product.currency = productData.currency;
        product.price = productData.price;
        product.discountedPrice = productData.discountedPrice;
        product.discountAmount = productData.discountAmount;
        product.priceDiscountPercent = productData.priceDiscountPercent;

        product.restaurant = restaurant;

        return product;
      });
      const products = await this.productRepository.save(mappedProducts);
      products.forEach(
        async (product) =>
          await this.elasticSearchService.indexDocument('products', product),
      );

      const mappedPromotions = data.promotions.map((promotionData) => {
        const promotion = new Promotion();

        promotion.id = promotionData.id;
        promotion.date = promotionData.date;
        promotion.endDate = promotionData.endDate;
        promotion.title = promotionData.title;
        promotion.description = promotionData.description;
        promotion.type = promotionData.type;
        promotion.discountPercent = promotionData.discountPercent;
        promotion.price = promotionData.price;
        promotion.mov = promotionData.mov;
        promotion.restaurantFunded = promotionData.restaurantFunded;
        promotion.restaurant = restaurant;

        return promotion;
      });
      const promotions = await this.promotionRepository.save(mappedPromotions);
      console.log('promotions data', promotions);
      promotions.forEach(
        async (promotion) =>
          await this.elasticSearchService.indexDocument(
            'promotions',
            promotion,
          ),
      );

      const mappedRatings = data.ratingsInfo.map((ratingData) => {
        const rating = new Rating();

        rating.rating = ratingData.rating;
        rating.platformStoreRating = ratingData.platformStoreRating;
        rating.totalRating = ratingData.totalRating;
        rating.detailsLabel = ratingData.detailsLabel;
        rating.totalRatingLabel = ratingData.totalRatingLabel;

        rating.restaurant = restaurant;

        return rating;
      });
      const rattings = await this.ratingRepository.save(mappedRatings);
      rattings.forEach(
        async (ratting) =>
          await this.elasticSearchService.indexDocument('rattings', ratting),
      );

      console.log('Data inserted successfully');
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async getAllPromotions(): Promise<Promotion[]> {
    return this.promotionRepository.find();
  }

  async getAllRatings(): Promise<Rating[]> {
    return this.ratingRepository.find();
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }

  mapProducts(products) {
    return products.map((product) => ({
      platform: product.platform,
      platformProductId: product.platformProductId,
      category: product.category,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      isPopular: product.isPopular,
      isSoldOut: product.isSoldOut,
      currency: product.currency,
      price: product.price,
      discountedPrice: product.discountedPrice,
      discountAmount: product.discountAmount,
      priceDiscountPercent: product.priceDiscountPercent,
      restaurant: {
        type: product.type,
        lat: product.lat,
        lng: product.lng,
      },
    }));
  }

  mapPromotions(promotions) {
    return promotions?.map((promotion) => ({
      type: promotion.type,
      date: promotion.date,
      endDate: promotion?.endDate ?? null,
      title: promotion.title,
      description: promotion.description,
      discountPercent: promotion.discountPercent || null,
      price: promotion?.price || null,
      mov: promotion?.mov || null,
      restaurantFunded: promotion?.promotion || null,
      restaurant: promotion.restaurant,
    }));
  }

  mapRestaurants(restaurant) {
    return restaurant?.map((restaurant) => ({
      type: restaurant.type,
      lat: restaurant.lat,
      lng: restaurant.lng,
    }));
  }

  mapRatting(rattings) {
    return rattings?.map((ratting) => ({
      rating: ratting.rating,
      platformStoreRating: ratting.platformStoreRating,
      totalRating: ratting.totalRating,
      detailsLabel: ratting.detailsLabel,
      totalRatingLabel: ratting.totalRatingLabel,
    }));
  }
}
