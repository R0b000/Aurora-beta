import React, { useState, useEffect, useCallback } from 'react'

export interface Slide {
  id: string
  image: string
  title?: string
  subtitle?: string
  link?: string
  ctaText?: string
}

export interface SliderBannerProps {
  slides: Slide[]
  autoPlayInterval?: number
  showNavArrows?: boolean
  showDots?: boolean
  className?: string
  aspectRatio?: string
  onSlideClick?: (slide: Slide) => void
  infinite?: boolean
}

const SliderBanner: React.FC<SliderBannerProps> = ({
  slides,
  autoPlayInterval = 4000,
  showNavArrows = true,
  showDots = true,
  className = '',
  aspectRatio = 'aspect-[21/9]',
  onSlideClick,
  infinite = false,
}) => {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 500)
    },
    [isTransitioning]
  )

  const goNext = useCallback(() => {
    if (infinite) {
      if (current >= slides.length) {
        goTo(0)
      } else {
        goTo(current + 1)
      }
    } else {
      goTo((current + 1) % slides.length)
    }
  }, [current, slides.length, goTo, infinite])

  const goPrev = useCallback(() => {
    if (infinite) {
      if (current <= 0) {
        goTo(slides.length - 1)
      } else {
        goTo(current - 1)
      }
    } else {
      goTo((current - 1 + slides.length) % slides.length)
    }
  }, [current, slides.length, goTo, infinite])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(goNext, autoPlayInterval)
    return () => clearInterval(timer)
  }, [goNext, slides.length, autoPlayInterval])

  useEffect(() => {
    if (!infinite || slides.length <= 1) return
    if (current === 0 || current === slides.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setCurrent(slides.length)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [current, infinite, slides.length])

  if (slides.length === 0) return null

  return (
    <div className={`relative w-full ${aspectRatio} overflow-hidden rounded-2xl group ${className}`}>
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {infinite
          ? [...slides, ...slides].map((slide, index) => (
              <div
                key={`${slide.id}-${index}`}
                className="w-full h-full flex-shrink-0 relative cursor-pointer"
                onClick={() => onSlideClick?.(slide)}
              >
                <img
                  src={slide.image}
                  alt={slide.title || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {(slide.title || slide.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex flex-col justify-center px-8 md:px-16">
                    {slide.title && <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{slide.title}</h2>}
                    {slide.subtitle && <p className="text-sm md:text-lg text-gray-200 max-w-lg">{slide.subtitle}</p>}
                    {slide.ctaText && (
                      <button className="mt-4 px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-lg w-fit hover:bg-gray-100 transition-colors">
                        {slide.ctaText}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          : slides.map((slide, index) => (
              <div
                key={slide.id}
                className="w-full h-full flex-shrink-0 relative cursor-pointer"
                onClick={() => onSlideClick?.(slide)}
              >
                <img
                  src={slide.image}
                  alt={slide.title || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {(slide.title || slide.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex flex-col justify-center px-8 md:px-16">
                    {slide.title && <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{slide.title}</h2>}
                    {slide.subtitle && <p className="text-sm md:text-lg text-gray-200 max-w-lg">{slide.subtitle}</p>}
                    {slide.ctaText && (
                      <button className="mt-4 px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-lg w-fit hover:bg-gray-100 transition-colors">
                        {slide.ctaText}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
      </div>

      {/* Nav Arrows */}
      {showNavArrows && slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                current % slides.length === i ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SliderBanner
