import AnimeCard from './AnimeCard';


function AnimeList(props) {
    
    
  return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4 justify-items-center">
        {props.animeList.length === 0 && (
          <div className="col-span-4 text-center">
            <p className="text-lg font-semibold">No anime found.</p>
          </div>
        )}
        {props.animeList.length > 0 && props.animeList.map((prop) => (
            <AnimeCard
              key={prop.id} 
              id={prop.id} 
              name={prop.title}
              src={prop.image} 
              score={prop.score}
              episodes={prop.episodes}
              type={prop.type}
              watchType={prop.watchType} 
              year={prop.year}
              genres={prop.genres}
            />
        ))}

      </div>
    
  );
}

export default AnimeList;