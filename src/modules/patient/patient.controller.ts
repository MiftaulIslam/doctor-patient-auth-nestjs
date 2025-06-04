/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PatientService } from 'src/application/services/patient.service';
import { Role } from 'src/config/constants';
import { Roles } from 'src/domain/decorators/roles.decorator';
import { GetAllPatientDto } from 'src/domain/dtos';
import { Jwtguard, RoleGuard } from 'src/infrastructure/guard';
@ApiBearerAuth('access-token')
@ApiTags('patient')
@Controller('patient')
export class PatientController {

    constructor(private readonly patientService: PatientService) { }
    @UseGuards(Jwtguard, RoleGuard)
    @Roles(Role.ADMIN, Role.PATIENT)
    @Get()
    @ApiOperation({ summary: 'Get all patient - with id - searchBy - sort - pagination' })
    @ApiResponse({ status: 201, description: 'patient retrieves successfully' })
    @ApiResponse({ status: 404, description: 'patient not found' })
    async getAllDoctors(@Query() query: GetAllPatientDto, @Res() res: Response) {
      const result = await this.patientService.getAllPatient(query);
      res.status(result.statusCode).json(result);
      return result;
    }
}
