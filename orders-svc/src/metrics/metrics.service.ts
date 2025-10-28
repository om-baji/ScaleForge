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
  private readonly orderCreationDuration: Histogram;
  private readonly orderCreationTotal: Counter;
  private readonly orderCreationErrors: Counter;
  private readonly orderStatusUpdates: Counter;
  private readonly orderCancellations: Counter;
  private readonly stockOperations: Counter;
  private readonly databaseQueryDuration: Histogram;
  private readonly activeOrders: Gauge;
  private readonly queueJobsTotal: Counter;
  private readonly inventoryStock: Gauge;

  constructor() {
    this.register = new Registry();

    collectDefaultMetrics({ register: this.register });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
      registers: [this.register],
    });

    this.orderCreationDuration = new Histogram({
      name: 'order_creation_duration_seconds',
      help: 'Duration of order creation process',
      labelNames: ['status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.orderCreationTotal = new Counter({
      name: 'order_creation_total',
      help: 'Total number of order creation attempts',
      labelNames: ['status'],
      registers: [this.register],
    });

    this.orderCreationErrors = new Counter({
      name: 'order_creation_errors_total',
      help: 'Total number of order creation errors',
      labelNames: ['error_type'],
      registers: [this.register],
    });

    this.orderStatusUpdates = new Counter({
      name: 'order_status_updates_total',
      help: 'Total number of order status updates',
      labelNames: ['from_status', 'to_status'],
      registers: [this.register],
    });

    this.orderCancellations = new Counter({
      name: 'order_cancellations_total',
      help: 'Total number of order cancellations',
      labelNames: ['reason'],
      registers: [this.register],
    });

    this.stockOperations = new Counter({
      name: 'stock_operations_total',
      help: 'Total number of stock operations',
      labelNames: ['operation', 'product_id'],
      registers: [this.register],
    });

    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });

    this.activeOrders = new Gauge({
      name: 'active_orders',
      help: 'Number of active orders by status',
      labelNames: ['status'],
      registers: [this.register],
    });

    this.queueJobsTotal = new Counter({
      name: 'queue_jobs_total',
      help: 'Total number of queue jobs added',
      labelNames: ['queue_name', 'job_type'],
      registers: [this.register],
    });

    this.inventoryStock = new Gauge({
      name: 'inventory_stock',
      help: 'Current inventory stock levels',
      labelNames: ['product_id', 'product_name'],
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

  recordOrderCreation(status: 'success' | 'failure', duration: number) {
    this.orderCreationTotal.inc({ status });
    this.orderCreationDuration.observe({ status }, duration);
  }

  recordOrderCreationError(errorType: string) {
    this.orderCreationErrors.inc({ error_type: errorType });
  }

  recordOrderStatusUpdate(fromStatus: string, toStatus: string) {
    this.orderStatusUpdates.inc({
      from_status: fromStatus,
      to_status: toStatus,
    });
  }

  recordOrderCancellation(reason: string = 'user_initiated') {
    this.orderCancellations.inc({ reason });
  }

  recordStockOperation(
    operation: 'increment' | 'decrement',
    productId: string,
  ) {
    this.stockOperations.inc({ operation, product_id: productId });
  }

  recordDatabaseQuery(operation: string, table: string, duration: number) {
    this.databaseQueryDuration.observe({ operation, table }, duration);
  }

  setActiveOrders(status: string, count: number) {
    this.activeOrders.set({ status }, count);
  }

  recordQueueJob(queueName: string, jobType: string) {
    this.queueJobsTotal.inc({ queue_name: queueName, job_type: jobType });
  }

  setInventoryStock(productId: string, productName: string, stock: number) {
    this.inventoryStock.set(
      { product_id: productId, product_name: productName },
      stock,
    );
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
