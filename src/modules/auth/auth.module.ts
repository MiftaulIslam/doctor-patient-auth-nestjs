import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'generated/prisma';
import { GenericRepository } from 'src/domain/repositories/genericRepository.repository';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { PrismaService } from 'src/infrastructure/services/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { CookieService } from 'src/infrastructure/utils/cookie.service';

@Module({
  imports: [
    JwtModule.register({secret:process.env.JWT_SECRET}),
    
    CacheModule.register({
      isGlobal: true, // Makes it available app-wide
      ttl: 60 * 60 * 24, // default TTL: 24 hours
    }),
  ],
  controllers: [AuthController],
  providers:[
    AuthService,
    PrismaService,
    CookieService,
    {
        provide: "USER_REPO",
        useFactory:(prisma:PrismaService)=> new GenericRepository<User>(prisma, 'user'),
        inject:[PrismaService]
    }
  ]

})
export class AuthModule {}
