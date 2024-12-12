import {
  IsPhoneNumber,
  IsNumberString,
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
  public profilePath: string;

  /**
   * 사용자 이름
   */
  @IsString()
  public username: string;

  /**
   * 사용자 별명
   */
  @IsString()
  public usertitle: string;

  /**
   * 사용자 전화번호
   */
  @IsPhoneNumber()
  public phoneNumber: string;
}
