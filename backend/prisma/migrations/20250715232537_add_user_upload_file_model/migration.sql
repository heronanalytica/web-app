-- CreateTable
CREATE TABLE "UserUploadFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "columns" TEXT[],
    "type" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserUploadFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserUploadFile" ADD CONSTRAINT "UserUploadFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
