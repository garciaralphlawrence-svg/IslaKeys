document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    initPropertyTrack();
    initSmoothAnchorNavigation();
    initContactForm();
    initNavSession();
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

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const status = document.getElementById('contact-status');

    function setStatus(text, type) {
        if (!status) {
            return;
        }
        status.textContent = text;
        status.className = 'form-status ' + type;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !email || !message) {
            setStatus('Please fill in your name, email, and message.', 'error');
            (!name ? nameInput : !email ? emailInput : messageInput).focus();
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            setStatus('Please enter a valid email address.', 'error');
            emailInput.focus();
            return;
        }
        if (message.length < 10) {
            setStatus('Please tell us a little more (at least 10 characters).', 'error');
            messageInput.focus();
            return;
        }

        // No backend: keep the message locally so it shows up in the admin dashboard.
        try {
            const key = 'islakeysContactMessages';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const list = Array.isArray(existing) ? existing : [];
            list.push({ name, email, message, createdAt: new Date().toISOString() });
            localStorage.setItem(key, JSON.stringify(list));
        } catch (_error) {
            // Storage unavailable: still confirm to the visitor.
        }

        setStatus('Thank you, ' + name + '. Your message has been received and our team will get back to you soon.', 'success');
        form.reset();
    });
}

function initNavSession() {
    const link = document.getElementById('navLogin');
    if (!link) {
        return;
    }

    const dashboards = {
        admin: 'admin-dashboard/index.html',
        client: 'client-dashboard/index.html',
        broker: 'licensed-broker/index.html'
    };

    try {
        const session = JSON.parse(localStorage.getItem('islakeysSession') || 'null');
        if (session && dashboards[session.role]) {
            link.textContent = 'My Dashboard';
            link.setAttribute('href', dashboards[session.role]);
        }
    } catch (_error) {
        // Malformed session: keep the default Login link.
    }
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
