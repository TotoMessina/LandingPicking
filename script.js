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

    let isAutoTabScrolling = false;
    let currentActiveTab = 0;
    let lastScrollY = window.scrollY;

    function scrollToTabProgress(index) {
        const featuresSec = document.getElementById('funcionalidades') || document.querySelector('.features');
        if (!featuresSec) return;

        const navHeader = document.querySelector('.header');
        const headerOffset = navHeader ? navHeader.offsetHeight + 15 : 90;

        const isSticky = featuresSec.classList.contains('sticky-scroll-enabled');
        if (isSticky) {
            const sectionHeight = featuresSec.offsetHeight;
            const windowHeight = window.innerHeight;
            const totalScrollable = sectionHeight - windowHeight + headerOffset;

            const progressTargets = [0.05, 0.50, 0.85];
            const targetProgress = progressTargets[index] !== undefined ? progressTargets[index] : 0;

            const featuresTop = window.pageYOffset + featuresSec.getBoundingClientRect().top - headerOffset;
            const targetY = Math.max(0, featuresTop + totalScrollable * targetProgress);

            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        } else {
            const videoElement = document.querySelector('.phone-mockup') || featuresSec;
            const targetY = Math.max(0, window.pageYOffset + videoElement.getBoundingClientRect().top - headerOffset);
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
    }

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

        // Update Phone Header Badge above mockup
        const badgeLogo = document.getElementById('badge-logo-img');
        const badgeTitle = document.getElementById('badge-title');
        const badgeSubtitle = document.getElementById('badge-subtitle');
        const badgeData = {
            distribuidores: { logo: 'Logo1.jpg', title: 'PICKING UP! TIENDA', subtitle: 'PARA COMERCIANTES' },
            consumidores: { logo: 'Logo2.jpg', title: 'PICKING UP!', subtitle: 'PARA CONSUMIDORES' },
            repartidores: { logo: 'Logo3.jpg', title: 'PICKING UP! REPARTIENDO', subtitle: 'PARA REPARTIDORES' }
        };

        if (badgeData[targetId]) {
            if (badgeLogo) badgeLogo.src = badgeData[targetId].logo;
            if (badgeTitle) badgeTitle.textContent = badgeData[targetId].title;
            if (badgeSubtitle) badgeSubtitle.textContent = badgeData[targetId].subtitle;
        }

        // Update Theme on parent .features section
        const theme = button.getAttribute('data-theme');
        const featuresSection = document.querySelector('.features');
        if (theme && featuresSection) {
            featuresSection.classList.remove('theme-blue', 'theme-pink', 'theme-green');
            featuresSection.classList.add(theme);
        }

        // Update Glider Position
        updateGlider(button);

        // Scroll to top of features section if requested
        if (shouldScroll) {
            scrollToTabProgress(index);
        }
    }

    tabButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            currentActiveTab = index;
            switchTab(index, false);
            scrollToTabProgress(index);
        });
    });

    // Initialize Store Links & Badge for active tab
    updateStoreLinks('distribuidores');

    // Progression on reaching end of active tab text (down and up)
    function handleTabScrollProgression() {
        const featuresSec = document.getElementById('funcionalidades') || document.querySelector('.features');
        if (!featuresSec) return;

        const isSticky = featuresSec.classList.contains('sticky-scroll-enabled');

        if (isSticky) {
            // Natural sticky progress-based tab switching for desktop and mobile
            const rect = featuresSec.getBoundingClientRect();
            const sectionHeight = featuresSec.offsetHeight;
            const windowHeight = window.innerHeight;

            const headerOffset = window.innerWidth <= 768 ? 75 : 90;
            const totalScrollable = sectionHeight - windowHeight + headerOffset;

            if (totalScrollable <= 0) return;

            const currentScroll = headerOffset - rect.top;
            const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));

            let targetIndex = 0;
            if (progress > 0.66) {
                targetIndex = 2;
            } else if (progress > 0.33) {
                targetIndex = 1;
            } else {
                targetIndex = 0;
            }

            if (targetIndex !== currentActiveTab) {
                currentActiveTab = targetIndex;
                switchTab(targetIndex, false);
            }
        }
    }

    window.addEventListener('scroll', handleTabScrollProgression, { passive: true });

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
            image: 'testimonio2.jpeg',
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
            image: 'testimonio3.png',
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
                        <div class="profile-img-container" style="width: 70px; height: 70px;">
                            <img src="${data.image}" alt="${cleanName}" class="profile-img">
                        </div>
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
