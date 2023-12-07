import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductEventConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProductEventConsumer.name);
  private channel: amqp.Channel;

  constructor(private productRepository: ProductRepository) {}

  async onModuleInit() {
    const connection = await amqp.connect('amqps://');
    this.channel = await connection.createChannel();
    await this.channel.assertQueue('update-product', { durable: true });
    await this.channel.bindQueue('update-product', 'payment-service', '');
    await this.processUpdateProductCountEvent();
  }

  private async processUpdateProductCountEvent() {
    this.channel.consume('update-product', async (message) => {
      if (message) {
        let content: { productId: number; count: number };
        try {
          content = JSON.parse(message.content.toString());
          this.productRepository
            .updateProductCount(content.productId, content.count)
            .then(() => {
              this.channel.ack(message);
            });
        } catch (error) {
          this.logger.error('Invalid message format', error);
          this.channel.ack(message);
        }
      }
    });
  }
}
