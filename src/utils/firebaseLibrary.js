import { collection,doc, setDoc, getDocs,getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { auth } from "../config/firebase";

export const getAnimeFromFirestore = async (animeId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const docRef = doc(db, "users", uid, "animeLibrary", animeId.toString());
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};


export const getLibraryFromFirestore = async (uid) => {
  const snapshot = await getDocs(collection(db, "users", uid, "animeLibrary"));
  const grouped = {
    watching: [],
    completed: [],
    onHold: [],
    dropped: [],
    planToWatch: [],
  };

  snapshot.forEach(doc => {
    const data = doc.data();
    grouped[data.watchType].push(data);
  });

  return grouped;
};

export const addToLibraryFirestore = async (targetCategory, anime, rating, episodesWatched) => {
  if (!auth.currentUser) {
    console.warn("addToLibraryFirestore: User not authenticated. Aborting save.");
    return;
  }
  if (!targetCategory) {
    console.warn("addToLibraryFirestore: targetCategory is missing. Aborting save.");
    return;
  }
  // Ensure anime object and its mal_id (used as document ID) are present
  if (!anime || typeof anime.mal_id === 'undefined') {
    console.warn("addToLibraryFirestore: anime data or anime.mal_id is missing. Aborting save.", anime);
    return;
  }

  const uid = auth.currentUser.uid;

  const animeDoc = {
    id: anime.mal_id,
    title: anime.title,
    image: anime.images.jpg.large_image_url,
    score: anime.score,
    episodes: anime.episodes,
    type: anime.type,
    genres: anime.genres,
    year: anime.year,
    userEpisodes: episodesWatched,
    userRating: rating,
    watchType: targetCategory,
    updatedAt: Date.now()
  };

  try {
    await setDoc(
      doc(db, "users", uid, "animeLibrary", anime.mal_id.toString()),
      animeDoc
    );
    console.log("Anime saved to Firestore for user:", uid, "animeId:", anime.mal_id, "watchType:", targetCategory);
    window.dispatchEvent(new Event('libraryUpdated')); // Notify other parts of the app
  } catch (err) {
    console.error("Error saving anime to Firestore:", err);
    console.error("Attempted to save document:", animeDoc); // Log the document that failed
  }
};
