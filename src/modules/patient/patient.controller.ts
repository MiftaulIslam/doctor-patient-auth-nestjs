/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetAllPatientDto } from 'src/application/dtos/patient/getAllPatient.dto';
import { PatientService } from 'src/infrastructure/services/patient.service';
@ApiTags('patient')
@Controller('patient')
export class PatientController {

    constructor(private readonly patientService: PatientService) { }
  
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
