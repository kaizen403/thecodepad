"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
// Helper function to ensure key is the correct length
function getKeyFromPassword(password, keyLength) {
    return (0, crypto_1.scryptSync)(password, "salt", keyLength); // Using 'salt' here is not recommended for production
}
function encrypt(text, password) {
    const key = getKeyFromPassword(password, 32); // AES-256 requires a 32-byte key
    const iv = (0, crypto_1.randomBytes)(16); // AES block size is 16 bytes
    const cipher = (0, crypto_1.createCipheriv)("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
    ]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}
function decrypt(encrypted, password) {
    const [ivHex, contentHex] = encrypted.split(":");
    const key = getKeyFromPassword(password, 32);
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(contentHex, "hex");
    const decipher = (0, crypto_1.createCipheriv)("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
}
app.post("/open", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { word } = req.body;
    if (!word) {
        return res.status(400).send("Word is required.");
    }
    // Using the word as both the secret key and the text to encrypt
    const encrypted = encrypt(word, word);
    try {
        const secretEntry = yield prisma.secret.findUnique({
            where: {
                secret: encrypted,
            },
        });
        if (secretEntry) {
            return res
                .status(200)
                .json({ message: "Secret already exists.", data: secretEntry.data });
        }
        const newSecret = yield prisma.secret.create({
            data: {
                secret: encrypted,
                data: "Some associated data with the new secret",
            },
        });
        return res.status(200).json(newSecret);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Server error.");
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
