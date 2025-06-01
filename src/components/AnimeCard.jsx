import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { addToLibraryFirestore } from "../utils/firebaseLibrary";
import { ThemeContext } from '../context/ThemeContext';
import { getAnimeFromFirestore } from "../utils/firebaseLibrary";

// Add initialUserEpisodesWatched and initialUserRating to props
function AnimeCard({
    id,
    name,
    src,
    score,
    episodes,
    type,
    watchType = "not_added",
    year,
    genres,
    initialUserEpisodesWatched = 0, // Default to 0 if not provided
    initialUserRating = 0          // Default to 0 if not provided
}) {
    const { theme } = useContext(ThemeContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    

    // State for the modal form
    const [currentCategory, setCurrentCategory] = useState(watchType);
    // Initialize state with potentially existing data, or 0 if new/not provided
    const [currentEpisodesWatched, setCurrentEpisodesWatched] = useState(
        watchType !== "not_added" ? initialUserEpisodesWatched : 0
    );
    const [currentRating, setCurrentRating] = useState(
        watchType !== "not_added" ? initialUserRating : 0
    );

    useEffect(() => {
        // This effect runs when the modal is closed or when the props determining
        // the initial state of the modal (watchType, initialUserEpisodesWatched, initialUserRating) change.
        // It ensures the form state is correctly reset or re-initialized.
        if (!isModalOpen) {
            setCurrentCategory(watchType);
            if (watchType !== "not_added") {
                setCurrentEpisodesWatched(initialUserEpisodesWatched);
                setCurrentRating(initialUserRating);
            } else {
                setCurrentEpisodesWatched(0);
                setCurrentRating(0);
            }
        }
    }, [watchType, initialUserEpisodesWatched, initialUserRating, isModalOpen]);

    const handleOpenModal = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Attempt to fetch the latest data from Firestore
        const firestoreData = await getAnimeFromFirestore(id); // id is mal_id

        if (firestoreData) {
            // If data exists in Firestore, use it to populate the modal
            setCurrentCategory(firestoreData.watchType || "not_added");
            setCurrentEpisodesWatched(firestoreData.userEpisodes !== undefined ? firestoreData.userEpisodes : 0);
            setCurrentRating(firestoreData.userRating !== undefined ? firestoreData.userRating : 0);
        } else {
            // If not in Firestore, set to default "add" state.
            // The watchType prop might indicate a status from a parent list,
            // but if Firestore (our source of truth for user data) doesn't have it,
            // the modal should reflect that it needs to be added.
            setCurrentCategory("not_added");
            setCurrentEpisodesWatched(0);
            setCurrentRating(0);
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // The useEffect above will handle resetting the state correctly as isModalOpen is now false.
    };

    const handleSaveChanges = async () => {
        let genresForStorage = [];
        if (Array.isArray(genres)) {
            if (genres.length > 0 && typeof genres[0] === "string") {
                genresForStorage = genres;
            } else if (genres.length > 0 && typeof genres[0] === "object" && genres[0]?.name) {
                genresForStorage = genres.map(g => g.name);
            }
        }

        const animeObjectForFirestore = {
            mal_id: id,
            title: name,
            images: { jpg: { large_image_url: src } },
            score, // General score from API
            episodes, // Total episodes from API
            type,
            year,
            genres: genresForStorage,
            // Add user-specific tracking data
            episodesWatched: currentEpisodesWatched,
            userRating: currentRating
        };

        if (currentCategory !== "not_added") {
            await addToLibraryFirestore(currentCategory, animeObjectForFirestore, currentEpisodesWatched, currentRating);
        }
        
        handleCloseModal();
    };

    return (
        <div data-theme={theme} className="m-2 w-60"> {/* Container for card + title */}
            <div className="relative bg-neutral-300 dark:bg-zinc-800 shadow-lg rounded-lg group overflow-hidden">
                {/* Link wrapping the image for navigation to anime details */}
                <Link to={`/anime/${id}`} className="block w-full h-80 cursor-pointer"> {/* Fixed height for image container */}
                    <img
                        src={src}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
                    />
                </Link>

                {/* Overlay for hover effect: shows plus icon */}
                <div
                    className="absolute inset-0 transition-all duration-300 flex justify-end items-end p-3 opacity-0 group-hover:opacity-100 pointer-events-none" // Overlay is always non-interactive
                >
                    {/* Plus icon to open modal, positioned bottom-right */}
                    <button
                        onClick={handleOpenModal}
                        className="text-white bg-blue-500 hover:bg-blue-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75" // Button becomes interactive on group-hover
                        aria-label="Add to list"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>
            </div>
            {/* Title shown below the image */}
            <h2 className="mt-2 text-md font-semibold text-center text-zinc-800 dark:text-zinc-100 line-clamp-2 break-words w-full">
                {name}
            </h2>

            {/* Modal for adding/editing list entry (remains the same) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={handleCloseModal}>
                    <div 
                        className="bg-white dark:bg-zinc-700 p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <h3 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Manage '{name}'</h3>

                        {/* Category Select */}
                        <div className="mb-4">
                            <label htmlFor="modal-category-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                            <select
                                id="modal-category-select"
                                value={currentCategory}
                                onChange={(e) => setCurrentCategory(e.target.value)}
                                className="w-full p-2.5 border border-zinc-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="not_added">Add To List</option>
                                <option value="watching">Watching</option>
                                <option value="completed">Completed</option>
                                <option value="planToWatch">Plan to Watch</option>
                                <option value="dropped">Dropped</option>
                                <option value="onHold">On Hold</option>
                            </select>
                        </div>

                        {/* Episodes Watched Input */}
                        <div className="mb-4">
                            <label htmlFor="episodes-watched" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Episodes Watched</label>
                            <input
                                type="number"
                                id="episodes-watched"
                                value={currentEpisodesWatched}
                                onChange={(e) => setCurrentEpisodesWatched(Math.max(0, parseInt(e.target.value) || 0))}
                                min="0"
                                max={episodes || undefined} 
                                className="w-full p-2.5 border border-zinc-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                            />
                            {episodes > 0 && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total episodes: {episodes}</p>}
                        </div>

                        {/* Rating Input */}
                        <div className="mb-6">
                            <label htmlFor="rating" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Your Rating (0-10)</label>
                            <input
                                type="number"
                                id="rating"
                                value={currentRating}
                                onChange={(e) => setCurrentRating(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                                min="0"
                                max="10"
                                step="1"
                                className="w-full p-2.5 border border-zinc-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="N/A"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-zinc-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveChanges}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-blue-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnimeCard;
