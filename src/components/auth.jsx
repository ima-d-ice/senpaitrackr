import { auth, provider } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from '../context/ThemeContext';

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Added error state
    const [loading, setLoading] = useState(false); // Added loading state
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setLoading(true); // Set loading to true
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/"); // Navigate to home after sign up
        } catch (err) {
            console.error("Error signing up:", err);
            // Provide more specific error messages
            if (err.code === 'auth/email-already-in-use') {
                setError("This email address is already in use.");
            } else if (err.code === 'auth/weak-password') {
                setError("The password is too weak. Please choose a stronger password.");
            } else {
                setError(err.message || "Failed to create an account. Please try again.");
            }
        }
        setLoading(false); // Set loading to false
    };

    const handleGoogleSignIn = async () => {
        setError(""); // Clear previous errors
        setLoading(true); // Set loading to true
        try {
            await signInWithPopup(auth, provider);
            navigate("/"); // Navigate to home after Google sign in
        } catch (err) {
            console.error("Error signing in with Google:", err);
            setError(err.message || "Failed to sign in with Google. Please try again.");
        }
        setLoading(false); // Set loading to false
    };

    return (
        <div data-theme={theme} className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4">
            <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold mb-8 text-center text-neutral-800 dark:text-amber-50">Welcome to SenpaiTrackr</h1>
                <div className="bg-white/30 dark:bg-neutral-800/30 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white/20 dark:border-neutral-700/30">
                    <form onSubmit={handleSignUp}>
                        <h2 className="text-2xl font-semibold mb-6 text-center text-neutral-700 dark:text-amber-100">Create an Account</h2>
                        {error && <p className="mb-4 text-center text-red-500 dark:text-red-400">{error}</p>}
                        <div className="mb-5">
                            <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-amber-200" htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-neutral-300/50 dark:border-neutral-600/50 rounded-lg bg-white/50 dark:bg-neutral-700/50 text-neutral-900 dark:text-amber-50 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none placeholder-neutral-500 dark:placeholder-neutral-400"
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
                                className="w-full p-3 border border-neutral-300/50 dark:border-neutral-600/50 rounded-lg bg-white/50 dark:bg-neutral-700/50 text-neutral-900 dark:text-amber-50 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none placeholder-neutral-500 dark:placeholder-neutral-400"
                                required
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-teal-600/80 hover:bg-teal-700/90 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-150 ease-in-out disabled:opacity-50 backdrop-blur-sm"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                    <div className="my-6 flex items-center justify-center">
                        <span className="border-b w-1/5 border-neutral-300/50 dark:border-neutral-600/50"></span>
                        <span className="text-xs text-center text-neutral-500 dark:text-neutral-400 uppercase mx-4">Or continue with</span>
                        <span className="border-b w-1/5 border-neutral-300/50 dark:border-neutral-600/50"></span>
                    </div>
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-red-600/80 hover:bg-red-700/90 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 backdrop-blur-sm"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                        {loading ? 'Processing...' : 'Sign up with Google'}
                    </button>
                </div>
                <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-8">
                    Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">Sign In</a>
                </p>
            </div>
        </div>
    );
}

export default Auth;
