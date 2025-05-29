import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../config/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ThemeContext } from '../context/ThemeContext';

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/"); // Navigate to home after sign in
        } catch (err) {
            console.error("Error signing in:", err);
            setError(err.message || "Failed to sign in. Please check your credentials.");
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithPopup(auth, provider);
            navigate("/"); // Navigate to home after Google sign in
        } catch (err) {
            console.error("Error signing in with Google:", err);
            setError(err.message || "Failed to sign in with Google.");
        }
        setLoading(false);
    };

    return (
        <div data-theme={theme} className="min-h-screen flex flex-col items-center justify-center bg-amber-50 dark:bg-neutral-900 p-4">
            <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold mb-8 text-center text-neutral-800 dark:text-amber-50">Welcome Back to SenpaiTrackr</h1>
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-2xl">
                    <form onSubmit={handleSignIn}>
                        <h2 className="text-2xl font-semibold mb-6 text-center text-neutral-700 dark:text-amber-100">Sign In</h2>
                        {error && <p className="mb-4 text-center text-red-500 dark:text-red-400">{error}</p>}
                        <div className="mb-5">
                            <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-amber-200" htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-amber-50 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none"
                                required
                                placeholder="you@example.com"
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-amber-200" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-amber-50 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none"
                                required
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-150 ease-in-out disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="my-6 flex items-center justify-center">
                        <span className="border-b w-1/5 border-neutral-300 dark:border-neutral-600"></span>
                        <span className="text-xs text-center text-neutral-500 dark:text-neutral-400 uppercase mx-4">Or continue with</span>
                        <span className="border-b w-1/5 border-neutral-300 dark:border-neutral-600"></span>
                    </div>
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-150 ease-in-out flex items-center justify-center disabled:opacity-50"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                        {loading ? 'Signing In...' : 'Sign in with Google'}
                    </button>
                </div>
                <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-8">
                    Don't have an account? <a href="/signup" onClick={(e) => { e.preventDefault(); navigate("/signup"); }} className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">Sign Up</a>
                </p>
            </div>
        </div>
    );
}

export default SignIn;
