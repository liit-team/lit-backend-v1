import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Redis } from 'ioredis';
import { LoginDto, RegisterUserDto } from './dto/auth.dto';
import { Users } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class AuthService {
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: parseInt(
        this.configService.get<string>('REDIS_PORT') || '6379',
        10,
      ),
    });
  }

  /**
   * 사용자를 생성합니다.
   * @param data
   * @returns
   */
  async registerUser(data: RegisterUserDto) {
    // 이미 가입한 유저 여부를 확인합니다.
    const isUserExist = await this.prisma.users.findUnique({
      where: {
        phone: data.phoneNumber,
      },
      select: {
        id: true,
      },
    });

    // 만약 이미 가입했다면 반환합니다.
    if (isUserExist) {
      throw new HttpException('ALEADY_REGISTERD', HttpStatus.BAD_REQUEST);
    }

    // 새로운 유저를 생성합니다.
    const user = await this.prisma.users.create({
      data: {
        phone: data.phoneNumber,
        userName: data.username,
        userTitle: data.usertitle,
        userPicPath: data.profilePath,
      },
    });

    const { accessToken, refreshToken } = await this.generateBothTokens(user);

    if (!accessToken || !refreshToken) {
      throw new HttpException('TOKEN_NOT_GENERATED', HttpStatus.BAD_REQUEST);
    }

    return {
      message: 'SUCCESS',
      data: {
        accessToken: accessToken.toString(),
        refreshToken: refreshToken.toString(),
      },
    };
  }

  /**
   * 유저의 로그인을 처리하는 함수입니다.
   * @param data
   */
  async loginUser(data: LoginDto) {
    // 유저가 존재하는지 확인합니다
    const user = await this.prisma.users.findUnique({
      where: {
        phone: data.phone,
      },
    });

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    // 토큰을 생성합니다
    const { accessToken, refreshToken } = await this.generateBothTokens(user);

    if (!accessToken || !refreshToken) {
      throw new HttpException('TOKEN_NOT_GENERATED', HttpStatus.BAD_REQUEST);
    }

    return {
      message: 'SUCCESS',
      data: {
        accessToken: accessToken.toString(),
        refreshToken: refreshToken.toString(),
      },
    };
  }

  /**
   * AccessToken과 RefreshToken을 생성하는 함수입니다.
   *
   * @param user
   * @returns
   */
  async generateBothTokens(
    user: Users,
  ): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      // 두 개의 토큰을 생성합니다.
      const payload = {
        id: user.id.toString(),
      };
      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<number>(
          'JWT_REFRESH_EXPIRATION_TIME',
        ),
      });

      // 만료 시간을 설정합니다.
      const expirationTimeInSeconds = parseInt(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '0',
        10,
      );

      // redis 에 Refresh 토큰을 저장합니다.
      await this.redis.set(
        user.id.toString(),
        refreshToken,
        'EX',
        expirationTimeInSeconds,
      );

      return { accessToken, refreshToken };
    } catch (e) {
      console.log(e);
      return {
        accessToken: null,
        refreshToken: null,
      };
    }
  }

  /**
   * Redis에 저장된 토큰을 가져오고, 검증 한 후 두 토큰을 발급합니다.
   * 새로 발급된 Refresh토큰은 새로 Redis에 저장됩니다.
   * @param user
   * @param refreshToken
   */
  async refreshTokens(user: Users, refreshToken: string) {
    // Redis에 저장된 Refresh토큰을 가져옵니다.
    const storedRefToken = await this.redis.get(user.id.toString());

    // 저장된 Ref 토큰과 인자로 받은 Ref토큰이 일치한 지 검사합니다.
    if (!storedRefToken || storedRefToken != refreshToken) {
      throw new HttpException('WRONG_OR_EXPIRED_TOKEN', HttpStatus.BAD_REQUEST);
    }

    // Ref 토큰을 디코딩합니다.
    const decodedRefToken = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    // Decoded 토큰이 없으면 반환합니다.
    if (!decodedRefToken) {
      throw new HttpException('EXPIRED_TOKEN', HttpStatus.BAD_GATEWAY);
    }

    // 새로운 액세스 토큰을 발급합니다.
    const newAccessToken = await this.jwtService.signAsync(user.id.toString(), {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    // refreshTime 선언
    const refreshExpirationTime = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '0',
      10,
    );

    // refresh Token을 발급합니다
    const newRefreshToken = await this.jwtService.signAsync(
      { id: user.id.toString() },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpirationTime,
      },
    );

    return { newAccessToken, newRefreshToken };
  }

  /**
   * 액세스 토큰을 검증합니다.
   *
   * @param token
   * @returns
   */
  async validateAccessTokens(token: string) {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 프로필 사진을 추가/수정합니다.
   * @param file
   * @param userId
   * @returns
   */
  async addProfilePicture(file: Express.Multer.File, userId: number) {
    if (!file || !userId) {
      throw new HttpException('CONTENT_HAS_MISSING', HttpStatus.BAD_REQUEST);
    }

    let S3Url: string;

    try {
      S3Url = await this.imageService.imageUploadToS3(file);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.prisma.users.update({
      where: {
        id: BigInt(userId),
      },
      data: {
        userPicPath: S3Url,
      },
    });
    return {
      message: 'SUCCESS',
      data: {
        profileUrl: S3Url,
      },
    };
  }

  async getUserInfo(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(userId),
      },
      select: {
        id: true,
        userName: true,
        userTitle: true,
        userPicPath: true,
      },
    });

    return {
      message: 'SUCCESS',
      data: user,
    };
  }
}
