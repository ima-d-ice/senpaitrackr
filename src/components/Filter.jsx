import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const initialFilters = {
    genre: "",
    year: "",
    type: "",
};

const Filter = ({ onFilterChange, availableYears }) => {
    const { theme } = useContext(ThemeContext);
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const currentYear = new Date().getFullYear();
    // Use provided availableYears or default to the last 20 years + next 2 years
    const years = availableYears || Array.from({ length: 22 }, (_, i) => currentYear + 2 - i);


    return (
        <div data-theme={theme} className="filter p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md mb-6">
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                <select
                    name="genre"
                    id="genre-filter"
                    value={filters.genre}
                    onChange={handleChange}
                    aria-label="Filter by genre"
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">All Genres</option>
                    <option value="Action">Action</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Drama">Drama</option>
                    <option value="Ecchi">Ecchi</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Horror">Horror</option>
                    <option value="Mahou Shoujo">Mahou Shoujo</option>
                    <option value="Mecha">Mecha</option>
                    <option value="Music">Music (Genre)</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Psychological">Psychological</option>
                    <option value="Romance">Romance</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Slice of Life">Slice of Life</option>
                    <option value="Sports">Sports</option>
                    <option value="Supernatural">Supernatural</option>
                    <option value="Thriller">Thriller</option>
                </select>

                <select
                    name="year"
                    id="year-filter"
                    value={filters.year}
                    onChange={handleChange}
                    aria-label="Filter by year"
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">All Years</option>
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select
                    name="type"
                    id="type-filter"
                    value={filters.type}
                    onChange={handleChange}
                    aria-label="Filter by type"
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">All Types</option>
                    <option value="TV">TV</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                    <option value="ONA">ONA</option>
                    <option value="TV Special">TV Special</option>
                    <option value="Music">Music (Type)</option>
                    <option value="TV Short">TV Short</option>
                </select>
            </div>
        </div>
    );
};

export default Filter;

