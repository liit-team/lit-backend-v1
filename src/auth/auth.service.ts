import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Redis } from 'ioredis';
import { RegisterUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: Redis,
  ) {}

  /**
   * 사용자를 생성합니다.
   * @param data
   * @returns
   */
  async RegisterUser(data: RegisterUserDto) {
    // 이미 가입한 유저 여부를 확인합니다.
    const isUserExist = await this.prisma.users.findUnique({
      where: {
        phone: data.phoneNumber,
      },
    });

    // 만약 이미 가입했다면 반환합니다.
    if (isUserExist) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    // 새로운 유저를 생성합니다.
    await this.prisma.users.create({
      data: {
        phone: data.phoneNumber,
        userName: data.username,
        userTitle: data.usertitle,
        userPicPath: data.profilePath,
      },
    });

    // const token =

    return {
      message: 'SUCCESS',
    };
  }
}
