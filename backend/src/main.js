import express from "express";
import path from "path";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "../../shared/example.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { connectMongo } from "../connectMongo.js";
import { ImageProvider } from "../ImageProvider.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();
const resolvedStatic = path.resolve(STATIC_DIR);

const mongoClient = connectMongo();
const imageProvider = new ImageProvider(mongoClient);

app.use(express.static(resolvedStatic));
app.use(express.json());

const spaPaths = [
    ...Object.values(VALID_ROUTES).filter((p) => typeof p === 'string' && p !== VALID_ROUTES.IMAGE_PREFIX),
    `${VALID_ROUTES.IMAGE_PREFIX}/:imageId`,
];
app.get(spaPaths, (req, res) => {
    res.sendFile(path.join(resolvedStatic, 'index.html'));
});

app.get("/hello", (req, res) => {
    res.send("Hello, World " + SHARED_TEST);
});

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

app.get("/api/images", async (req, res) => {
    await waitDuration(1000);
    const images = await imageProvider.getAllImages();
    res.json(images);
});

app.get("/api/images/:id", async (req, res) => {
    await waitDuration(1000);
    try {
        const image = await imageProvider.getImageById(req.params.id);
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }
        res.json(image);
    } catch {
        res.status(400).json({ error: "Invalid image ID" });
    }
});

app.patch("/api/images/:id", async (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Missing or invalid \"name\" field" });
    }
    try {
        const result = await imageProvider.updateImageName(req.params.id, name);
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Image not found" });
        }
        res.status(204).send();
    } catch {
        res.status(400).json({ error: "Invalid image ID" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
