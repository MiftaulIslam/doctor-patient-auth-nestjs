import { IsInt, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/, { 
    message: 'Invalid mobile number, please follow the format: +8801XXXXXXXXX or 01XXXXXXXXX',
  })
  contact?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3, { message: 'Blood group cannot be longer than 3 characters' })
  bloodGroup?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: "male" | "female";
}