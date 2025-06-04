import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from 'src/infrastructure/mailer/mailer.module';

@Module({
  imports: [AuthModule, DoctorModule, PatientModule, PrismaModule, MailerModule,ConfigModule.forRoot({isGlobal:true})],
})
export class AppModule {}
