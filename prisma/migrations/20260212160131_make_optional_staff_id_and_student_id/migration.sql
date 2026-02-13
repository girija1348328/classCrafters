-- DropForeignKey
ALTER TABLE "public"."Alumni" DROP CONSTRAINT "Alumni_staffId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Alumni" DROP CONSTRAINT "Alumni_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Alumni" ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "staffId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Alumni" ADD CONSTRAINT "Alumni_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alumni" ADD CONSTRAINT "Alumni_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."StaffRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
