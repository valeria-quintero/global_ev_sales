import 'dotenv/config';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'csv-parse';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../src/generated/prisma/client.js';

const CSV_PATH = resolve(import.meta.dirname, '../../data/IEA Global EV Data 2024.csv');
const PARAMETERS = new Set(['EV sales', 'EV stock', 'EV sales share']);
const BATCH = 2000;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Row = {
  region: string; 
  category: string; 
  parameter: string; 
  mode: string;
  powertrain: string; 
  year: string; 
  unit: string; 
  value: string;
};

async function main() {
  await prisma.evSale.deleteMany();

  const parser = createReadStream(CSV_PATH).pipe(
    parse({ columns: true, trim: true, skip_empty_lines: true, bom: true }),
  );

  //lista de filas pendientes por insertar
  let batch: Prisma.EvSaleCreateManyInput[] = [];
  //cuenta lo insertado
  let total = 0;
  //cuenta lo descartado
  let skipped = 0;

  let regions: string[] = []
  let powertrains: string[] = []
  let modes: string[] = []
  let years: number[] = []

  for await (const r of parser as AsyncIterable<Row>) {
    const year = Number(r.year);
    const value = Number(r.value);

    if (!PARAMETERS.has(r.parameter) || !Number.isInteger(year) || !Number.isFinite(value)) {
      skipped++;
      continue;
    }
    //agrega al final de la lista
    batch.push({
      region: r.region, category: r.category, parameter: r.parameter, mode: r.mode,
      powertrain: r.powertrain, year, unit: r.unit, value,
    });

    //valores únicos para los selectores
    if (!regions.includes(r.region)) {
      regions.push(r.region)
    }

    if (!powertrains.includes(r.powertrain)) {
      powertrains.push(r.powertrain)
    }

    if (!modes.includes(r.mode)) {
      modes.push(r.mode)
    }

    if (!years.includes(year)) {
      years.push(year)
    }

    if (batch.length >= BATCH) {
      await prisma.evSale.createMany({ data: batch });
      total += batch.length;
      batch = [];
    }
  }

  //para las filas sobrantes
  if (batch.length) {
    await prisma.evSale.createMany({ data: batch });
    total += batch.length;
  }
  console.log(`Insertados: ${total} | Descartados: ${skipped}`);

  console.log(`Regiones: ${regions} \n ${powertrains} \n ${modes} \n ${years}`)
}

main().finally(() => prisma.$disconnect());
