/*
  Warnings:

  - Added the required column `academic_sessionId` to the `StudentRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classroom_id` to the `StudentRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section_id` to the `StudentRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `StudentRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `StudentRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AdmissionStatus" AS ENUM ('APPLIED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('AADHAR', 'BIRTH_CERTIFICATE', 'TRANSFER_CERTIFICATE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."StudentRegistration" ADD COLUMN     "academic_sessionId" INTEGER NOT NULL,
ADD COLUMN     "classroom_id" INTEGER NOT NULL,
ADD COLUMN     "rollNumber" INTEGER,
ADD COLUMN     "section_id" INTEGER NOT NULL,
ADD COLUMN     "status" "public"."AdmissionStatus" NOT NULL,
ADD COLUMN     "student_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" SERIAL NOT NULL,
    "admissionNo" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" BOOLEAN NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentDocument" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Parent" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "guardianName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "occupation" TEXT,
    "annualIncome" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademicSession" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Section" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNo_key" ON "public"."Student"("admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_studentId_key" ON "public"."Parent"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_name_key" ON "public"."AcademicSession"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_classId_name_key" ON "public"."Section"("classId", "name");

-- AddForeignKey
ALTER TABLE "public"."StudentRegistration" ADD CONSTRAINT "StudentRegistration_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRegistration" ADD CONSTRAINT "StudentRegistration_academic_sessionId_fkey" FOREIGN KEY ("academic_sessionId") REFERENCES "public"."AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRegistration" ADD CONSTRAINT "StudentRegistration_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "public"."Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRegistration" ADD CONSTRAINT "StudentRegistration_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentDocument" ADD CONSTRAINT "StudentDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Parent" ADD CONSTRAINT "Parent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
