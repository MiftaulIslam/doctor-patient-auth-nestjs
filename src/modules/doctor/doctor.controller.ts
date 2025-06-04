/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Delete, Get, Param, Patch, Query, Res, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DoctorService } from 'src/application/services/doctor.service';
import { Role } from 'src/config/constants';
import { Roles } from 'src/domain/decorators/roles.decorator';
import { GetAllDoctorsDto } from 'src/domain/dtos';
import { UpdateDoctorDto } from 'src/domain/dtos/doctor/update-doctor.dto';
import { RoleGuard } from 'src/infrastructure/guard';
import { Jwtguard } from 'src/infrastructure/guard/jwt.guard';
@ApiBearerAuth('access-token')
@UseGuards(Jwtguard, RoleGuard)
@ApiTags('doctor')
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }
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

  @Roles(Role.ADMIN)
  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete doctor' })
  @ApiResponse({ status: 201, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async deleteDoctor(@Param('id') id: string, @Res() res: Response) {
    const result = await this.doctorService.deleteDoctor(id);
    res.status(result.statusCode).json(result);
    return result;
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Update doctor information' })
  @ApiResponse({ status: 200, description: 'Doctor information updated successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async updateDoctor(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
    @Res() res: Response
  ) {
    const result = await this.doctorService.updateDoctor(id, dto);
    res.status(result.statusCode).json(result);
    return result;
  }
}
