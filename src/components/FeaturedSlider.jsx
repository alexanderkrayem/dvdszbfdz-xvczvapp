// src/components/FeaturedSlider.jsx
import React, { useRef } from 'react'; // useRef for Swiper instance
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, EffectCoverflow, Autoplay } from 'swiper/modules'; // Added Autoplay
// At the top of FeaturedSlider.jsx
import './FeaturedSlider.css';
// Import Swiper core styles
import 'swiper/css';
// Import Swiper module styles (only those you use)
import 'swiper/css/effect-coverflow';
import 'swiper/css/autoplay'; // Optional: if Swiper has specific styles for autoplay visuals

// You can create a FeaturedSlider.css and import it, or put styles in a global CSS file.
// For the keyframes, it's often easier in a global CSS file or the component's dedicated CSS file.
// import './FeaturedSlider.css'; // If you create a separate CSS file for this component

const FeaturedSlider = ({ items = [], onSlideClick }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-10 my-4">
                <p className="text-gray-500">لا توجد عروض مميزة حالياً.</p>
            </div>
        );
    }

    const enableLoop = items.length >= 3; // Loop only if 3 or more items
    const autoplayDelay = 5000; // 5 seconds per slide

    const swiperRef = useRef(null); // To potentially control Swiper instance (e.g., for hover pause if needed)

    return (
        // Added group class to slideshow-container for progress bar hover effect
        <div 
            className="slideshow-container w-full max-w-5xl mx-auto my-6 relative group"
        >
            <Swiper
                ref={swiperRef}
                modules={[A11y, EffectCoverflow, Autoplay]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                loop={enableLoop}
                slidesPerView={'auto'} // Lets Swiper determine based on slide CSS width
                
                autoplay={{
                    delay: autoplayDelay,
                    disableOnInteraction: false, // Keep playing after user interaction
                    pauseOnMouseEnter: true,     // Pause when mouse is over the slider
                }}

                coverflowEffect={{
                    rotate: 0,
                    stretch: items.length >=3 ? 20 : 0, // How much slides are "stretched" apart. Smaller = closer.
                    depth: items.length >=3 ? 150 : 100,  // How much perspective depth for side slides.
                    modifier: 1,
                    slideShadows: false,
                }}
                 breakpoints={{
                    320: { // Smallest screens
                        slidesPerView: 1.2, // Shows 1 full, tiny peek. Good for looping with 3 items.
                        spaceBetween: 10,
                        coverflowEffect: { stretch: 10, depth: 100 },
                    },
                    640: { // sm
                        slidesPerView: 1.8, // Shows 1 full, larger peek
                        spaceBetween: 15,
                        coverflowEffect: { stretch: 20, depth: 120 },
                    },
                    768: { // md
                        slidesPerView: 2.2, // Might still show asymmetrical peek if 3 items & loop
                        spaceBetween: 15,
                        coverflowEffect: { stretch: 30, depth: 130 },
                    },
                    1024: { // lg
                        slidesPerView: items.length >= 4 ? 2.5 : 2.2, // If only 3 items, make it show less to help loop
                        spaceBetween: 20,
                        coverflowEffect: { stretch: items.length >=4 ? 40 : 20, depth: 150 },
                    }
                }}
                
                watchSlidesProgress={true} // Good for effects that depend on slide position/visibility

                className="!py-2" // Small vertical padding for the Swiper container
            >
                {items.map((item, index) => (
                    <SwiperSlide 
                        key={item.feature_definition_id || item.id || `featured-${index}`}
                        // Define width of each SwiperSlide. Swiper uses this with slidesPerView: 'auto'
                        // Use ! to ensure Tailwind overrides Swiper's inline styles if any.
                        className="!w-[80%] sm:!w-[70%] md:!w-[60%] lg:!w-[50%] xl:!w-[45%] !h-auto"
                        // Add group here if progress bar hover is relative to SwiperSlide hover
                        // className="!w-[...] !h-auto group/slide" 
                    >
                        {({ isActive }) => ( // isActive is provided by Swiper for the currently centered slide
                            <div
                                // This is the visual card inside the SwiperSlide
                                className={`slide-inner-card w-full h-[260px] sm:h-[280px] md:h-[300px]
                                            rounded-xl overflow-hidden shadow-lg 
                                            transition-all duration-300 ease-out cursor-pointer
                                            relative 
                                            ${isActive 
                                                ? 'scale-100 opacity-100'  // Active slide styles
                                                : 'scale-90 opacity-80'     // Non-active slide styles
                                            }`}
                                onClick={() => {
                                    if (isActive) { 
                                        console.log("[FeaturedSlider] Active slide clicked:", item.title);
                                        onSlideClick && onSlideClick(item);
                                    } else {
                                        // If a non-active (peeking) slide is clicked, Swiper will try to center it.
                                        // You can also manually tell Swiper to go to that slide index.
                                        if (swiperRef.current?.swiper) {
                                            // If looping, slideToLoop is better as index might be a "duplicate"
                                            if (enableLoop) {
                                                swiperRef.current.swiper.slideToLoop(index);
                                            } else {
                                                swiperRef.current.swiper.slideTo(index);
                                            }
                                        }
                                        console.log("[FeaturedSlider] Non-active slide clicked, centering. Item:", item.title);
                                        // Optionally, call onSlideClick for non-active slides too if desired
                                        // onSlideClick && onSlideClick(item); 
                                    }
                                }}
                            >
                                <div
                                    className="slide-image w-full h-full bg-cover bg-center"
                                    style={{ 
                                        ...(item.imageUrl && item.imageUrl.startsWith('linear-gradient') 
                                            ? { backgroundImage: item.imageUrl } 
                                            : { backgroundImage: `url(${item.imageUrl || 'https://via.placeholder.com/450x300/f0f0f0/a0a0a0?text=Featured'})` }
                                    )}}
                                >
                                    <div className="slide-info absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white">
                                        <h3 className="slide-title text-base sm:text-lg font-bold mb-0.5 truncate">{item.title}</h3>
                                        <p className="slide-description text-xs sm:text-sm opacity-80 line-clamp-2 h-[2.5em] sm:h-[2.75em]">{item.description}</p>
                                    </div>
                                </div>

                                {/* Progress Bar - Only visible and animating on active slide */}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden group-hover:opacity-0 transition-opacity duration-300"> {/* Main group hover from slideshow-container */}
                                        <div 
                                            className="h-full bg-white" // The filling part
                                            // Key is important here to force re-render and restart animation on slide change
                                            key={`progress-${item.feature_definition_id || item.id || index}`} 
                                            style={{ animation: `autoplay-progress-kf ${autoplayDelay / 1000}s linear forwards` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
            {/* Navigation buttons removed as per your request to rely on swipe/drag only */}
       </div>
   );
};

export default FeaturedSlider;