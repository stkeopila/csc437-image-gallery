import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { ImageNameEditor } from "./ImageNameEditor.tsx";

function decodeJwtUsername(token) {
    if (!token) return "(none)";
    try {
        const payloadSegment = token.split(".")[1];
        const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(normalized));
        return payload?.username ?? "(unknown)";
    } catch {
        return "(invalid token)";
    }
}

function getOwnerLabel(image) {
    if (image?.author?.username) return image.author.username;
    if (typeof image?.author === "string") return image.author;
    if (image?.author?._id) return String(image.author._id);
    if (image?.authorId) return String(image.authorId);
    return "owner unavailable";
}

export function ImageDetails({ authToken }) {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const loggedInUsername = decodeJwtUsername(authToken);

    useEffect(() => {
        async function doFetch() {
            try {
                const response = await fetch(`/api/images/${imageId}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setImage(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        doFetch();
    }, [imageId, authToken]);

    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>{error}</p>;
    }
    if (!image) {
        return <h2>Image not found</h2>;
    }
    const ownerLabel = getOwnerLabel(image);
    return (
        <div>
            <h2>{image.name}</h2>
            <p>Logged in as: {loggedInUsername}</p>
            <p>Owned by: {ownerLabel}</p>
            {loggedInUsername !== ownerLabel && (
                <p style={{ color: "#a33" }}>
                    You can only rename images you own.
                </p>
            )}
            <ImageNameEditor
                imageId={image._id}
                initialValue={image.name}
                authToken={authToken}
                onNameChange={(newName) => setImage(prev => ({ ...prev, name: newName }))}
            />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </div>
    );
}
