import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductEventProducer } from './product.event-producer';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    private dataSource: DataSource,
    private productEventProducer: ProductEventProducer,
  ) {}

  findAllInStock(): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        count: MoreThan(0),
      },
    });
  }

  findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOneBy({ id });
  }

  async addOne(product: Product): Promise<Product> {
    const newProduct = this.productRepository.create(product);
    return newProduct;
  }

  async updateProductCount(id: number, count: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const product = await queryRunner.manager.findOneBy(Product, { id });
      product.count = product.count + count;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async buyProduct(id: number, count: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const product = await queryRunner.manager.findOneBy(Product, { id });

      if (product.count - count >= 0) {
        product.count = product.count - count;
        await queryRunner.manager.save(product);
      }

      await queryRunner.commitTransaction();
      await this.productEventProducer.send({
        productId: product.id,
        price: product.price,
        count: product.count,
      });
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
