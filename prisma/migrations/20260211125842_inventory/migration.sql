-- CreateEnum
CREATE TYPE "public"."InventoryCategory" AS ENUM ('FURNITURE', 'ELECTRONICS', 'LAB', 'SPORTS', 'LIBRARY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InventoryStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'DAMAGED', 'UNDER_MAINTENANCE', 'DISPOSED');

-- CreateTable
CREATE TABLE "public"."Inventory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "public"."InventoryCategory" NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "availableQty" INTEGER NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "vendor" TEXT,
    "status" "public"."InventoryStatus" NOT NULL DEFAULT 'AVAILABLE',
    "institutionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryAllocation" (
    "id" SERIAL NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "staffId" INTEGER,
    "classroomId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryAllocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryAllocation" ADD CONSTRAINT "InventoryAllocation_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryAllocation" ADD CONSTRAINT "InventoryAllocation_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."StaffRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryAllocation" ADD CONSTRAINT "InventoryAllocation_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
