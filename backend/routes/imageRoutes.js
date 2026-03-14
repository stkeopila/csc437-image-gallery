import { ObjectId } from "mongodb";
import { verifyAuthToken } from "./verifyTokens.js";

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

        if (image.author?.username !== req.userInfo.username) {
            return res.status(403).send({
                error: "Forbidden",
                message: "This user does not own this image"
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
