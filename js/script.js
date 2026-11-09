document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    initPropertyTrack();
    initSmoothAnchorNavigation();
    initContactForm();
    initRevealEffects();
});

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (!slides.length) {
        return;
    }

    let currentSlide = 0;
    slides[currentSlide].classList.add('active');

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, 5000);
}

function initPropertyTrack() {
    const track = document.querySelector('.slide-track');
    if (!track) {
        return;
    }

    const cards = Array.from(track.querySelectorAll('.property-card'));
    if (!cards.length) {
        return;
    }

    // Duplicate cards once to keep the CSS marquee seamless.
    cards.forEach((card) => {
        track.appendChild(card.cloneNode(true));
    });
}

function initSmoothAnchorNavigation() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetSelector = link.getAttribute('href');
            if (!targetSelector || targetSelector === '#') {
                return;
            }

            const target = document.querySelector(targetSelector);
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Thank you for your message. We will get back to you soon.');
        form.reset();
    });
}

function initRevealEffects() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => observer.observe(element));
}
