/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, Inject, Injectable, Req, } from '@nestjs/common';
import { IGenericRepository } from 'src/domain/repositories/IRepository.repository';
import { User } from 'generated/prisma';
// import { MailService } from '../utils/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CookieService } from 'src/infrastructure/utils/cookie.service';
import { LoginDto, RegisterDoctorDto, RegisterPatientDto } from 'src/domain/dtos';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/infrastructure/mailer/mailer.service';
import { UserDto } from 'src/domain/dtos/auth/user.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    @Inject('USER_REPO') private readonly userRepo: IGenericRepository<User>,
    private prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly cookieService: CookieService
  ) { }
  
  async createAdmin(dto:UserDto): Promise<any> {
    const existingUser = await this.userRepo.findUnique({ email: dto.email });
    if (existingUser) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Email already exists',
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data:{
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: "ADMIN",
      }
    })
    return{
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Admin created successfully',
      data: user,
    }
  }

  async registerPatient(dto: RegisterPatientDto): Promise<any> {
    const existingUser = await this.userRepo.findUnique({ email: dto.email });

    if (existingUser) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Email already exists',
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const payload = {
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: "PATIENT",
      contactNo: dto.contact,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      age: dto.age,
    }
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    await this.mailService.sendVerificationEmail(dto.email, token, 'patient')
    return { success: true, statusCode: HttpStatus.OK, message: 'Registration successful. Please check your email for verification.', data: { token } };

  }
  async registerDoctor(dto: RegisterDoctorDto): Promise<any> {
    const existingUser = await this.userRepo.findUnique({ email: dto.email });
    if (existingUser) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Email already exists',
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const payload = {
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: "DOCTOR",
      specialty: dto.specialty,
      licenseNo: dto.licenseNo,
    }
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });


    await this.mailService.sendVerificationEmail(dto.email, token, 'doctor')

    return { success: true, statusCode: HttpStatus.OK, message: 'Registration successful. Please check your email for verification.', data: { token } };


  }

  async forgetPassword(dto: { email?: string }, @Req() req: Request): Promise<any> {
    if (req.cookies.refresh_token) {
      const decode = this.jwtService.verify(req.cookies.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET
      })
      if (!decode) return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid token',
      }
      await this.mailService.sendPasswordResetEmail(decode.email, this.jwtService.sign({ email: decode.email },{
        secret: this.config.get("JWT_SECRET"),
        expiresIn: '15m',
      }))

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Password reset link sent to your email',
        data: []
      }
    }

    if (!dto.email) {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Email is required',
      };
    }
    await this.mailService.sendPasswordResetEmail(dto.email, this.jwtService.sign({ email: dto.email },{
      secret: this.config.get("JWT_SECRET"),
      expiresIn: '15m',
    }))

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Password reset link sent to your email',
      data: []
    }
  }

  async resetPassword(query:{token:string}, dto:{password:string}){
    const { token } = query;
    if(!token || !dto.password) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid request',
    }
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET
    })
    if (!decoded) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid token',
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.update({
      where: {
        email: decoded.email
      },
      data: {
        password: hashedPassword
      }
    })
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Password reset successful',
      data: user,
    }
  }

logout (res:Response){
  this.cookieService.clearCookie(res,'access_token')
  this.cookieService.clearCookie(res,'refresh_token')
  return {
    success: true,
    statusCode: HttpStatus.OK,
    message: 'Logout successful',
  }
}

  async verificationEmail(query: { token: string }): Promise<any> {

    const { token } = query;
    if (!token) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid token',
    }
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET, 
    })
    if (!decoded) return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid token',
    }
    if (decoded.role === 'DOCTOR') {
      const doc = await this.prisma.user.create({
        data: {
          email: decoded.email,
          password: decoded.password,
          name: decoded.name,
          role: decoded.role,
          doctorProfile: {
            create: {
              specialty: decoded.specialty,
              licenseNo: decoded.licenseNo,
            }
          }
        }
      })

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Registration successful',
        data: doc,
      }
    }
    const patient = await this.prisma.user.create({
      data: {
        email: decoded.email,
        password: decoded.password,
        name: decoded.name,
        role: decoded.role,
        patientProfile: {
          create: {
            contactNo: decoded.contactNo,
            gender: decoded.gender,
            bloodGroup: decoded.bloodGroup,
            age: decoded.age
          }
        }
      }
    })
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Registration successful',
      data: patient,
    }
  }


  generateToken(data: { email: string; name: string; role: string }) {
    const accessToken = this.jwtService.sign(data, {
      secret: this.config.get("JWT_SECRET"),
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

  refresh(req: Request, res: Response): any {
    const refreshToken = req.cookies.refresh_token;
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
    const newAccessToken = this.jwtService.sign({ email: decoded.email, name: decoded.name, role: decoded.role }, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h'
    })

    this.cookieService.setCookie(res, 'access_token', newAccessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
      sameSite: 'strict',
    })
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Access token refreshed successfully',
      data: { email: decoded.email, name: decoded.name, role: decoded.role },
    }
  }

}
