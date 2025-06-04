/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class EmailDto {
  @IsOptional()
  @IsEmail({}, {message:"Invalid email address"})
  email?: string;

}

export class PasswordDto {

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{6,}$/, {
    message: 'Password must be at least 6 characters long, include one uppercase letter and one number',
  })
  password: string;
}

export class TokenDto {
  @ApiProperty({ description: 'Access_Token' })
  @IsString()
  token:string;
}
