import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { ImageModule } from './image/image.module';
import { PostController } from './post/post.controller';
import { PrismaService } from 'prisma/prisma.service';
import { ImageService } from './image/image.service';
import { AuthService } from './auth/auth.service';
import { PostService } from './post/post.service';
import { LoggerModule } from './common/logger/logger.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PostModule,
    ImageModule,
    LoggerModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
