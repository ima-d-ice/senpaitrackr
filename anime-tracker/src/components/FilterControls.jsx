import React, { useState } from 'react';

const FilterControls = ({ onFilterChange }) => {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');

  const handleGenreChange = (e) => {
    const genre = e.target.value;
    setSelectedGenre(genre);
    onFilterChange({ genre, year: selectedYear, format: selectedFormat });
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    onFilterChange({ genre: selectedGenre, year, format: selectedFormat });
  };

  const handleFormatChange = (e) => {
    const format = e.target.value;
    setSelectedFormat(format);
    onFilterChange({ genre: selectedGenre, year: selectedYear, format });
  };

  return (
    <div className="filter-controls">
      <select value={selectedGenre} onChange={handleGenreChange} className="filter-select">
        <option value="">All Genres</option>
        <option value="action">Action</option>
        <option value="comedy">Comedy</option>
        <option value="drama">Drama</option>
        <option value="fantasy">Fantasy</option>
        <option value="horror">Horror</option>
        {/* Add more genres as needed */}
      </select>

      <select value={selectedYear} onChange={handleYearChange} className="filter-select">
        <option value="">All Years</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
        {/* Add more years as needed */}
      </select>

      <select value={selectedFormat} onChange={handleFormatChange} className="filter-select">
        <option value="">All Formats</option>
        <option value="tv">TV</option>
        <option value="movie">Movie</option>
        <option value="ova">OVA</option>
        <option value="special">Special</option>
        {/* Add more formats as needed */}
      </select>
    </div>
  );
};

export default FilterControls;