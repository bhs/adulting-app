-- DropForeignKey
ALTER TABLE "ExpenseItem" DROP CONSTRAINT "ExpenseItem_budgetCalculationId_fkey";

-- DropForeignKey
ALTER TABLE "IncomeItem" DROP CONSTRAINT "IncomeItem_budgetCalculationId_fkey";

-- DropForeignKey
ALTER TABLE "BudgetCalculation" DROP CONSTRAINT "BudgetCalculation_userId_fkey";

-- DropTable
DROP TABLE "ExpenseItem";

-- DropTable
DROP TABLE "IncomeItem";

-- DropTable
DROP TABLE "BudgetCalculation";
