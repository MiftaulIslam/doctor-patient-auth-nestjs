/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, Inject, Injectable, } from '@nestjs/common';
import { IGenericRepository } from 'src/domain/repositories/IRepository.repository';
import { User } from 'generated/prisma';
// import { MailService } from '../utils/mail.service';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CookieService } from 'src/infrastructure/utils/cookie.service';
import { LoginDto, RegisterDoctorDto, RegisterPatientDto } from 'src/domain/dtos';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    @Inject('USER_REPO') private readonly userRepo: IGenericRepository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
    // private readonly mailService:MailService,
    private readonly jwtService: JwtService,
    private readonly cookieService: CookieService
  ) { }
  async registerPatient(dto: RegisterPatientDto): Promise<any> {
    const existingUser = await this.userRepo.findUnique({ email: dto.email });

    if (existingUser) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Email already exists',
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    console.log(hashedPassword)
    const token = this.jwtService.sign({ email: dto.email, name: dto.name });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'PATIENT',
        patientProfile: {
          create: {
            contactNo: dto.contact,
            gender: dto.gender,
            bloodGroup: dto.bloodGroup,
            age: dto.age
          }
        }
      }
    })

    return { success: true, statusCode: HttpStatus.OK, message: 'Registration successful. Please check your email for verification.', data: { ...user, token } };

  }
  async registerDoctor(dto: RegisterDoctorDto): Promise<any> {
    const existingUser = await this.userRepo.findUnique({ email: dto.email });
    if (existingUser) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Email already exists',
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    console.log(hashedPassword)
    const token = this.jwtService.sign({ email: dto.email, name: dto.name });
    //store temp registration data in memory
    await this.cacheManager.set(token, JSON.stringify({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: 'doctor',
      specialty: dto.specialty,
      licenseNo: dto.licenseNo
    }), 60 * 60 * 24)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'DOCTOR',
        doctorProfile: {
          create: {
            specialty: dto.specialty,
            licenseNo: dto.licenseNo
          }
        }
      }
    })
    // await this.mailService.sendMail({
    //   email: dto.email,
    //   subject: 'Account Verification',
    //   html: `Click the link to verify your account: ${process.env.BASE_URL}/auth/verify?${token}`,
    // })

    return { success: true, statusCode: HttpStatus.OK, message: 'Registration successful. Please check your email for verification.', data: { ...user, token } };


  }



  generateToken(data: { email: string; name: string; role: string }) {
    const accessToken = this.jwtService.sign(data, {
      secret: this.config.get("JWT_SECRET") ,
      expiresIn: '1h', // Access token expires in 1 hour
    });

    const refreshToken = this.jwtService.sign(data, {
      secret: this.config.get('JWT_REFRESH_SECRET'), // Use a different secret for refresh tokens
      expiresIn: '15d', // Refresh token expires in 15 days
    });
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto, res: Response): Promise<any> {
    const user = await this.userRepo.findUnique({ email: dto.email });
    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid credentials',
      };
    }
    console.log(this.config.get('JWT_SECRET'))
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid credentials',
      }
    }
    const payload = { email: user.email, name: user.name, role: user.role };
    const { accessToken, refreshToken } = this.generateToken(payload);
    // Set cookies using CookieService
    this.cookieService.setCookie(res, 'access_token', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
      sameSite: 'strict',
    });

    this.cookieService.setCookie(res, 'refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days in milliseconds
      sameSite: 'strict',
    });
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: user,
    };
  }

  refresh(req:Request, res:Response):any{
    const refreshToken = req.cookies.refresh_token;
    console.log(refreshToken)
    if (!refreshToken) {
      return {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized access',
      };
    }
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      })
      console.log(decoded)
      const newAccessToken = this.jwtService.sign({email:decoded.email, name:decoded.name, role:decoded.role},{
        secret: process.env.JWT_SECRET,
        expiresIn: '1h'
      })
      
      this.cookieService.setCookie(res, 'access_token', newAccessToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
        sameSite:'strict',
      })
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Access token refreshed successfully',
        data: {  email: decoded.email, name: decoded.name, role: decoded.role },
      }
  }

}
