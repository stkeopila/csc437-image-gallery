import jwt from "jsonwebtoken";
import { getEnvVar } from "../src/getEnvVar.js";

/**
 * Creates a Promise for a JWT token, with a specified username embedded inside.
 *
 * @param username the username to embed in the JWT token
 * @return a Promise for a JWT
 */
function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        const payload = {
            username
        };
        jwt.sign(
            payload,
            getEnvVar("JWT_SECRET"),
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token);
            }
        );
    });
}

export function registerAuthRoutes(app, credentialsProvider) {
    
    app.post("/api/users", async (req, res) => {
        const { username, email, password } = req.body ?? {};

        if (
            typeof username !== "string" || username.trim().length === 0 ||
            typeof email !== "string" || email.trim().length === 0 ||
            typeof password !== "string" || password.length === 0
        ) {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username, email, or password"
            });
        }

        const didRegister = await credentialsProvider.registerUser(username, email, password);
        if (!didRegister) {
            return res.status(409).send({
                error: "Conflict",
                message: "Username already taken"
            });
        }

        const token = await generateAuthToken(username);
        return res.status(201).send({ token });
    });

    app.post("/api/auth/tokens", async (req, res) => {
        const { username, password } = req.body ?? {};
        if (
            typeof username !== "string" || username.trim().length === 0 ||
            typeof password !== "string" || password.trim().length === 0
        ) {
            return res.status(400).send({
                error: "Bad Request",
                message: "Missing username or password"
            });
        }

        const didLogin = await credentialsProvider.loginUser(username, password);
        if (!didLogin) {
            return res.status(401).send({
                error: "Unauthorized",
                message: "Username or password is incorrect"
            });
        }

        const token = await generateAuthToken(username);
        return res.status(200).send({ token });
    });
}