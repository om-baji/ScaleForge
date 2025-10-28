import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly inventoryService: AppService,
    // private readonly logger: PinoLogger,
  ) {
    // this.logger.setContext(InventoryController.name);
  }

  @Get('health')
  getHealth() {
    // this.logger.info('Health check endpoint called');
    return {
      success: true,
      data: {
        service: 'Inventory Service',
        status: 'OK',
        time: new Date().toISOString(),
      },
    };
  }

  @Post('products')
  async createProduct(
    @Body()
    data: {
      name: string;
      sku: string;
      description?: string;
      price: bigint;
      stock: number;
    },
  ) {
    // this.logger.info({ data }, 'Creating product');
    const product = await this.inventoryService.createProduct(data);
    return {
      success: true,
      data: { ...product, price: product.price.toString() },
    };
  }

  @Get('products')
  async getAllProducts() {
    // this.logger.info('Fetching all products');
    const products = await this.inventoryService.getAllProducts();
    return {
      success: true,
      data: products.map((p) => ({ ...p, price: p.price.toString() })),
    };
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    // this.logger.info({ id }, 'Fetching product by ID');
    const product = await this.inventoryService.getProduct(id);
    if (!product)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    return {
      success: true,
      data: { ...product, price: product.price.toString() },
    };
  }

  @Put('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      price?: bigint;
      stock?: number;
    },
  ) {
    // this.logger.info({ id, data }, 'Updating product');
    const product = await this.inventoryService.updateProduct(id, data);
    return {
      success: true,
      data: { ...product, price: product.price.toString() },
    };
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    // this.logger.info({ id }, 'Deleting product');
    await this.inventoryService.deleteProduct(id);
    return { success: true, message: 'Product deleted successfully' };
  }

  @Patch('products/:id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    // this.logger.info({ id, body }, 'Updating stock');
    const product = await this.inventoryService.updateStock(id, body.quantity);
    return {
      success: true,
      data: { ...product, price: product.price.toString() },
    };
  }

  @Patch('products/:id/stock/reduce')
  async reduceStock(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    // this.logger.info({ id, body }, 'Reducing stock');
    const product = await this.inventoryService.reduceStock(id, body.quantity);
    return {
      success: true,
      data: { ...product, price: product.price.toString() },
    };
  }

  @Get('products/:id/stock/check')
  async checkStock(@Param('id') id: string) {
    // this.logger.info({ id }, 'Checking stock');
    const stock = await this.inventoryService.checkStock(id);
    return { success: true, data: { stock } };
  }

  @Get('products/low-stock')
  async getLowStockProducts(@Query('threshold') threshold?: number) {
    // this.logger.info({ threshold }, 'Fetching low stock products');
    const products = await this.inventoryService.getLowStockProducts(
      threshold || 10,
    );
    return {
      success: true,
      data: products.map((p) => ({ ...p, price: p.price.toString() })),
    };
  }

  @Patch('products/stock/bulk-update')
  async bulkUpdateStock(
    @Body() body: { updates: { productId: string; quantity: number }[] },
  ) {
    // this.logger.info({ body }, 'Bulk updating stock');
    const results = await this.inventoryService.bulkUpdateStock(body.updates);
    return {
      success: true,
      data: results.map((p) => ({ ...p, price: p.price.toString() })),
    };
  }

  @Patch('products/:id/stock/reserve')
  async reserveStock(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    // this.logger.info({ id, body }, 'Reserving stock');
    const product = await this.inventoryService.reserveStock(id, body.quantity);
    return {
      success: true,
      data: { ...product, price: product.price.toString() },
    };
  }
}
