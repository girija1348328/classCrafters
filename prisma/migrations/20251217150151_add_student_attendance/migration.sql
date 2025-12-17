/*
  Warnings:

  - You are about to drop the column `date` on the `StaffAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `markedById` on the `StaffAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `StaffAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `punchInTime` on the `StudentAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `punchOutTime` on the `StudentAttendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[staffRegId,punchInTime]` on the table `StaffAttendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `punchInById` to the `StaffAttendance` table without a default value. This is not possible if the table is not empty.
  - Made the column `punchInTime` on table `StaffAttendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classroomId` on table `StudentAttendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `markedById` on table `StudentAttendance` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "StaffAttendance" DROP CONSTRAINT "StaffAttendance_markedById_fkey";

-- DropForeignKey
ALTER TABLE "StudentAttendance" DROP CONSTRAINT "StudentAttendance_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAttendance" DROP CONSTRAINT "StudentAttendance_markedById_fkey";

-- DropIndex
DROP INDEX "StaffAttendance_staffRegId_date_key";

-- AlterTable
ALTER TABLE "StaffAttendance" DROP COLUMN "date",
DROP COLUMN "markedById",
DROP COLUMN "remarks",
ADD COLUMN     "punchInById" INTEGER NOT NULL,
ADD COLUMN     "punchInRemarks" TEXT,
ADD COLUMN     "punchOutById" INTEGER,
ADD COLUMN     "punchOutRemarks" TEXT,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "punchInTime" SET NOT NULL,
ALTER COLUMN "punchInTime" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "StudentAttendance" DROP COLUMN "punchInTime",
DROP COLUMN "punchOutTime",
ALTER COLUMN "classroomId" SET NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "markedById" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StaffAttendance_staffRegId_punchInTime_key" ON "StaffAttendance"("staffRegId", "punchInTime");

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_punchInById_fkey" FOREIGN KEY ("punchInById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_punchOutById_fkey" FOREIGN KEY ("punchOutById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
