import express from "express";
import path from "path";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "../../shared/example.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();
const resolvedStatic = path.resolve(STATIC_DIR);
app.use(express.static(resolvedStatic));

// Serve index.html only for known SPA routes so unknown routes still 404
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
