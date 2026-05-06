// Hero Slider Functionality
class HeroSlider {
    constructor() {
        this.slider = document.querySelector('.hero-slider');
        this.slides = document.querySelectorAll('.hero-slide');
        this.prevBtn = document.querySelector('.slider-arrow-prev');
        this.nextBtn = document.querySelector('.slider-arrow-next');
        this.dotsContainer = document.querySelector('.slider-dots');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.slideDuration = 5000; // 5 seconds per slide
        this.touchStartX = 0;
        this.touchEndX = 0;

        if (this.slides.length > 0) {
            this.init();
        }
    }

    init() {
        this.createDots();
        this.bindEvents();
        this.startAutoSlide();
        this.showSlide(0);
    }

    createDots() {
        if (!this.dotsContainer) return;
        
        // Only create dots if they don't already exist
        const existingDots = this.dotsContainer.querySelectorAll('.dot');
        if (existingDots.length === this.slides.length) {
            return;
        }
        
        this.dotsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.slide = index;
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }

    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Pause auto-slide on hover
        if (this.slider) {
            this.slider.addEventListener('mouseenter', () => this.stopAutoSlide());
            this.slider.addEventListener('mouseleave', () => this.startAutoSlide());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Touch/swipe support for mobile
        if (this.slider) {
            this.slider.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            });

            this.slider.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            });
        }
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    showSlide(index) {
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Remove active class from all dots
        const dots = this.dotsContainer.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show current slide
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }

        // Activate current dot
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        this.currentSlide = index;
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
        this.resetAutoSlide();
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
        this.resetAutoSlide();
    }

    goToSlide(index) {
        this.showSlide(index);
        this.resetAutoSlide();
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.slideDuration);
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
}

// Initialize slider - check if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.heroSlider = new HeroSlider();
    });
} else {
    // DOM is already loaded
    window.heroSlider = new HeroSlider();
}