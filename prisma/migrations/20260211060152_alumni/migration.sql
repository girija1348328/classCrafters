-- CreateEnum
CREATE TYPE "public"."AlumniType" AS ENUM ('STUDENT', 'STAFF');

-- CreateEnum
CREATE TYPE "public"."AlumniStatus" AS ENUM ('STUDYING', 'WORKING', 'ENTREPRENEUR', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Alumni" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "alumniType" "public"."AlumniType" NOT NULL,
    "passOutYear" INTEGER NOT NULL,
    "lastClass" TEXT,
    "lastDesignation" TEXT,
    "currentStatus" "public"."AlumniStatus" NOT NULL DEFAULT 'OTHER',
    "currentOrg" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alumni_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Alumni" ADD CONSTRAINT "Alumni_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alumni" ADD CONSTRAINT "Alumni_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."StaffRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alumni" ADD CONSTRAINT "Alumni_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
