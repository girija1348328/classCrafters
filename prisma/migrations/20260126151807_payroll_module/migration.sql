-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('GENERATED', 'PAID');

-- CreateEnum
CREATE TYPE "PayrollItemType" AS ENUM ('EARNING', 'DEDUCTION');

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "basicPay" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION,
    "allowances" DOUBLE PRECISION,
    "deductions" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "totalDeductions" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollItem" (
    "id" SERIAL NOT NULL,
    "payrollId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "PayrollItemType" NOT NULL,

    CONSTRAINT "PayrollItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructure_staffId_key" ON "SalaryStructure"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_staffId_month_year_key" ON "Payroll"("staffId", "month", "year");

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
