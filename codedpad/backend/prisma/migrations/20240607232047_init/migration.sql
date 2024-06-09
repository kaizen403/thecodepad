-- CreateTable
CREATE TABLE "Secret" (
    "id" SERIAL NOT NULL,
    "secret" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Secret_secret_key" ON "Secret"("secret");
