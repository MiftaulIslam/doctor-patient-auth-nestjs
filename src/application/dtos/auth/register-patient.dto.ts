/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsInt, IsString, Matches, MaxLength } from 'class-validator';

export class RegisterPatientDto {
  @IsEmail({}, {message:"Invalid email address"})
  email: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{6,}$/, {
    message: 'Password must be at least 6 characters long, include one uppercase letter and one number',
  })
  password: string;
  @IsString()
  name: string;

  @IsString()
  
  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/
, {
    message: 'Invalid mobile number, please follow the format: +8801XXXXXXXXX or 01XXXXXXXXX',
  })
  contact: string;

  @IsString()
  @MaxLength(3, { message: 'Blood group cannot be longer than 3 characters' })
  bloodGroup: string;

  @IsInt()
  age: number
  @IsString()
  gender: "male" | "female" | "other";
}
