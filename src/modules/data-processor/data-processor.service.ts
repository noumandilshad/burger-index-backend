import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as unzipper from 'unzipper';
import { ConfigService } from '@nestjs/config';
import { promisify } from 'util';
import { DataManagementService } from '../data-management/data-management.service';

const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

@Injectable()
export class DataProcessorService {
  private readonly s3: S3;
  private readonly localPath: string;
  private readonly bucketName: string;
  private readonly extractPath: string;

  constructor(
    private readonly dataManagementService: DataManagementService,
    private readonly configService: ConfigService,
  ) {
    this.localPath = path.resolve(
      this.configService.get('DATA_SET_LOCAL_PATH'),
    );
    this.extractPath = path.resolve(
      this.configService.get('DATA_SET_EXTRACTED_PATH'),
    );
    this.bucketName = this.configService.get('DATA_SET_AWS_BUCKET');
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_ACCESS_SECRET_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async ensureDirectoryExists(directory) {
    try {
      await fs.promises.access(directory, fs.constants.F_OK); // Check if directory exists
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Directory doesn't exist, create it recursively
        await fs.promises.mkdir(directory, { recursive: true });
      } else {
        // Other error occurred, rethrow it
        throw error;
      }
    }
  }

  async downloadFileFromS3(bucketName, key, rootFolderPath) {
    try {
      if (key.includes('Careem/.DS_Store')) {
        return;
      }

      const params = {
        Bucket: bucketName,
        Key: key,
      };

      const localFolderPath = path.join(rootFolderPath, path.dirname(key));
      const localFilePath = path.join(rootFolderPath, key);

      await this.ensureDirectoryExists(localFolderPath); // Ensure directory exists

      const readSteam = this.s3.getObject(params).createReadStream();
      const writeSteam = fs.createWriteStream(localFilePath);

      readSteam.pipe(writeSteam);

      console.log(`File "${key}" downloaded to "${localFilePath}"`);
    } catch (error) {
      console.error(`Error downloading file "${key}":`, error);
      throw error;
    }
  }

  async listObjectsInBucket(bucketName, today) {
    const params = {
      Bucket: bucketName,
    };

    try {
      const data = await this.s3.listObjectsV2(params).promise();
      return data.Contents.map((object) => `${object.Key}-${today}`);
    } catch (error) {
      console.error('Error listing objects in bucket:', error);
      throw error;
    }
  }

  async cloneBucket(today: string) {
    try {
      const objects = await this.listObjectsInBucket(this.bucketName, today);

      for (const objectKey of objects) {
        await this.downloadFileFromS3(
          this.bucketName,
          objectKey,
          this.localPath,
        );
      }

      console.log(
        `All files from bucket "${this.bucketName}" cloned to "${this.localPath}"`,
      );
    } catch (error) {
      console.error('Error cloning bucket to local drive:', error);
    }
  }

  async extractZipFiles(sourceFolder, destinationFolder = this.extractPath) {
    try {
      const files = await readdirAsync(sourceFolder);

      for (const file of files) {
        const filePath = path.join(sourceFolder, file);
        const fileStat = await statAsync(filePath);

        if (fileStat.isDirectory()) {
          if (file !== '__MACOSX') {
            // Recursively extract files in subdirectories
            await this.extractZipFiles(filePath, destinationFolder);
          }
        } else if (filePath.toLowerCase().endsWith('.zip')) {
          // Extract the zip file
          await this.unzipFile(filePath, destinationFolder);

          // Check if the extracted folder contains nested zip files
          const nestedZipFolder = path.join(
            destinationFolder,
            path.basename(filePath, '.zip'),
          );
          await this.extractZipFiles(nestedZipFolder, destinationFolder);
        }
      }
    } catch (error) {
      console.error('Error extracting zip files:', error);
    }
  }

  async unzipFile(zipFilePath, destinationFolder) {
    try {
      const fileName = path.basename(zipFilePath, '.zip');
      const extractionFolder = path.join(destinationFolder, fileName);

      // Create extraction folder if it doesn't exist
      if (!fs.existsSync(extractionFolder)) {
        fs.mkdirSync(extractionFolder, { recursive: true });
      }

      // Extract the contents of the zip file to the extraction folder
      await fs
        .createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: extractionFolder }))
        .promise();

      console.log(
        `Zip file "${zipFilePath}" extracted to "${extractionFolder}"`,
      );
    } catch (error) {
      console.error('Error extracting zip file:', error);
    }
  }

  async loadJsonToDb(directoryPath = this.localPath) {
    console.log({
      function: 'readJSONFiles',
      event: 'function invoked.',
    });

    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return;
      }
      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        if (fs.statSync(filePath).isDirectory()) {
          this.loadJsonToDb(filePath);
        } else {
          fs.readFile(filePath, 'utf8', async (err, data) => {
            if (!filePath.includes('.json')) return;
            if (err) {
              console.error('Error reading file:', filePath, err);
              return;
            }
            try {
              const jsonData = JSON.parse(data);

              const promises = jsonData.map(async (jsonRecord) =>
                this.dataManagementService.insertRecord(jsonRecord),
              );

              await Promise.all(promises);
            } catch (error) {
              console.error('Error parsing JSON:', filePath, error);
            }
          });
        }
      });
    });
  }
}
