import {
  IsPhoneNumber,
  IsNotEmpty,
  Length,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegisterUserDto {
  /**
   * 사용자 프로필 사진 S3 버킷 경로
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public profilePath: string;

  /**
   * 사용자 이름
   */
  @IsString()
  @IsNotEmpty()
  public username: string;

  /**
   * 사용자 별명
   */
  @IsString()
  @IsNotEmpty()
  public usertitle: string;

  /**
   * 사용자 전화번호
   */
  @IsPhoneNumber('KR')
  @IsNotEmpty()
  public phoneNumber: string;
}

export class LoginDto {
  @IsPhoneNumber('KR')
  @IsNotEmpty()
  public phone: string;
}
