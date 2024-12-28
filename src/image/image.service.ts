import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class ImageService {
  private s3Client: S3Client;
  private readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY') || '',
        secretAccessKey:
          this.configService.get<string>('AWS_S3_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * s3에 이미지를 업로드하는 함수
   * @param file
   * @returns status, message, S3Url
   */
  async imageUploadToS3(file: Express.Multer.File) {
    try {
      const fileExtension = file.originalname.split('.').pop().toLowerCase();

      if (!this.allowedExtensions.includes(fileExtension)) {
        throw new HttpException(
          'FILE_EXTENSION_NOT_ALLOWED',
          HttpStatus.BAD_REQUEST,
        );
      }
      const randomFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExtension}`;
      const key = `${Date.now()}-${randomFileName}`;
      const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const s3Url = `https://${bucketName}.s3.${this.configService.get<string>(
        'AWS_REGION',
      )}.amazonaws.com/${key}`;

      return s3Url;
    } catch (error) {
      console.error('S3 업로드 에러:', error);
      throw new Error('FAILED');
    }
  }

  async imageUpdateToS3() {}
}
