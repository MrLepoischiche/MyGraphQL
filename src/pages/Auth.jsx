import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth({ onUser }) {
    const navigate = useNavigate();

    const [userLog, setUserLog] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // Reset error when username or password changes
        setError("");
    }, [userLog, password]);

    const SignIn = async (credentials) => {
        let result = {
            data: null,
            error: null
        };

        // Fetch API for user sign-in
        const response = await fetch("https://zone01normandie.org/api/auth/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization":  "Basic " + btoa(`${credentials.username}:${credentials.password}`),
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            result.error = `HTTP error! status: ${response.status}`;
            return result;
        }
        try {
            const data = await response.json();
            result.data = data;
        } catch (error) {
            result.error = `Error parsing JSON: ${error.message}`;
        }
        if (!result.data) {
            result.error = "Invalid response data.";
            return result;
        }

        return result;
    }

    const handleLogin = async () => {
        const { data, error } = await SignIn({ username: userLog, password });

        if (!error) {
            onUser({ userLog, token: data });
            navigate("/");

        } else {
            setError(error);
        }
    };

    return (
        <div className="w-1/2 text-lg text-center flex flex-col items-center justify-center">
            <h2>Login to view your info</h2>
            <input
            className="w-full p-2 mt-1 mb-1 box-border border-2 border-gray-300 rounded"
                type="text"
                placeholder="Username or Email"
                value={userLog}
                onChange={(e) => setUserLog(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === "Enter") {
                        handleLogin();
                    }
                }}
            />
            <input
                className="w-full p-2 mt-1 mb-1 box-border border-2 border-gray-300 rounded"
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === "Enter") {
                        handleLogin();
                    }
                }}
            />
            <button
                className="w-full p-2 mt-1 mb-1 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                    if (!userLog || !password) {
                        setError("Please enter both username and password.");
                        return;
                    }
                    handleLogin();
                }}
            >
                Login
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}