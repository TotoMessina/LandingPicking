document.addEventListener('DOMContentLoaded', () => {
    // Tabs functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Store links configuration for each tab / app
    const storeLinks = {
        distribuidores: {
            play: "https://tienda.pickingup.com.ar",
            apple: "https://tienda.pickingup.com.ar"
        },
        consumidores: {
            play: "https://app.pickingup.com.ar",
            apple: "https://app.pickingup.com.ar"
        },
        repartidores: {
            play: "https://repartiendo.pickingup.com.ar",
            apple: "https://repartiendo.pickingup.com.ar"
        }
    };

    const googlePlayBtn = document.getElementById('btn-google-play');
    const appStoreBtn = document.getElementById('btn-app-store');

    function updateStoreLinks(targetId) {
        const links = storeLinks[targetId];
        if (links) {
            if (googlePlayBtn) googlePlayBtn.href = links.play;
            if (appStoreBtn) appStoreBtn.href = links.apple;
        }
    }

    let isManualClickScrolling = false;
    let currentActiveTab = 0;

    function switchTab(index, shouldScroll = false) {
        if (index < 0 || index >= tabButtons.length) return;

        const button = tabButtons[index];
        const targetId = button.getAttribute('data-target');

        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked button & pane
        button.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');

        // Switch corresponding tab video/media
        const tabMediaList = document.querySelectorAll('.tab-media');
        tabMediaList.forEach(media => {
            media.classList.remove('active');
            if (media.tagName === 'VIDEO') {
                media.pause();
            }
        });

        const targetMedia = document.getElementById(`media-${targetId}`);
        if (targetMedia) {
            targetMedia.classList.add('active');
            if (targetMedia.tagName === 'VIDEO') {
                targetMedia.play().catch(() => {});
            }
        }

        // Update Store download links for active tab
        updateStoreLinks(targetId);

        // Update Theme on parent .features section
        const theme = button.getAttribute('data-theme');
        const featuresSection = document.querySelector('.features');
        if (theme && featuresSection) {
            featuresSection.classList.remove('theme-blue', 'theme-pink', 'theme-green');
            featuresSection.classList.add(theme);
        }

        // Update Glider Position
        updateGlider(button);

        // Scroll to corresponding position if clicked manually
        if (shouldScroll && window.innerWidth > 768) {
            const featuresSection = document.querySelector('.features.sticky-scroll-enabled');
            if (featuresSection) {
                const sectionTop = featuresSection.offsetTop;
                const totalScrollable = featuresSection.offsetHeight - window.innerHeight;
                const targetY = sectionTop + (index / (tabButtons.length - 1)) * totalScrollable;

                isManualClickScrolling = true;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                setTimeout(() => { isManualClickScrolling = false; }, 800);
            }
        }
    }

    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            currentActiveTab = index;
            switchTab(index, true);
        });
    });

    // Initialize Store Links for active tab
    updateStoreLinks('distribuidores');

    // Scroll-Driven Tab Progression Logic
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        featuresSection.classList.add('sticky-scroll-enabled');

        function handleStickyScroll() {
            if (window.innerWidth <= 768 || isManualClickScrolling) return;

            const rect = featuresSection.getBoundingClientRect();
            const totalScrollable = featuresSection.offsetHeight - window.innerHeight;

            if (totalScrollable <= 0) return;

            const scrolled = -rect.top;

            if (scrolled >= 0 && scrolled <= totalScrollable) {
                const progress = scrolled / totalScrollable;
                let targetIndex = 0;

                if (progress >= 0.66) {
                    targetIndex = 2;
                } else if (progress >= 0.33) {
                    targetIndex = 1;
                } else {
                    targetIndex = 0;
                }

                if (targetIndex !== currentActiveTab) {
                    currentActiveTab = targetIndex;
                    switchTab(currentActiveTab, false);
                }
            }
        }

        window.addEventListener('scroll', handleStickyScroll, { passive: true });
    }

    // Glider Logic
    const glider = document.querySelector('.tab-glider');

    function updateGlider(activeBtn) {
        if (!glider || !activeBtn) return;

        // Calculate position relative to container
        const container = activeBtn.parentElement;
        const rectBtn = activeBtn.getBoundingClientRect();
        const rectContainer = container.getBoundingClientRect();

        // Calculate left offset inside the container (accounting for container padding if needed, but relative calc is safer)
        const left = rectBtn.left - rectContainer.left;

        glider.style.width = `${rectBtn.width}px`;
        glider.style.transform = `translateX(${left}px)`;
    }

    // Initialize Glider
    const initialActive = document.querySelector('.tab-btn.active');
    if (initialActive) {
        // Small delay to ensure layout is settled
        setTimeout(() => updateGlider(initialActive), 50);
    }

    // Update on resize
    window.addEventListener('resize', () => {
        const active = document.querySelector('.tab-btn.active');
        if (active) updateGlider(active);
    });

    // Mobile Menu Toggle
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && nav) {
        // Toggle Menu
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate close
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close when clicking a link
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }

    // Hero Slideshow
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
        setInterval(nextSlide, slideInterval);
    }

    // Testimonial Modal Logic
    const modal = document.getElementById('testimonial-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalBody = document.querySelector('.modal-body-content');
    const testimonialLinks = document.querySelectorAll('.testimonial-footer.link a');

    // Simulated Extended Data
    const testimonialData = {
        'María Ramirez': {
            role: 'Usuario Picking Up!',
            roleClass: 'role-pink',
            initial: 'MR',
            age: '53 años',
            text: `
                <p>"Recién usando Picking Up! caí en cuenta de lo caro que estaba pagando antes con otras apps. <em>Mi favorita sin dudas.</em>"</p>
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                <p>Antes tenía que recorrer 5 lugares distintos para encontrar precio. Con Picking Up! comparo todo desde el sofá. Además, descubrí un almacén a dos cuadras que no conocía. ¡Es súper práctica y me ahorra un montón de tiempo!</p>
                <p>Lo que más valoro es la cercanía, saber que le compro a gente del barrio genera otra confianza.</p>
            `
        },
        'Camila Sttorza': {
            role: 'Repartidora Picking Up!',
            roleClass: 'role-green',
            initial: 'CS',
            age: '24 años',
            text: `
                <p>"Me sumé a repartir en diciembre y me resultó rentable, <em>las distancias son cortas y el pago fue en el momento.</em>"</p>
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                <p>Estudio en la facultad y necesitaba algo flexible para generar mis propios ingresos sin atarme a horarios fijos. Acá me conecto cuando quiero y puedo organizar mis tiempos de estudio.</p>
                <p>Lo mejor es que no me mandan a la otra punta de la ciudad, reparto en mi barrio que ya lo conozco de memoria. Y la plata la tengo en mano al toque, sin vueltas.</p>
            `
        }
    };

    testimonialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const card = link.closest('.testimonial-card');
            const cleanName = card.querySelector('h3').childNodes[0].textContent.trim();
            const data = testimonialData[cleanName];

            if (data) {
                modalBody.innerHTML = `
                    <div class="modal-profile-header">
                        <div class="profile-placeholder" style="width: 70px; height: 70px; font-size: 1.5rem;">${data.initial}</div>
                        <div>
                            <h3 style="margin:0; font-size: 1.4rem;">${cleanName} <span style="font-weight:400; font-size:0.9rem; color:#6b7280;">${data.age}</span></h3>
                            <p class="${data.roleClass}" style="margin:0; font-weight:700;">${data.role}</p>
                        </div>
                    </div>
                    <div class="modal-quote">
                        ${data.text}
                    </div>
                `;
                modal.classList.add('active');
            }
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px" // Offset slightly to trigger before bottom
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .scale-in');
    animatedElements.forEach(el => observer.observe(el));
});
