-- CreateTable
CREATE TABLE "telegram_configs" (
    "id" TEXT NOT NULL,
    "botToken" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertOnDown" BOOLEAN NOT NULL DEFAULT true,
    "alertOnDegraded" BOOLEAN NOT NULL DEFAULT true,
    "alertOnRecovery" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_notification_logs" (
    "id" TEXT NOT NULL,
    "telegramConfigId" TEXT NOT NULL,
    "incidentId" TEXT,
    "monitorId" TEXT,
    "monitorName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "telegram_notification_logs_telegramConfigId_sentAt_idx" ON "telegram_notification_logs"("telegramConfigId", "sentAt");

-- CreateIndex
CREATE INDEX "telegram_notification_logs_monitorId_type_sentAt_idx" ON "telegram_notification_logs"("monitorId", "type", "sentAt");

-- AddForeignKey
ALTER TABLE "telegram_notification_logs" ADD CONSTRAINT "telegram_notification_logs_telegramConfigId_fkey" FOREIGN KEY ("telegramConfigId") REFERENCES "telegram_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
