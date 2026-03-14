import "./Header.css";
import { Link } from "react-router";
import { useState } from "react";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";

export function Header() {
    const [checked, setChecked] = useState(false);
    return (
        <header>
            <h1>My cool image site</h1>
            <div>
                <label>
                    Some switch (dark mode?) <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
                </label>
                <nav>
                    <Link to={VALID_ROUTES.HOME}>Home</Link>
                    <Link to={VALID_ROUTES.UPLOAD}>Upload</Link>
                    <Link to={VALID_ROUTES.LOGIN}>Log in</Link>
                </nav>
            </div>
        </header>
    );
}
