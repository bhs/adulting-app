-- Manual rollback for 20260725_add_auth_tables.
--
-- Prisma has no native "down" migrations, so this companion script reverses the
-- up migration for local rollbacks and demo teardown (see .mendel/migration.json).
-- It drops the Auth.js tables and the columns added to User while leaving all
-- pre-existing application data (User rows, Post rows) untouched.

-- DropForeignKey / DropTable
DROP TABLE IF EXISTS "Account";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "VerificationToken";

-- AlterTable: remove the Auth.js columns from User.
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "User" DROP COLUMN IF EXISTS "image";
