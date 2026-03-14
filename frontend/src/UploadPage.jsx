import { useActionState, useId, useState } from "react";

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
                return `Upload failed: HTTP ${response.status} ${response.statusText}`;
            }

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
