/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PrismaClient } from '@prisma/client';
import { IGenericRepository } from "./IRepository.repository";

export class GenericRepository<T extends { id: string }> implements IGenericRepository<T> {
    constructor(
      private readonly prismaClient:PrismaClient,
      private readonly model: keyof PrismaClient) {}
      private get repo() {
        return this.prismaClient[this.model];
      }
    create(data: Partial<T>): Promise<T> {
      return this.repo.create({
        data:{
          ...data
        }
      });
    }
  
    findAll(): Promise<T[]> {
      return this.repo.findMany();
    }
  
    findById(id: string): Promise<T | null> {
      return this.repo.findUnique({ where: { id } });
    }
  
    findUnique(where: any): Promise<T | null> {
      return this.repo.findUnique({ where });
    }
  
    update(id: string, data: Partial<T>): Promise<T> {
      return this.repo.update({ where: { id }, data });
    }
  
    delete(id: string): Promise<void> {
      return this.repo.delete({ where: { id } });
    }
  }
  