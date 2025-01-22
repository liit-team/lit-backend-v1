import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNumber({}, { each: true })
  @ApiProperty({
    description: '태그될 유저들의 id',
    example: '[1, 2, 3]',
  })
  public receiverUserId: number[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '촬영자의 짧은 한 마디',
    example: '멋있다~',
  })
  public content: string;
}

enum status {
  PUBLIC = 'PUBLIC',
  HIDDEN = 'HIDDEN',
  FILTERD = 'FILTERD',
}

export class UpdatePostDto {
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNumber({}, { each: true })
  @ApiProperty({
    description: '태그될 유저들의 id',
    example: '[1, 2, 3]',
  })
  public receiverUserId: number[];

  @IsString()
  @ApiProperty({
    description: '촬영자의 짧은 한 마디',
    example: '멋있다~',
  })
  public content: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '게시글 id',
    example: '1',
  })
  public postId: number;

  @IsNotEmpty()
  @IsString()
  public status: status;
}

export class DeletePostDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '게시글 id',
    example: '2',
  })
  public postId: number;
}

export class GetPostByIdDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '게시글 id',
    example: '12',
  })
  public postId: number;
}

export class HeartPostDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '게시글 id',
    example: '1',
  })
  public postId: number;
}
