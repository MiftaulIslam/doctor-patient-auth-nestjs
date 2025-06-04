import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { Doctor } from 'generated/prisma';
import { GenericRepository } from 'src/domain/repositories/genericRepository.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DoctorService } from 'src/application/services/doctor.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DoctorController],
  providers:[
    DoctorService,
    
    {
      provide: "DOCTOR_REPO",
      useFactory:(prisma:PrismaService)=> new GenericRepository<Doctor>(prisma, 'doctor'),
      inject:[PrismaService]
  }
  ]
})
export class DoctorModule {}
