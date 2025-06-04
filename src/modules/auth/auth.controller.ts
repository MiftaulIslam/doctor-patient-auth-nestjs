/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import {  ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IResponse } from './auth.interface';
import { RegisterDoctorDto } from 'src/domain/dtos/auth/register-doctor.dto';
import { RegisterPatientDto } from 'src/domain/dtos/auth/register-patient.dto';
import { LoginDto } from 'src/domain/dtos/auth/login.dto';
import { AuthService } from 'src/application/services/auth.service';
import { EmailDto, PasswordDto, TokenDto } from 'src/domain/dtos/auth/singleField.dto';
import { UserDto } from 'src/domain/dtos/auth/user.dto';
import { Roles } from 'src/domain/decorators/roles.decorator';
import { Role } from 'src/config/constants';
import { Jwtguard, RoleGuard } from 'src/infrastructure/guard';
@ApiBearerAuth('access-token')
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Post("admin/c")
  @Roles(Role.SUPERADMIN)
  @UseGuards(Jwtguard, RoleGuard)
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Email already exists' })
  async createAdmin(@Body() dto:UserDto, @Res() res:Response) {
    const result = await this.authService.createAdmin(dto);
    res.status(result.statusCode).json(result);

    return result;
  }
  
  @Roles(Role.ADMIN)
  @UseGuards(Jwtguard, RoleGuard)
  @Post('register/doctor')
  @ApiOperation({ summary: 'Register a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Email already exists' })
  async registerDoctor(@Body() dto: RegisterDoctorDto) {


    return await this.authService.registerDoctor(dto);
  }


  @Roles(Role.ADMIN)
  @UseGuards(Jwtguard, RoleGuard)
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
  @Get('verify')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Confirmation successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async verify(@Query() q:TokenDto, @Res() res:Response) {
    console.log(q)
    const result = await this.authService.verificationEmail(q);
    // return
    return res.status(result.statusCode).json(result);
  }


  @Post("forget-password")
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Forgot password successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async forgotPassword(@Body() dto:EmailDto, @Req() req:Request,@Res() res:Response) {
    const result = await this.authService.forgetPassword(dto, req)
    return res.status(result.statusCode).json(result);
  }

  
  @Post("reset-password")
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Reset password successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async resetPassword(@Query() query:TokenDto, @Body() dto:PasswordDto, @Res() res:Response) {
    const result = await this.authService.resetPassword(query, dto)
    return res.status(result.statusCode).json(result);
  }

  
  
  @Post("Logout")
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout successfully successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  logout(@Res() res:Response) {
    const result = this.authService.logout(res)
    return res.status(result.statusCode).json(result);
  }

  
}
