-- CreateEnum
CREATE TYPE "public"."FineType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."InstallmentType" AS ENUM ('MONTHLY', 'TERM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PaymentMode" AS ENUM ('CASH', 'BANK', 'ONLINE', 'CHEQUE', 'UPI');

-- CreateEnum
CREATE TYPE "public"."LedgerEntryType" AS ENUM ('CHARGE', 'PAYMENT', 'DISCOUNT', 'FINE', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "public"."FeeHead" (
    "id" SERIAL NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "default_amount" DECIMAL(65,30),
    "currency" TEXT DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeStructure" (
    "id" SERIAL NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "phase_id" INTEGER,
    "subgroup_id" INTEGER,
    "total_amount" DECIMAL(65,30),
    "currency" TEXT DEFAULT 'INR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeStructureHead" (
    "id" SERIAL NOT NULL,
    "fee_structure_id" INTEGER NOT NULL,
    "fee_head_id" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStructureHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeInstallment" (
    "id" SERIAL NOT NULL,
    "fee_structure_id" INTEGER NOT NULL,
    "installment_no" INTEGER NOT NULL,
    "installment_type" "public"."InstallmentType" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeDiscount" (
    "id" SERIAL NOT NULL,
    "fee_structure_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" "public"."DiscountType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "applies_to_head_id" INTEGER,
    "eligibility_criteria" JSONB,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeFineRule" (
    "id" SERIAL NOT NULL,
    "fee_structure_id" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "fine_type" "public"."FineType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "grace_period_days" INTEGER NOT NULL DEFAULT 0,
    "max_cap" DECIMAL(65,30),
    "apply_after_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeFineRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeAssignment" (
    "id" SERIAL NOT NULL,
    "student_registration_id" INTEGER NOT NULL,
    "fee_structure_id" INTEGER NOT NULL,
    "assigned_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by_id" INTEGER,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "due_amount" DECIMAL(65,30) NOT NULL,
    "outstanding_amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT DEFAULT 'INR',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeePayment" (
    "id" SERIAL NOT NULL,
    "fee_assignment_id" INTEGER NOT NULL,
    "student_registration_id" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(65,30) NOT NULL,
    "payment_mode" "public"."PaymentMode" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transaction_ref" TEXT,
    "received_by_id" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeePaymentHead" (
    "id" SERIAL NOT NULL,
    "fee_payment_id" INTEGER NOT NULL,
    "fee_head_id" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeePaymentHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeLedger" (
    "id" SERIAL NOT NULL,
    "fee_assignment_id" INTEGER NOT NULL,
    "entry_type" "public"."LedgerEntryType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balance_after" DECIMAL(65,30),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeeStructure_institution_id_idx" ON "public"."FeeStructure"("institution_id");

-- CreateIndex
CREATE INDEX "FeeStructure_phase_id_idx" ON "public"."FeeStructure"("phase_id");

-- CreateIndex
CREATE INDEX "FeeStructure_subgroup_id_idx" ON "public"."FeeStructure"("subgroup_id");

-- CreateIndex
CREATE INDEX "FeeStructureHead_fee_structure_id_idx" ON "public"."FeeStructureHead"("fee_structure_id");

-- CreateIndex
CREATE INDEX "FeeStructureHead_fee_head_id_idx" ON "public"."FeeStructureHead"("fee_head_id");

-- CreateIndex
CREATE INDEX "FeeInstallment_fee_structure_id_idx" ON "public"."FeeInstallment"("fee_structure_id");

-- CreateIndex
CREATE INDEX "FeeFineRule_fee_structure_id_idx" ON "public"."FeeFineRule"("fee_structure_id");

-- CreateIndex
CREATE INDEX "FeeAssignment_student_registration_id_idx" ON "public"."FeeAssignment"("student_registration_id");

-- CreateIndex
CREATE INDEX "FeeAssignment_fee_structure_id_idx" ON "public"."FeeAssignment"("fee_structure_id");

-- CreateIndex
CREATE INDEX "FeePayment_fee_assignment_id_idx" ON "public"."FeePayment"("fee_assignment_id");

-- CreateIndex
CREATE INDEX "FeePayment_student_registration_id_idx" ON "public"."FeePayment"("student_registration_id");

-- CreateIndex
CREATE INDEX "FeePaymentHead_fee_payment_id_idx" ON "public"."FeePaymentHead"("fee_payment_id");

-- CreateIndex
CREATE INDEX "FeePaymentHead_fee_head_id_idx" ON "public"."FeePaymentHead"("fee_head_id");

-- CreateIndex
CREATE INDEX "FeeLedger_fee_assignment_id_idx" ON "public"."FeeLedger"("fee_assignment_id");

-- AddForeignKey
ALTER TABLE "public"."FeeHead" ADD CONSTRAINT "FeeHead_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeStructure" ADD CONSTRAINT "FeeStructure_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeStructure" ADD CONSTRAINT "FeeStructure_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "public"."Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeStructure" ADD CONSTRAINT "FeeStructure_subgroup_id_fkey" FOREIGN KEY ("subgroup_id") REFERENCES "public"."SubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeStructureHead" ADD CONSTRAINT "FeeStructureHead_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."FeeStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeStructureHead" ADD CONSTRAINT "FeeStructureHead_fee_head_id_fkey" FOREIGN KEY ("fee_head_id") REFERENCES "public"."FeeHead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeInstallment" ADD CONSTRAINT "FeeInstallment_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."FeeStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeDiscount" ADD CONSTRAINT "FeeDiscount_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."FeeStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeDiscount" ADD CONSTRAINT "FeeDiscount_applies_to_head_id_fkey" FOREIGN KEY ("applies_to_head_id") REFERENCES "public"."FeeHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeFineRule" ADD CONSTRAINT "FeeFineRule_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."FeeStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeAssignment" ADD CONSTRAINT "FeeAssignment_student_registration_id_fkey" FOREIGN KEY ("student_registration_id") REFERENCES "public"."StudentRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeAssignment" ADD CONSTRAINT "FeeAssignment_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."FeeStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeAssignment" ADD CONSTRAINT "FeeAssignment_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeePayment" ADD CONSTRAINT "FeePayment_fee_assignment_id_fkey" FOREIGN KEY ("fee_assignment_id") REFERENCES "public"."FeeAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeePayment" ADD CONSTRAINT "FeePayment_student_registration_id_fkey" FOREIGN KEY ("student_registration_id") REFERENCES "public"."StudentRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeePayment" ADD CONSTRAINT "FeePayment_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeePaymentHead" ADD CONSTRAINT "FeePaymentHead_fee_payment_id_fkey" FOREIGN KEY ("fee_payment_id") REFERENCES "public"."FeePayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeePaymentHead" ADD CONSTRAINT "FeePaymentHead_fee_head_id_fkey" FOREIGN KEY ("fee_head_id") REFERENCES "public"."FeeHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeLedger" ADD CONSTRAINT "FeeLedger_fee_assignment_id_fkey" FOREIGN KEY ("fee_assignment_id") REFERENCES "public"."FeeAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
