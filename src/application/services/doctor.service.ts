import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Doctor, Prisma } from 'generated/prisma';
import { GetAllDoctorsDto } from 'src/domain/dtos';
import { UpdateDoctorDto } from 'src/domain/dtos/doctor/update-doctor.dto';
import { IGenericRepository } from 'src/domain/repositories/IRepository.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class DoctorService {

    constructor(
        @Inject('DOCTOR_REPO') private readonly docRepo: IGenericRepository<Doctor>,
        private prisma: PrismaService
    ) {

    }


    async getAllDoctors(query: GetAllDoctorsDto): Promise<any> {
        const {
            id,
            searchBy,
            orderBy = 'createdAt',
            sort = 'desc',
            page = 1,
            limit = 10,
        } = query;

        // Search by ID (shortcut)
        if (id) {
            const doctor = await this.prisma.doctor.findUnique({ where: { id }, include: { user: true } });
            return doctor ? {
                success: true,
                message: 'Doctor retrieved successfully',
                statusCode: HttpStatus.OK,
                data: [doctor]
            } : {
                success: false,
                message: 'Doctor not found',
                statusCode: HttpStatus.NOT_FOUND,
                data: []
            };
        }

        // Search filter

        const whereClause: Prisma.DoctorWhereInput = searchBy
            ? {
                user: {
                    OR: [
                        { name: { contains: searchBy } },
                        { email: { contains: searchBy } },
                    ],
                },
            }
            : {};


        const [data, total] = await this.prisma.$transaction([
            this.prisma.doctor.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [orderBy]: sort },
                include: {
                    user: true
                }
            }),
            this.prisma.doctor.count({ where: whereClause }),
        ]);

        return {
            success: true,
            message: 'Doctors retrieved successfully',
            statusCode: HttpStatus.OK,
            data: {
                doctors: data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }


    async deleteDoctor(id: string): Promise<any> {
        const deleteUser = await this.prisma.doctor.delete({
            where: {
                id
            },
        })

        return {
            success: true,
            message: 'Doctor deleted successfully',
            statusCode: HttpStatus.OK,
            data: deleteUser
        };

    }

    async updateDoctor(id: string, dto: UpdateDoctorDto): Promise<any> {
        const updatedDoctor = await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                doctorProfile: {
                    update: {
                        specialty: dto.specialty,
                        licenseNo: dto.licenseNo,
                    },
                },
            },
            include: {
                doctorProfile: true,
            },
        });

        return {
            success: true,
            message: 'Doctor information updated successfully',
            statusCode: HttpStatus.OK,
            data: updatedDoctor
        };
    }
}