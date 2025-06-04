/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import {  ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IResponse } from './auth.interface';
import { RegisterDoctorDto } from 'src/domain/dtos/auth/register-doctor.dto';
import { RegisterPatientDto } from 'src/domain/dtos/auth/register-patient.dto';
import { LoginDto } from 'src/domain/dtos/auth/login.dto';
import { AuthService } from 'src/application/services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register/doctor')
  @ApiOperation({ summary: 'Register a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Email already exists' })
  async registerDoctor(@Body() dto: RegisterDoctorDto) {


    return await this.authService.registerDoctor(dto);
  }


  @Post('register/patient')
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Email already exists' })
  async registerPatient(@Body() dto: RegisterPatientDto, @Res() res:Response) {
    const result = await this.authService.registerPatient(dto);
    res.status(result.statusCode).json(result);
    return result;
  }


  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  async login(@Body() dto: LoginDto, @Res() res:Response) : Promise<IResponse> {
    const result = await this.authService.login(dto, res);
    console.log(result)
    res.status(result.statusCode).json(result);
    return result;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh a token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async refresh(@Req() req:Request, @Res() res:Response) {
    const result = await this.authService.refresh(req, res);
    return res.status(result.statusCode).json(result);
  }
}
