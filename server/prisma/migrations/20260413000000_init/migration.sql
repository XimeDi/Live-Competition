-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "formation" TEXT NOT NULL DEFAULT '4-3-3',
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "squads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_players" (
    "id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "player_name" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "slot_index" INTEGER NOT NULL,

    CONSTRAINT "squad_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "home_team" TEXT NOT NULL,
    "away_team" TEXT NOT NULL,
    "home_nationality" TEXT NOT NULL,
    "away_nationality" TEXT NOT NULL,
    "home_flag" TEXT NOT NULL,
    "away_flag" TEXT NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "match_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "squads_user_id_key" ON "squads"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "squad_players_squad_id_slot_index_key" ON "squad_players"("squad_id", "slot_index");

-- AddForeignKey
ALTER TABLE "squads" ADD CONSTRAINT "squads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_players" ADD CONSTRAINT "squad_players_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
