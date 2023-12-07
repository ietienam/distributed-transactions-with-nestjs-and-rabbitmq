import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  getProduct(id: number) {
    return this.productRepository.findOne(id);
  }

  getAvailableProducts() {
    return this.productRepository.findAllInStock();
  }

  buyProduct(id: number, amount: number) {
    return this.productRepository.buyProduct(id, amount);
  }
}
