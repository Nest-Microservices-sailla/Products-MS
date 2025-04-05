import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

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

    const totalPages = await this.product.count({
      where: {
        available: true
      }
    })

    const lastPage = Math.ceil(totalPages / limit)

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
        totalPages,
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
      throw new NotFoundException('Product not found')
    }

    return product
  }


  //Todo - Update Product --------------------------

  async update(id: number, updateProductDto: UpdateProductDto) {

    const{ id:_, ...data} = updateProductDto

    await this.findOne(id)
    
    return await this.product.update({
      where: {id},
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
        where: {id},
        data: {available: false}
      })

      return{
        message: 'Product deleted successfully',
        product
      }

  }

  //! - Error --------------------------------------

}

