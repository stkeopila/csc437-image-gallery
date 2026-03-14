import { useActionState, useId, useState } from "react";
import { useNavigate } from "react-router";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });
}

export function UploadPage({ authToken }) {
    const imageInputId = useId();
    const nameInputId = useId();
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const navigate = useNavigate();

    const [submitResult, submitAction, isPending] = useActionState(async (_previousResult, formData) => {
        try {
            const response = await fetch("/api/images", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                setImagePreviewUrl("");
                try {
                    const errorBody = await response.json();
                    return errorBody?.message || `Upload failed: HTTP ${response.status} ${response.statusText}`;
                } catch {
                    return `Upload failed: HTTP ${response.status} ${response.statusText}`;
                }
            }

            const data = await response.json();
            if (typeof data?.imageId !== "string" || data.imageId.length === 0) {
                return "Upload failed: server did not return image id";
            }

            navigate(`${VALID_ROUTES.IMAGE_PREFIX}/${data.imageId}`);

            return "";
        } catch (error) {
            setImagePreviewUrl("");
            return `Upload failed: ${error?.message || "Network error"}`;
        }
    }, "");

    async function handleImageChange(event) {
        const file = event.target.files?.[0];
        if (!file) {
            setImagePreviewUrl("");
            return;
        }

        try {
            const dataUrl = await readAsDataURL(file);
            setImagePreviewUrl(dataUrl);
        } catch {
            setImagePreviewUrl("");
        }
    }

    return (
        <>
            <h2>Upload</h2>
            <form action={submitAction}>
            <div>
                <label htmlFor={imageInputId}>Choose image to upload: </label>
                <input
                    id={imageInputId}
                    name="image"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleImageChange}
                    disabled={isPending}
                    required
                />
            </div>
            <div>
                <label htmlFor={nameInputId}>Image title: </label>
                <input id={nameInputId} name="name" disabled={isPending} required />
            </div>

            <div> {/* Preview img element */}
                {imagePreviewUrl && (
                    <img style={{width: "20em", maxWidth: "100%"}} src={imagePreviewUrl} alt="Selected upload preview" />
                )}
            </div>
            <div>
                <input type="submit" value={isPending ? "Uploading..." : "Confirm upload"} disabled={isPending} />
            </div>
            <div aria-live="polite">
                {submitResult && <p style={{ color: "red" }}>{submitResult}</p>}
            </div>
        </form>
        </>
    );
}
