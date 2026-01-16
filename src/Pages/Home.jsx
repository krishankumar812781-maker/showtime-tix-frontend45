import HeroCarousel from "../Components/HeroCarousel";
import MovieList from "../Components/MovieList";

function Home() {
  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <HeroCarousel />
      <MovieList/>

      {/* Below this you can show categories, recommended movies, etc */}
    </div>
  );
}

export default Home;
