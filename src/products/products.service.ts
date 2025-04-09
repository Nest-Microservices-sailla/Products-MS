import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('DataBase-Info (Products Services)')

  onModuleInit() {
    this.$connect()
    this.logger.log('Database connected successfully')
  }

  //Todo - Create Product --------------------------

  async create(createProductDto: CreateProductDto) {

    return await this.product.create({
      data: createProductDto
    })
  }


  //Todo - Find Product ----------------------------

  async findAll(paginationDto: PaginationDto) {

    const { page = 1, limit = 10 } = paginationDto

    const totalProducts = await this.product.count({
      where: {
        available: true
      }
    })

    const lastPage = Math.ceil(totalProducts / limit)

    return {
      data: await this.product.findMany({
        orderBy: {
          id: 'asc',
        },
        where: {
          available: true
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      metadata: {
        page,
        totalProducts,
        lastPage
      }
    }
  }


  //Todo - Find by Id Product ----------------------

  async findOne(id: number) {

    const product = await this.product.findUnique({
      where: {
        id,
        available: true
      }
    })

    if (!product) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Product with id: ${id}, not found`
      })
    }

    return product
  }


  //Todo - Update Product --------------------------

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: _, ...data } = updateProductDto

    await this.findOne(id)

    return await this.product.update({
      where: { id },
      data: data
    })

  }

  //Todo - Delete Product --------------------------

  async remove(id: number) {

    await this.findOne(id)

    /* return await this.product.delete({
      where: {
        id
      }
    }) */

    const product = await this.product.update({
      where: { id },
      data: { available: false }
    })

    return {
      message: 'Product deleted successfully',
      product
    }

  }

  //Todo - Validate Product --------------------------

  async validateProduct(ids: number[]) {

    ids = Array.from(new Set(ids))
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        },
        available: true
      }
    })

    if (products.length !== ids.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'One or more products not found'
      })
    }
    
    return products

  }


  //! - Error --------------------------------------

}

