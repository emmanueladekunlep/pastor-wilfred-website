// ===== PARTICLES BACKGROUND =====
(function() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.speedY = (Math.random() - 0.5) * 1.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 168, 83, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 20000));
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(212, 168, 83, ${0.1 * (1 - distance / maxDistance)})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        connectParticles();
        animationId = requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
})();

// ===== TYPED TEXT ANIMATION =====
(function() {
    const typedText = document.getElementById('typed-text');
    if (!typedText) return;

    const phrases = [
        'International Preacher',
        'Author & Life Coach',
        'Founder of Global Revival Blast',
        'Liberating Souls Worldwide'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isWaiting = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        const displayText = currentPhrase.substring(0, charIndex);

        typedText.textContent = displayText;

        if (!isDeleting && charIndex < currentPhrase.length) {
            charIndex++;
            setTimeout(type, 80 + Math.random() * 40);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(type, 30 + Math.random() * 20);
        } else if (!isDeleting && charIndex === currentPhrase.length) {
            isWaiting = true;
            setTimeout(() => {
                isWaiting = false;
                isDeleting = true;
                type();
            }, 3000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(type, 500);
        }
    }

    setTimeout(type, 1000);
})();

// ===== HEADER SCROLL EFFECT =====
(function() {
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });
})();

// ===== HAMBURGER MENU =====
(function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            hamburger.classList.toggle('active');
        });

        document.querySelectorAll('#nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }
})();

// ===== SCROLL ANIMATIONS =====
(function() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(element => {
        observer.observe(element);
    });
})();

// ===== STAT COUNTER ANIMATION =====
(function() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseInt(target.getAttribute('data-count'));
                let current = 0;
                const increment = Math.ceil(count / 60);
                const duration = 2000;
                const stepTime = duration / 60;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= count) {
                        current = count;
                        clearInterval(timer);
                    }
                    target.textContent = current.toLocaleString();
                }, stepTime);

                counterObserver.unobserve(target);
            }
        });
    }, {
        threshold: 0.5
    });

    statNumbers.forEach(number => {
        counterObserver.observe(number);
    });
})();

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
(function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
})();

// ===== PARALLAX EFFECT ON HERO =====
(function() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        hero.style.backgroundPositionY = `${rate}px`;
    });
})();

// ===== ACTIVE NAV LINK =====
(function() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#nav-menu a').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
})();

console.log('🌟 Pastor Wilfred Aigbomobe Website Loaded!');
console.log('📖 "The Power of Your Choice" & "Ultimate Freedom"');
console.log('🌍 Global Revival Blast - Liberating Souls Worldwide');