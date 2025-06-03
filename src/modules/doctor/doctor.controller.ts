/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetAllDoctorsDto } from 'src/application/dtos/doctor/getAllDoc.dto';
import { DoctorService } from 'src/infrastructure/services/doctor.service';

@ApiTags('doctor')
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }
  
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
