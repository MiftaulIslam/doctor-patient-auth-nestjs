/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Body, Controller, Delete, Get, Param, Patch, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PatientService } from 'src/application/services/patient.service';
import { Role } from 'src/config/constants';
import { Roles } from 'src/domain/decorators/roles.decorator';
import { GetAllPatientDto } from 'src/domain/dtos';
import { UpdatePatientDto } from 'src/domain/dtos/patient/update-patient.dto';
import { Jwtguard, RoleGuard } from 'src/infrastructure/guard';
@ApiBearerAuth('access-token')
@UseGuards(Jwtguard, RoleGuard)
@ApiTags('patient')
@Controller('patient')
export class PatientController {

    constructor(private readonly patientService: PatientService) { }
  
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

    @Roles(Role.ADMIN)
    @Delete("delete/:id")
    @ApiOperation({ summary: "Delete patient" })
    @ApiResponse({ status: 201, description: "patient deleted successfully" })
    @ApiResponse({ status: 404, description: "patient not found" })
    async deletePatient(@Param("id") id: string, @Res() res: Response) {
      const result = await this.patientService.deletePatient(id);
      res.status(result.statusCode).json(result);
      return result;
    }

  @Roles(Role.ADMIN, Role.PATIENT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update patient information' })
  @ApiResponse({ status: 200, description: 'Patient information updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updatePatient(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Res() res: Response
  ) {
    const result = await this.patientService.updatePatient(id, dto);
    res.status(result.statusCode).json(result);
    return result;
  }
}
