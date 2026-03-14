import bcrypt from "bcrypt";
import { getEnvVar } from "./src/getEnvVar.js";

export class CredentialsProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.userCredsCollectionName = getEnvVar("CREDS_COLLECTION_NAME");
        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
        this.credsCollection = this.mongoClient.db().collection(this.userCredsCollectionName);
        this.usersCollection = this.mongoClient.db().collection(this.usersCollectionName);
    }

    async registerUser(username, email, password) {
        const existing = await this.credsCollection.findOne({ username });
        if (existing) {
            return false;
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await this.credsCollection.insertOne({
            username,
            password: hash,
        });

        await this.usersCollection.insertOne({
            username,
            email,
        });

        return true;
    }
    
    async loginUser(username, password) {
        const existingUser = await this.credsCollection.findOne({ username });
        if (!existingUser) {
            return false;
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordValid) {
            return false;
        }

        return true;
    }
}