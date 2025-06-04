/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail({}, {message:"Invalid email address"})
  email: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{6,}$/, {
    message: 'Password must be at least 6 characters long, include one uppercase letter and one number',
  })
  password: string;
}
