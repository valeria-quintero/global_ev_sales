-- CreateTable
CREATE TABLE "EvSale" (
    "id" SERIAL NOT NULL,
    "region" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "powertrain" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EvSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvSale_parameter_mode_powertrain_year_idx" ON "EvSale"("parameter", "mode", "powertrain", "year");

-- CreateIndex
CREATE INDEX "EvSale_region_year_idx" ON "EvSale"("region", "year");
