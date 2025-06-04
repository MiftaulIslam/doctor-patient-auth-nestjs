import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from 'src/application/services/patient.service';

@Module({
  controllers: [PatientController],
  providers: [
    PatientService,
  ],
})
export class PatientModule {}
