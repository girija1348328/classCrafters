-- DropForeignKey
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_staffId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryStructure" DROP CONSTRAINT "SalaryStructure_staffId_fkey";

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
