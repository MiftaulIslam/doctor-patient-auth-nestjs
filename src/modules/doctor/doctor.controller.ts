/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DoctorService } from 'src/application/services/doctor.service';
import { Role } from 'src/config/constants';
import { Roles } from 'src/domain/decorators/roles.decorator';
import { GetAllDoctorsDto } from 'src/domain/dtos';
import { RoleGuard } from 'src/infrastructure/guard';
import { Jwtguard } from 'src/infrastructure/guard/jwt.guard';
@ApiBearerAuth('access-token')
@ApiTags('doctor')
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }
  @UseGuards(Jwtguard, RoleGuard)
  @Roles(Role.ADMIN, Role.DOCTOR)
  @Get()
  @ApiOperation({ summary: 'Get all doctor - with id - searchBy - sort - pagination' })
  @ApiResponse({ status: 201, description: 'Doctor retrieves successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getAllDoctors(@Query() query: GetAllDoctorsDto, @Res() res: Response) {
    const result = await this.doctorService.getAllDoctors(query);
    res.status(result.statusCode).json(result);
    return result;
  }

}
