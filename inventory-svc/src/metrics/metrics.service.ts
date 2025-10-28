import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Gauge,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  public readonly register: Registry;

  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestDuration: Histogram;
  private readonly productOperationsTotal: Counter;
  private readonly productOperationDuration: Histogram;
  private readonly stockOperationsTotal: Counter;
  private readonly stockOperationDuration: Histogram;
  private readonly stockOperationErrors: Counter;
  private readonly databaseQueryDuration: Histogram;
  private readonly totalProducts: Gauge;
  private readonly lowStockProducts: Gauge;
  private readonly outOfStockProducts: Gauge;
  private readonly totalInventoryValue: Gauge;
  private readonly averageStockLevel: Gauge;
  private readonly stockReservations: Counter;
  private readonly stockReservationFailures: Counter;
  private readonly bulkOperationsTotal: Counter;
  private readonly bulkOperationDuration: Histogram;
  private readonly productsByCategory: Gauge;
  private readonly stockTransactions: Counter;

  constructor() {
    this.register = new Registry();

    collectDefaultMetrics({ register: this.register });

    this.httpRequestsTotal = new Counter({
      name: 'inventory_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'inventory_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
      registers: [this.register],
    });

    this.productOperationsTotal = new Counter({
      name: 'inventory_product_operations_total',
      help: 'Total number of product operations',
      labelNames: ['operation', 'status'],
      registers: [this.register],
    });

    this.productOperationDuration = new Histogram({
      name: 'inventory_product_operation_duration_seconds',
      help: 'Duration of product operations',
      labelNames: ['operation'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });

    this.stockOperationsTotal = new Counter({
      name: 'inventory_stock_operations_total',
      help: 'Total number of stock operations',
      labelNames: ['operation', 'product_id'],
      registers: [this.register],
    });

    this.stockOperationDuration = new Histogram({
      name: 'inventory_stock_operation_duration_seconds',
      help: 'Duration of stock operations',
      labelNames: ['operation'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });

    this.stockOperationErrors = new Counter({
      name: 'inventory_stock_operation_errors_total',
      help: 'Total number of stock operation errors',
      labelNames: ['operation', 'error_type'],
      registers: [this.register],
    });

    this.databaseQueryDuration = new Histogram({
      name: 'inventory_database_query_duration_seconds',
      help: 'Duration of database queries',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });

    this.totalProducts = new Gauge({
      name: 'inventory_total_products',
      help: 'Total number of products in inventory',
      registers: [this.register],
    });

    this.lowStockProducts = new Gauge({
      name: 'inventory_low_stock_products',
      help: 'Number of products with low stock',
      labelNames: ['threshold'],
      registers: [this.register],
    });

    this.outOfStockProducts = new Gauge({
      name: 'inventory_out_of_stock_products',
      help: 'Number of products that are out of stock',
      registers: [this.register],
    });

    this.totalInventoryValue = new Gauge({
      name: 'inventory_total_value',
      help: 'Total value of inventory',
      registers: [this.register],
    });

    this.averageStockLevel = new Gauge({
      name: 'inventory_average_stock_level',
      help: 'Average stock level across all products',
      registers: [this.register],
    });

    this.stockReservations = new Counter({
      name: 'inventory_stock_reservations_total',
      help: 'Total number of stock reservations',
      labelNames: ['product_id', 'status'],
      registers: [this.register],
    });

    this.stockReservationFailures = new Counter({
      name: 'inventory_stock_reservation_failures_total',
      help: 'Total number of failed stock reservations',
      labelNames: ['product_id', 'reason'],
      registers: [this.register],
    });

    this.bulkOperationsTotal = new Counter({
      name: 'inventory_bulk_operations_total',
      help: 'Total number of bulk operations',
      labelNames: ['operation', 'item_count'],
      registers: [this.register],
    });

    this.bulkOperationDuration = new Histogram({
      name: 'inventory_bulk_operation_duration_seconds',
      help: 'Duration of bulk operations',
      labelNames: ['operation', 'item_count'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    this.productsByCategory = new Gauge({
      name: 'inventory_products_by_category',
      help: 'Number of products by category',
      labelNames: ['category'],
      registers: [this.register],
    });

    this.stockTransactions = new Counter({
      name: 'inventory_stock_transactions_total',
      help: 'Total number of stock transactions',
      labelNames: ['type', 'product_id'],
      registers: [this.register],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    duration: number,
  ) {
    this.httpRequestsTotal.inc({ method, route, status });
    this.httpRequestDuration.observe({ method, route, status }, duration);
  }

  recordProductOperation(
    operation: string,
    status: 'success' | 'failure',
    duration: number,
  ) {
    this.productOperationsTotal.inc({ operation, status });
    this.productOperationDuration.observe({ operation }, duration);
  }

  recordStockOperation(operation: string, productId: string, duration: number) {
    this.stockOperationsTotal.inc({ operation, product_id: productId });
    this.stockOperationDuration.observe({ operation }, duration);
  }

  recordStockOperationError(operation: string, errorType: string) {
    this.stockOperationErrors.inc({ operation, error_type: errorType });
  }

  recordDatabaseQuery(operation: string, table: string, duration: number) {
    this.databaseQueryDuration.observe({ operation, table }, duration);
  }

  setTotalProducts(count: number) {
    this.totalProducts.set(count);
  }

  setLowStockProducts(count: number, threshold: number) {
    this.lowStockProducts.set({ threshold: threshold.toString() }, count);
  }

  setOutOfStockProducts(count: number) {
    this.outOfStockProducts.set(count);
  }

  setTotalInventoryValue(value: number) {
    this.totalInventoryValue.set(value);
  }

  setAverageStockLevel(average: number) {
    this.averageStockLevel.set(average);
  }

  recordStockReservation(productId: string, status: 'success' | 'failure') {
    this.stockReservations.inc({ product_id: productId, status });
  }

  recordStockReservationFailure(productId: string, reason: string) {
    this.stockReservationFailures.inc({ product_id: productId, reason });
  }

  recordBulkOperation(operation: string, itemCount: number, duration: number) {
    this.bulkOperationsTotal.inc({
      operation,
      item_count: itemCount.toString(),
    });
    this.bulkOperationDuration.observe(
      { operation, item_count: itemCount.toString() },
      duration,
    );
  }

  setProductsByCategory(category: string, count: number) {
    this.productsByCategory.set({ category }, count);
  }

  recordStockTransaction(
    type: 'increment' | 'decrement' | 'set',
    productId: string,
  ) {
    this.stockTransactions.inc({ type, product_id: productId });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
