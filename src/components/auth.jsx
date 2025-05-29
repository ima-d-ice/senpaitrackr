import { auth, provider } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"; // Removed signOut
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/"); // Navigate to home after sign up
        } catch (error) {
            console.error("Error signing up:", error);
            // You might want to display this error to the user
        }
    };
    
    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
            navigate("/"); // Navigate to home after Google sign in
        } catch (error) {
            console.error("Error signing in with Google:", error);
            // You might want to display this error to the user
        }
    };
    
    // handleSignOut function and button removed from here

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 dark:bg-neutral-900 p-4">
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Sign Up / Sign In</h2>
                <form onSubmit={handleSignUp} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-neutral-700 dark:text-gray-200"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password (min. 6 characters for signup)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-neutral-700 dark:text-gray-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
                    >
                        Sign Up with Email
                    </button>
                </form>
                <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">Or</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <button 
                    onClick={handleGoogleSignIn}
                    className="w-full mt-4 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-neutral-600 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
                >
                    {/* You can add a Google icon here */}
                    <span>Sign in with Google</span>
                </button>
            </div>
        </div>
    );
}

export default Auth;
