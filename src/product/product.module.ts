import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { ProductEventProducer } from './product.event-producer';
import { ProductEventConsumer } from './product.event-consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [
    ProductService,
    ProductRepository,
    ProductEventProducer,
    ProductEventConsumer,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
