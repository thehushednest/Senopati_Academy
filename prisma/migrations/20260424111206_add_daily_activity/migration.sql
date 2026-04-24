-- CreateTable
CREATE TABLE "daily_activity" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_activity_user_id_date_idx" ON "daily_activity"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activity_user_id_date_key" ON "daily_activity"("user_id", "date");

-- AddForeignKey
ALTER TABLE "daily_activity" ADD CONSTRAINT "daily_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
