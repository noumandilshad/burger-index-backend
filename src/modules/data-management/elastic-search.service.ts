// src/services/elasticsearch.service.ts
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticSearchService {
  private readonly logger = new Logger(ElasticSearchService.name);
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTIC_SEARCH_URL,
      auth: {
        username: process.env.ELASTIC_SEARCH_USERNAME,
        password: process.env.ELASTIC_SEARCH_PASSWORD,
      },
    });

    this.client
      .ping()
      .then(() => this.logger.log('ElasticSearch connection was successful.'))
      .catch((error) =>
        this.logger.error('ElasticSearch connection was not successful', {
          reason: error.message,
        }),
      );
  }

  async indexDocument(index: string, body: any): Promise<void> {
    try {
      await this.client.index({
        index,
        body,
      });
      console.log(`Document indexed successfully in index ${index}`);
    } catch (error) {
      console.error(`Error indexing document in index ${index}:`, error);
    }
  }

  async search(index: string, query: any): Promise<any[]> {
    console.log({ index, query });
    const response: any = await this.client.search({
      index,
      body: {
        query: {
          bool: {
            should: query,
          },
        },
      },
    });

    if (!response || !response?.hits || !response?.hits?.hits.length) {
      throw new HttpException('No data found.', 404);
    }

    return response.hits?.hits.map((hit) => hit._source);
  }
}
