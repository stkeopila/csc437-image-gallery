import express from "express";
import path from "path";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "../../shared/example.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { connectMongo } from "../connectMongo.js";
import { ImageProvider } from "../ImageProvider.js";
import { registerImageRoutes } from "../routes/imageRoutes.js"
import { CredentialsProvider } from "../CredentialsProvider.js";
import { registerAuthRoutes } from "../routes/authRoutes.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const IMAGE_UPLOAD_DIR = getEnvVar("IMAGE_UPLOAD_DIR") || "uploads";
const app = express();
const resolvedStatic = path.resolve(STATIC_DIR);
const resolvedUploadDir = path.resolve(IMAGE_UPLOAD_DIR);

app.use(express.static(resolvedStatic));
app.use("/uploads", express.static(resolvedUploadDir));
app.use(express.json());

async function startServer() {
    const mongoClient = await connectMongo();
    const imageProvider = new ImageProvider(mongoClient);
    const credentialsProvider = new CredentialsProvider(mongoClient);

    registerImageRoutes(app, imageProvider);
    registerAuthRoutes(app, credentialsProvider);

    const spaPaths = [
        ...Object.values(VALID_ROUTES).filter((p) => typeof p === 'string' && p !== VALID_ROUTES.IMAGE_PREFIX),
        `${VALID_ROUTES.IMAGE_PREFIX}/:imageId`,
    ];
    app.get(spaPaths, (req, res) => {
        res.sendFile(path.join(resolvedStatic, 'index.html'));
    });

    app.get("/api/hello", (req, res) => {
        res.send("Hello, World " + SHARED_TEST);
    });

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
    });
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
