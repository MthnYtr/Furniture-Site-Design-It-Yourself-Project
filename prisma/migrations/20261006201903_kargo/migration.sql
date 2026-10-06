-- AlterTable
ALTER TABLE `order` ADD COLUMN `cargoCompany` VARCHAR(191) NULL,
    ADD COLUMN `shippedAt` DATETIME(3) NULL,
    ADD COLUMN `trackingCode` VARCHAR(191) NULL;
