import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { GetAllPatientDto } from 'src/domain/dtos';
import { UpdatePatientDto } from 'src/domain/dtos/patient/update-patient.dto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PatientService {
    constructor(
        private prisma: PrismaService
    ) { }


    async getAllPatient(query: GetAllPatientDto): Promise<any> {
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
            const patient = await this.prisma.patient.findUnique({ where: { id }, include: { user: true } });
            return patient ? {
                success: true,
                message: 'patient retrieved successfully',
                statusCode: HttpStatus.OK,
                data: [patient]
            } : {
                success: false,
                message: 'patient not found',
                statusCode: HttpStatus.NOT_FOUND,
                data: []
            };
        }

        // Search filter

        const whereClause: Prisma.PatientWhereInput = searchBy
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
            this.prisma.patient.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [orderBy]: sort },
                include: {
                    user: true
                }
            }),
            this.prisma.patient.count({ where: whereClause }),
        ]);

        return {
            success: true,
            message: 'patients retrieved successfully',
            statusCode: HttpStatus.OK,
            data: {
                patients: data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }


    async deletePatient(id: string): Promise<any> {
        const deleteUser = await this.prisma.patient.delete({
            where: {
                id
            },
        })

        return {
            success: true,
            message: 'patient deleted successfully',
            statusCode: HttpStatus.OK,
            data: deleteUser
        };

    }

    async updatePatient(id: string, dto: UpdatePatientDto): Promise<any> {
        const updatedPatient = await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                patientProfile: {
                    update: {  
                        contactNo: dto.contact,
                        gender: dto.gender,
                        bloodGroup: dto.bloodGroup,
                        age: dto.age,
                    }
                }
            },
            include: {
                patientProfile: true
            }
        });

        return {
            success: true,
            message: 'Patient information updated successfully',
            statusCode: HttpStatus.OK,
            data: updatedPatient
        };
    }
}
