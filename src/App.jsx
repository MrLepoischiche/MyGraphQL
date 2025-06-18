import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Auth from "./pages/Auth.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        // Store user in localStorage whenever it changes
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    return (
        <BrowserRouter>
            {
                !user ? (
                    <Routes>
                        <Route path="*" element={<Auth onUser={setUser} />} />
                    </Routes>
                ) : (
                    <Routes>
                        <Route path="*" element={<Home user={user} onUser={setUser} />} />
                    </Routes>
                )
            }
        </BrowserRouter>
    );
}