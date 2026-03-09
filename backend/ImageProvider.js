import { ObjectId } from "mongodb";
import { getEnvVar } from "./src/getEnvVar.js";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.imagesCollectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
        this.collection = this.mongoClient.db().collection(this.imagesCollectionName);
    }

    _lookupAuthorPipeline() {
        return [
            {
                $lookup: {
                    from: this.usersCollectionName,
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $set: { author: { $arrayElemAt: ["$author", 0] } }
            }
        ];
    }

    async getAllImages() {
        return this.collection.aggregate(this._lookupAuthorPipeline()).toArray();
    }

    async getImageById(id) {
        const pipeline = [
            { $match: { _id: new ObjectId(id) } },
            ...this._lookupAuthorPipeline()
        ];
        const results = await this.collection.aggregate(pipeline).toArray();
        return results[0] ?? null;
    }

    async updateImageName(id, newName) {
        return this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { name: newName } }
        );
    }
}