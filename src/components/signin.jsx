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
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
                setError("No account found with this email. Please sign up or check the email address.");
            } else if (err.code === 'auth/wrong-password') {
                setError("Incorrect password. Please try again.");
            } else if (err.code === 'auth/invalid-credential') {
                setError("Invalid credentials. Please check your email and password.");
            } else if (err.code === 'auth/too-many-requests') {
                setError("Access to this account has been temporarily disabled due to many failed login attempts. You can try again later.");
            } else {
                setError(err.message || "Failed to sign in. Please try again.");
            }
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
            if (err.code === 'auth/popup-closed-by-user') {
                setError("Sign-in process was cancelled. Please try again.");
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                setError("An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.");
            } else {
                setError(err.message || "Failed to sign in with Google.");
            }
        }
        setLoading(false);
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-90 to-teal-150 dark:from-neutral-900 dark:to-teal-950 p-4 transition-colors duration-300`} data-theme={theme}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-teal-600 dark:text-teal-400">SenpaiTrackr</h1>
                    <p className="text-teal-700 dark:text-teal-300 mt-2">Welcome back! Sign in to continue.</p>
                </div>

                <div className="bg-neutral-300/45 dark:bg-neutral-800/70 backdrop-blur-xl shadow-2xl rounded-xl p-6 sm:p-8 space-y-6 border border-teal-300/50 dark:border-teal-700/60">
                    <form onSubmit={handleSignIn} className="space-y-6">
                        <h2 className="text-2xl font-semibold text-center text-teal-800 dark:text-teal-100">Sign In</h2>
                        
                        {error && <p className="text-sm text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700/50 rounded-md p-3 text-center">{error}</p>}
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white/70 dark:bg-slate-700/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-500 dark:focus:border-teal-500 outline-none transition-all duration-300 disabled:opacity-50 placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white/70 dark:bg-slate-700/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-500 dark:focus:border-teal-500 outline-none transition-all duration-300 disabled:opacity-50 placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-slate-300 dark:border-slate-600"/>
                        <span className="mx-4 text-sm text-slate-500 dark:text-slate-400">OR</span>
                        <hr className="flex-grow border-slate-300 dark:border-slate-600"/>
                    </div>

                    <button 
                        onClick={handleGoogleSignIn} 
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-teal-200 font-medium py-3 px-4 rounded-lg border border-slate-300 dark:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                        {loading ? 'Processing...' : 'Sign in with Google'}
                    </button>

                    <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <a
                            href="/signup"
                            onClick={(e) => { e.preventDefault(); navigate("/signup"); }}
                            className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                            Sign Up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
