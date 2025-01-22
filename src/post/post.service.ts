import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  CreatePostDto,
  DeletePostDto,
  GetPostByIdDto,
  HeartPostDto,
  UpdatePostDto,
} from './dto/post.dto';
import { ImageService } from 'src/image/image.service';
import { S3 } from 'aws-sdk';
import { Prisma, Posts } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
  ) {}

  /**
   * 게시글을 생성합니다.
   * @param data
   * @param file
   * @param userId
   * @returns
   */
  async createPost(
    data: CreatePostDto,
    file: Express.Multer.File,
    userId: number,
  ) {
    // 유효성 검사를 실행합니다.
    if (!data || !file) {
      throw new HttpException('CONTENT_HAS_MISSING', HttpStatus.BAD_REQUEST);
    }

    if (!userId) {
      throw new HttpException('LOGIN_REQUIRED', HttpStatus.BAD_REQUEST);
    }

    let S3Url: string;

    try {
      S3Url = await this.imageService.imageUploadToS3(file);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.prisma.$transaction(async (prisma) => {
      const post = await prisma.posts.create({
        data: {
          picPath: S3Url,
          bio: data.content,
          status: 'PUBLIC',
          userId: BigInt(userId),
        },
      });

      await Promise.all(
        data.receiverUserId.map((receiverUserId) =>
          prisma.postTags.create({
            data: {
              postId: post.id,
              userId: BigInt(receiverUserId),
            },
          }),
        ),
      );
      return {
        message: 'SUCCESS',
        data: {
          PostId: post.id.toString(),
          PostUrl: S3Url,
        },
      };
    });
  }

  /**
   * 게시글의 정보를 업데이트 합니다.
   * @param data
   * @param userId
   */
  async updatePost(data: UpdatePostDto, userId: number) {
    if (!data || !data.postId || !userId) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const foundPost = await this.prisma.posts.findUnique({
      where: { id: BigInt(data.postId) },
    });

    if (!foundPost) {
      throw new HttpException('POST_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (foundPost.userId !== BigInt(userId)) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    await this.prisma.$transaction(async (prisma) => {
      const updatedPost = await prisma.posts.update({
        where: { id: BigInt(data.postId) },
        data: {
          bio: data.content || foundPost.bio,
          status: data.status || foundPost.status,
        },
      });

      if (
        Array.isArray(data.receiverUserId) &&
        data.receiverUserId.length > 0
      ) {
        await prisma.postTags.deleteMany({
          where: { postId: BigInt(data.postId) },
        });

        await Promise.all(
          data.receiverUserId.map((receiverUserId) => {
            if (typeof receiverUserId === 'number') {
              return prisma.postTags.create({
                data: {
                  postId: BigInt(data.postId),
                  userId: BigInt(receiverUserId),
                },
              });
            } else {
              throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
            }
          }),
        );
        return {
          message: 'SUCCESS',
        };
      } else {
        throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
      }
    });
  }

  /**
   * 게시글을 삭제합니다.
   * @param data
   * @returns
   */
  async deletePost(data: DeletePostDto) {
    await this.prisma.posts.delete({
      where: {
        id: BigInt(data.postId),
      },
    });

    return {
      message: 'SUCCESS',
    };
  }

  /**
   * 5개의 게시글을 랜덤으로 가져옵니다.
   * @returns
   */
  async getPosts() {
    const randomPosts = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id, 
        p.picPath, 
        p.bio,
        p.userId,

        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('emoji', r2.content, 'count', r2.reactCount)
          )
          FROM (
            SELECT r.content, COUNT(*) AS reactCount
            FROM React r
            WHERE r.postId = p.id
            GROUP BY r.content
            ORDER BY RAND()
            LIMIT 3
          ) r2
        ) AS reacts,

        (
          SELECT COUNT(*)
          FROM Heart h
          WHERE h.postId = p.id
        ) AS heartCount

      FROM Posts p
      WHERE p.status = 'PUBLIC'
      ORDER BY RAND()
      LIMIT 5;
    `;

    return {
      message: 'SUCCESS',
      data: {
        randomPosts: randomPosts.map((post: any) => ({
          ...post,
          id: post.id.toString(),
          userId: post.userId.toString(),
          heartCount: Number(post.heartCount),
        })),
      },
    };
  }

  // async getPostById(data: GetPostByIdDto) {
  //   if (!data.postId) {
  //     throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
  //   }

  //   const foundPost = await this.prisma.posts.findFirst({
  //     where: {
  //       id: data.postId,
  //     },
  //     select: {
  //       picPath: true,
  //       bio: true,
  //       status: true,
  //       userId: true,
  //     },
  //   });

  //   if (!foundPost) {
  //     throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  //   }
  // }

  /**
   * 게시물에 하트를 삭제하거나 추가합니다.
   * @param data
   * @param userId
   * @returns
   */
  async heartPost(data: HeartPostDto, userId: number) {
    const foundHeartRecord = await this.prisma.heart.findFirst({
      where: {
        userId: BigInt(userId),
        postId: BigInt(data.postId),
      },
      select: {
        id: true,
      },
    });

    if (!foundHeartRecord) {
      await this.prisma.heart.create({
        data: {
          userId: BigInt(userId),
          postId: BigInt(data.postId),
        },
      });
    } else {
      await this.prisma.heart.delete({
        where: {
          id: foundHeartRecord.id,
        },
      });
    }

    return {
      message: 'SUCCESS',
    };
  }
}
