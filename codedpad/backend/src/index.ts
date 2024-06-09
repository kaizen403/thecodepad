import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createHmac } from "crypto";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

function encrypt(text: string): string {
  // Using HMAC SHA-256 for encryption
  const secretKey = "kaiz21"; // This should be kept secure and possibly stored in environment variables
  return createHmac("sha256", secretKey).update(text).digest("hex");
}

app.post("/open", async (req: Request, res: Response) => {
  const { word } = req.body;
  if (!word) {
    return res.status(400).send("Word is required.");
  }

  const encryptedText = encrypt(word);

  try {
    let secretEntry = await prisma.secret.findUnique({
      where: { secret: encryptedText },
    });

    if (!secretEntry) {
      secretEntry = await prisma.secret.create({
        data: {
          secret: encryptedText,
          data: "",
        },
      });
    }

    return res.status(200).json({
      message: "Processed secret.",
      secret: encryptedText,
      data: secretEntry.data || "",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error.");
  }
});

app.put("/update", async (req, res) => {
  const { secret, data } = req.body;
  try {
    const updatedSecret = await prisma.secret.update({
      where: { secret },
      data: { data },
    });
    res.status(200).json(updatedSecret);
  } catch (error) {
    console.error("Failed to update:", error);
    res.status(500).send("Failed to update data");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
