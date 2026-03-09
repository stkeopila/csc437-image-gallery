import "./Header.css";
import { Link } from "react-router";
import { useState } from "react";

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
                    <Link to="/">Home</Link>
                    <Link to="/upload">Upload</Link>
                    <Link to="/login">Log in</Link>
                </nav>
            </div>
        </header>
    );
}
