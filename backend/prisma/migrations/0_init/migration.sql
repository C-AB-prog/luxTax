-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SOBER_DRIVER', 'DRIVER_BY_HOUR', 'DRIVER_WEEKEND', 'AIRPORT_TO', 'AIRPORT_FROM');

-- CreateEnum
CREATE TYPE "Airport" AS ENUM ('SVO', 'DME', 'VKO');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "telegram_id" TEXT NOT NULL,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "address" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3),
    "duration_hours" INTEGER,
    "approx_duration" TEXT,
    "airport" "Airport",
    "flight_number" TEXT,
    "comment" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
