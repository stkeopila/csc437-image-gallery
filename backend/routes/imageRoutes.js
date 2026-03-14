import { ObjectId } from "mongodb";
import { verifyAuthToken } from "./verifyTokens.js";
import { imageMiddlewareFactory, handleImageFileErrors } from "./imageUploadMiddleware.js";

const MAX_NAME_LENGTH = 100;


export function registerImageRoutes(app, imageProvider) {

    app.use("/api/images", verifyAuthToken);

    function waitDuration() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    app.get("/api/images", async (req, res) => {
        await waitDuration(1000);
        
        const images = await imageProvider.getAllImages();
        res.json(images);
    });


    app.get("/api/images/:imageId", async (req, res) => {
        await waitDuration(1000);
        const imageId = req.params.imageId;
        if (!ObjectId.isValid(imageId)) {
            return res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
        }

        const image = await imageProvider.getImageById(imageId);
        if (!image) {
            return res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
        }
        return res.json(image);
    });

    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req, res) => {
            const file = req.file;
            const name = req.body?.name;
            const authorUsername = req.userInfo?.username;

            if (!file || typeof name !== "string" || name.trim().length === 0 || typeof authorUsername !== "string") {
                return res.status(400).send({
                    error: "Bad Request",
                    message: "Missing file or image name"
                });
            }

            const trimmedName = name.trim();
            if (trimmedName.length > MAX_NAME_LENGTH) {
                return res.status(413).send({
                    error: "Content Too Large",
                    message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
                });
            }

            const src = `/uploads/${file.filename}`;
            const imageId = await imageProvider.createImage(src, trimmedName, authorUsername);
            return res.status(201).send({ imageId });
        }
    );

    app.patch("/api/images/:imageId", async (req, res) => {
        const { name } = req.body;
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).send({
                error: "Bad Request",
                message: "Request body must contain a non-empty string field: name"
            });
        }

        if (name.length > MAX_NAME_LENGTH) {
            return res.status(413).send({
                error: "Content Too Large",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
        }

        const imageId = req.params.imageId;
        if (!ObjectId.isValid(imageId)) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        const image = await imageProvider.getImageById(imageId);
        if (!image) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        const ownerUsername = String(
            image.author?.username ||
            (typeof image.author === "string" ? image.author : "") ||
            (typeof image.authorId === "string" ? image.authorId : "")
        ).trim();
        const requesterUsername = String(req.userInfo?.username ?? "").trim();
        const isOwner =
            ownerUsername.length > 0 &&
            requesterUsername.length > 0 &&
            ownerUsername.toLowerCase() === requesterUsername.toLowerCase();

        if (!isOwner) {
            return res.status(403).send({
                error: "Forbidden",
                message: "This user does not own this image",
                details: {
                    ownerUsername,
                    requesterUsername
                }
            });
        }

        const result = await imageProvider.updateImageName(imageId, name);
        if (result.matchedCount === 0) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }
        return res.status(204).send();
    });

}
