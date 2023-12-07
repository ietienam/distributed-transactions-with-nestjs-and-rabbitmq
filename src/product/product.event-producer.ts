import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class ProductEventProducer implements OnModuleInit {
  private readonly logger = new Logger(ProductEventProducer.name);
  private channel: amqp.Channel;

  constructor() {}

  async onModuleInit() {
    const connection = await amqp.connect('amqps://');
    this.channel = await connection.createChannel();
    await this.channel.assertQueue('buy-product', { durable: true });
    await this.channel.assertExchange('buy-product', 'fanout', {
      durable: true,
    });
    await this.channel.bindQueue('buy-product', 'inventory-service', '');
  }

  async send(data: {
    productId: number;
    count: number;
    price: string;
  }): Promise<void> {
    try {
      this.channel.publish(
        'buy-product',
        'inventory-service',
        Buffer.from(JSON.stringify(data)),
      );
    } catch (error) {
      this.logger.error(`${error}`);
    }
  }
}
