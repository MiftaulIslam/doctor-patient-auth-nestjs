import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { GetAllPatientDto } from 'src/domain/dtos';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PatientService {
    constructor(
        private prisma: PrismaService
    ) {}

    
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
            const doctor = await this.prisma.doctor.findUnique({ where: { id }, include: { user: true } });
            return doctor ? {
                success: true,
                message: 'patient retrieved successfully',
                statusCode: HttpStatus.OK,
                data: [doctor]
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
                doctors: data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

}
