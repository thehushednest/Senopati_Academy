-- CreateEnum
CREATE TYPE "LiveEventStatus" AS ENUM ('scheduled', 'live', 'ended', 'cancelled');

-- CreateTable
CREATE TABLE "live_events" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "host_id" UUID NOT NULL,
    "module_slug" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "meeting_url" TEXT NOT NULL,
    "recording_url" TEXT,
    "status" "LiveEventStatus" NOT NULL DEFAULT 'scheduled',
    "max_participants" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_rsvps" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rsvp_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended" BOOLEAN,

    CONSTRAINT "live_event_rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_events_scheduled_at_idx" ON "live_events"("scheduled_at");

-- CreateIndex
CREATE INDEX "live_events_module_slug_idx" ON "live_events"("module_slug");

-- CreateIndex
CREATE INDEX "live_events_host_id_idx" ON "live_events"("host_id");

-- CreateIndex
CREATE INDEX "live_event_rsvps_user_id_idx" ON "live_event_rsvps"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_rsvps_event_id_user_id_key" ON "live_event_rsvps"("event_id", "user_id");

-- AddForeignKey
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_rsvps" ADD CONSTRAINT "live_event_rsvps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_rsvps" ADD CONSTRAINT "live_event_rsvps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
