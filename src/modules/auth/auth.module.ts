import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'generated/prisma';
import { GenericRepository } from 'src/domain/repositories/genericRepository.repository';
import { AuthController } from './auth.controller';
import { CookieService } from 'src/infrastructure/utils/cookie.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AuthService } from 'src/application/services/auth.service';
import { JwtStrategy } from 'src/infrastructure/strategy/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({secret: process.env.JWT_SECRET}),
    
    CacheModule.register({
      isGlobal: true, // Makes it available app-wide
      ttl: 60 * 60 * 24, // default TTL: 24 hours
    }),
  ],
  controllers: [AuthController],
  providers:[
    AuthService,
    CookieService,
    JwtStrategy,
    {
        provide: "USER_REPO",
        useFactory:(prisma:PrismaService)=> new GenericRepository<User>(prisma, 'user'),
        inject:[PrismaService]
    }
  ],
exports:[JwtStrategy]
})
export class AuthModule {}
