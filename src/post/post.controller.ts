import {
  Controller,
  UseGuards,
  Post,
  UseInterceptors,
  Body,
  UploadedFile,
  ValidationPipe,
  UsePipes,
  Get,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDto, HeartPostDto, UpdatePostDto } from './dto/post.dto';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiFile } from 'src/common/decorators/api-file.decorator';

@Controller('/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * 게시글을 생성합니다.
   * @param userId
   * @param files
   * @param body
   * @returns
   */
  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @ApiFile('file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 5 },
    }),
  )
  async createPost(
    @GetUser('userId') userId: number,
    @UploadedFile() files: Express.Multer.File,
    @Body() body: CreatePostDto,
  ) {
    return this.postService.createPost(body, files, userId);
  }

  /**
   * 게시글을 수정합니다
   * @param userId
   * @param body
   * @returns
   */
  @Post('/update')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @GetUser('userId') userId: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postService.updatePost(body, userId);
  }

  /**
   * 랜덤으로 5개의 게시물을 조회합니다.
   * @returns
   */
  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getPosts() {
    return this.postService.getPosts();
  }

  /**
   * 게시글에 하트를 추가하거나 삭제 합니다.
   * @param userId
   * @param body
   * @returns
   */
  @Get('/')
  @UseGuards(JwtAuthGuard)
  async heartPost(
    @GetUser('userId') userId: number,
    @Body() body: HeartPostDto,
  ) {
    return this.postService.heartPost(body, userId);
  }
}
