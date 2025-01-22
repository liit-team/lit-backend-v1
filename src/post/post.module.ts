import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { ImageService } from 'src/image/image.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [PostService, ImageService, PrismaService],
  controllers: [PostController],
})
export class PostModule {}
