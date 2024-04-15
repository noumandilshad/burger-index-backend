import { Controller, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DataProcessorService } from './data-processor.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Controller('process')
export class DataProcessorController {
  bucketName = '';
  localPath = '';

  constructor(
    private readonly dataProcessorService: DataProcessorService,
    private readonly configService: ConfigService,
  ) {
    this.localPath = path.resolve(
      this.configService.get('DATA_SET_LOCAL_PATH'),
    );
    this.bucketName = this.configService.get('DATA_SET_AWS_BUCKET');
  }

  @Post()
  @Cron(CronExpression.EVERY_DAY_AT_1AM) // this scheduler will run every day at 1am
  async runDailyProcess() {
    // Clone the S3-BUCKET, on the bases of current date.
    const today = `${new Date().toISOString().split('T')[0]}`;
    await this.dataProcessorService.cloneBucket(today);

    // Extract the downloaded S3 data to local folder.
    await this.dataProcessorService.extractZipFiles(`${this.localPath}`);

    // Load downloaded extracted JSON data to MY-SQL and ELASTIC-SEARCH and index data on ELASTIC-SEACH.
    await this.dataProcessorService.loadJsonToDb();
  }
}
