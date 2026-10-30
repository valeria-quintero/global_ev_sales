import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EvSalesModule } from './ev_sales/ev_sales.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, EvSalesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
