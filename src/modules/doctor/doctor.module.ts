import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from 'src/infrastructure/services/doctor.service';
import { PrismaService } from 'src/infrastructure/services/prisma/prisma.service';
import { Doctor } from 'generated/prisma';
import { GenericRepository } from 'src/domain/repositories/genericRepository.repository';

@Module({
  controllers: [DoctorController],
  providers:[
    DoctorService,
    PrismaService,
    {
      provide: "DOCTOR_REPO",
      useFactory:(prisma:PrismaService)=> new GenericRepository<Doctor>(prisma, 'doctor'),
      inject:[PrismaService]
  }
  ]
})
export class DoctorModule {}
