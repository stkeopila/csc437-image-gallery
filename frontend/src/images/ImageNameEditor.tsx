import { useState } from "react";

interface Props {
    imageId: string;
    initialValue: string;
    authToken: string;
    onNameChange: (newName: string) => void;
}

export function ImageNameEditor({ imageId, initialValue, authToken, onNameChange }: Props) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
    }

    async function handleSubmitPressed() {
        setIsSubmitting(true);
        setSubmitError("");
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ name: nameInput })
            });
            if (!response.ok) {
                let errorMessage = `Error: HTTP ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.json();
                    if (errorBody?.message) {
                        errorMessage = errorBody.message;
                    }
                    if (response.status === 403 && errorBody?.details) {
                        const owner = errorBody.details.ownerUsername ?? "(missing)";
                        const requester = errorBody.details.requesterUsername ?? "(missing)";
                        errorMessage += ` (owner: ${owner}, requester: ${requester})`;
                    }
                } catch {
                    throw new Error(errorMessage);
                }
                throw new Error(errorMessage);
            }
            onNameChange(nameInput);
            setIsEditingName(false);
        } catch (err) {
            setSubmitError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name
                    <input
                        required
                        disabled={isSubmitting}
                        style={{ marginLeft: "0.5em" }}
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                    />
                </label>
                <button disabled={nameInput.length === 0 || isSubmitting} onClick={handleSubmitPressed}>Submit</button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
                <div aria-live="polite">
                    {isSubmitting && <p>Renaming image...</p>}
                    {submitError && <p style={{ color: "red" }}>{submitError}</p>}
                </div>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={handleEditPressed}>Edit name</button>
            </div>
        );
    }
}
