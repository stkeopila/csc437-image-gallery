import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import "./LoginPage.css";

export function LoginPage({ isRegistering, onTokenChange }) {
    const [user, setUser] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !password || (isRegistering && !email)) {
            setResult({
                type: "error",
                message: "Please fill in all fields.",
            });
            return;
        }

        setIsPending(true);
        setResult(null);

        try {
            if (isRegistering) {
                const response = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user, email, password }),
                });
                if (response.ok) {
                    const { token } = await response.json();
                    localStorage.setItem("token", token);
                    onTokenChange(token);
                    navigate(VALID_ROUTES.HOME);
                } else {
                    const data = await response.json();
                    setResult({ type: "error", message: data.message || "Registration failed." });
                }
            } else {
                const response = await fetch("/api/auth/tokens", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user, password }),
                });
                if (response.ok) {
                    const { token } = await response.json();
                    if (!token) {
                        setResult({ type: "error", message: "No token returned from server." });
                        return;
                    }
                    localStorage.setItem("token", token);
                    onTokenChange(token);
                    navigate(VALID_ROUTES.HOME);
                } else {
                    const data = await response.json();
                    setResult({ type: "error", message: data.message || "Login failed." });
                }
            }
        } catch (err) {
            setResult({ type: "error", message: "Network error. Please try again." });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    name="username"
                    value={user}
                    disabled={isPending}
                    onChange={(e) => setUser(e.target.value)}
                    required
                />

                {isRegistering && (
                    <>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            disabled={isPending}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </>
                )}

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    disabled={isPending}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input type="submit" value={isPending ? "Please wait..." : "Submit"} disabled={isPending} />
            </form>

            <div aria-live="polite">
                {result && (
                    <p style={{ color: result.type === "error" ? "red" : "green" }}>
                        {result.message}
                    </p>
                )}
            </div>

            {isRegistering ? (
                <p>Already have an account? <Link to={VALID_ROUTES.LOGIN}>Login here</Link></p>
            ) : (
                <p>Don't have an account? <Link to={VALID_ROUTES.REGISTER}>Register here</Link></p>
            )}
        </>
    );
}
