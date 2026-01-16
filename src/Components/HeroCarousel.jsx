import banner from '../assets/CINEMA FESTIVAL Brand new releases.jpg';

const HeroCarousel = () => {
  return (
    
    <div className="w-full py-4 md:py-8 overflow-hidden">
      <img 
        src={banner} 
        alt="Hero Banner" 
        className="
          mx-auto 
          /* Width: 95% on mobile, 85% on large screens */
          w-[95%] lg:w-[85%] 
          
          /* Height: Adjusts based on screen size */
          h-[200px] sm:h-[300px] md:h-[330px] lg:h-[350px] 
          
          /* Ensures the image doesn't stretch/distort */
          object-cover 
          
          /* Aesthetic touches */
          rounded-xl 
          shadow-2xl 
          transition-all 
          duration-300
        "
      />
    </div>
  );
};

export default HeroCarousel;