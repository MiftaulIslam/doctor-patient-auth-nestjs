import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from 'src/infrastructure/services/patient.service';
import { PrismaService } from 'src/infrastructure/services/prisma/prisma.service';

@Module({
  controllers: [PatientController],
  providers: [
    PatientService,
    PrismaService
  ],
})
export class PatientModule {}
