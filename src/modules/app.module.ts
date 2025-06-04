import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, DoctorModule, PatientModule, PrismaModule, ConfigModule.forRoot({isGlobal:true})],
})
export class AppModule {}
