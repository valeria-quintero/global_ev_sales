import { Module } from '@nestjs/common';
import { EvSalesService } from './ev_sales.service.js';
import { EvSalesController } from './ev_sales.controller.js';

@Module({
  providers: [EvSalesService],
  controllers: [EvSalesController]
})
export class EvSalesModule {}
