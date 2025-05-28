# Anime Tracker

## Overview
Anime Tracker is a React application that allows users to search for anime, manage their anime library, and filter results based on various criteria such as genre, year, and format. The application features a dark/light theme toggle and utilizes the Jikan API to fetch anime data.

## Features
- **Search Functionality**: Users can search for anime by title and receive suggestions.
- **Library Management**: Users can manage their anime library, categorizing anime into different statuses (watching, completed, on hold, dropped, plan to watch).
- **Filtering Options**: Users can filter anime based on genre, year, and format in both the search and library views.
- **Responsive Design**: The application is designed to be responsive and user-friendly across devices.

## Project Structure
```
anime-tracker
├── src
│   ├── components
│   │   ├── AnimeCard.jsx
│   │   ├── AnimeList.jsx
│   │   └── FilterControls.jsx
│   ├── context
│   │   └── ThemeContext.jsx
│   ├── pages
│   │   ├── Library.jsx
│   │   └── Search.jsx
│   ├── services
│   │   └── apiService.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── package.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd anime-tracker
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`.

## Components
- **AnimeCard**: Displays information about a single anime.
- **AnimeList**: Renders a list of `AnimeCard` components.
- **FilterControls**: Provides UI elements for filtering anime based on genre, year, and format.
- **ThemeContext**: Manages the application's theme.

## API Integration
The application fetches data from the Jikan API. The following functions are defined in `src/services/apiService.js`:
- `fetchAnimeSuggestionsAPI`: Fetches anime suggestions based on user input.
- `fetchSearchedAnime`: Fetches search results based on the user's query.
- `fetchInitialAnimeList`: Fetches the initial list of top anime.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.