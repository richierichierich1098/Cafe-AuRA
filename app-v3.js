document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. CUSTOM LUXURY CURSOR
       ========================================== */
    const cursorDot = document.getElementById('custom-cursor');
    const cursorRing = document.getElementById('custom-cursor-ring');
    
    if (cursorDot && cursorRing) {
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        function animateRing() {
            const ease = 0.15;
            ringX += (mouseX - ringX) * ease;
            ringY += (mouseY - ringY) * ease;
            
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            
            requestAnimationFrame(animateRing);
        }
        animateRing();

        function attachCursorHovers() {
            const hoverTargets = document.querySelectorAll('.hover-target, a, button, input, select, textarea, .zone-card, .glimpse-thumb, .savour-arch-item');
            hoverTargets.forEach(target => {
                target.removeEventListener('mouseenter', onMouseEnter);
                target.removeEventListener('mouseleave', onMouseLeave);

                target.addEventListener('mouseenter', onMouseEnter);
                target.addEventListener('mouseleave', onMouseLeave);
            });
        }

        function onMouseEnter() {
            cursorDot.style.width = '12px';
            cursorDot.style.height = '12px';
            cursorDot.style.backgroundColor = 'var(--gold)';
            
            cursorRing.style.width = '60px';
            cursorRing.style.height = '60px';
            cursorRing.style.borderColor = 'var(--gold)';
            cursorRing.style.backgroundColor = 'rgba(192, 152, 88, 0.04)';
        }

        function onMouseLeave() {
            cursorDot.style.width = '8px';
            cursorDot.style.height = '8px';
            cursorDot.style.backgroundColor = 'var(--terracotta)';
            
            cursorRing.style.width = '40px';
            cursorRing.style.height = '40px';
            cursorRing.style.borderColor = 'var(--terracotta-light)';
            cursorRing.style.backgroundColor = 'transparent';
        }

        attachCursorHovers();

        const observer = new MutationObserver(attachCursorHovers);
        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
        });
    }


    /* ==========================================
       2. SCROLL-DRIVEN DUAL CANVAS SCRUBBING
       ========================================== */
    const TOTAL_FRAMES = 120;
    
    // Canvas Hero references (Coffee_cup_with_latte_art.mp4)
    const canvasHero = document.getElementById('hero-canvas');
    const ctxHero = canvasHero ? canvasHero.getContext('2d') : null;
    const framesHero = [];
    let loadedHero = 0;
    let targetFrameHero = 0;
    let currentFrameHero = 0;

    // Canvas 1 references (Ad 1.mp4)
    const canvas1 = document.getElementById('broll-canvas-1');
    const ctx1 = canvas1 ? canvas1.getContext('2d') : null;
    const frames1 = [];
    let loaded1 = 0;
    let targetFrame1 = 0;
    let currentFrame1 = 0;

    // Canvas 2 references (Ad 2.mp4)
    const canvas2 = document.getElementById('broll-canvas-2');
    const ctx2 = canvas2 ? canvas2.getContext('2d') : null;
    const frames2 = [];
    let loaded2 = 0;
    let targetFrame2 = 0;
    let currentFrame2 = 0;

    let preloadedHero = false;
    let preloaded1 = false;
    let preloaded2 = false;

    // Cover drawing algorithm with High-DPI and anchor-offset support
    function drawImageCover(ctx, canvas, img, anchorX = 0.5) {
        if (!ctx || !canvas || !img) return;
        const w = canvas.width;
        const h = canvas.height;
        const imgW = img.width;
        const imgH = img.height;
        
        const canvasRatio = w / h;
        const imgRatio = imgW / imgH;
        let drawW, drawH, drawX, drawY;

        if (imgRatio > canvasRatio) {
            drawH = h;
            drawW = h * imgRatio;
            // Center horizontal crop based on anchor coordinate
            drawX = (w * anchorX) - (drawW / 2);
            // Prevent sliding past the physical bounds
            if (drawX > 0) drawX = 0;
            if (drawX + drawW < w) drawX = w - drawW;
            drawY = 0;
        } else {
            drawW = w;
            drawH = w / imgRatio;
            drawX = 0;
            drawY = (h - drawH) / 2;
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    function drawFrameHero() {
        const rounded = Math.max(0, Math.min(Math.floor(currentFrameHero), TOTAL_FRAMES - 1));
        const img = framesHero[rounded];
        if (img && img.complete && ctxHero) {
            ctxHero.clearRect(0, 0, canvasHero.width, canvasHero.height);
            // Shift the cup center to the right (anchorX = 0.65) on desktop to stay visible in the wave
            const isDesktop = window.innerWidth > 992;
            const anchor = isDesktop ? 0.48 : 0.5;
            drawImageCover(ctxHero, canvasHero, img, anchor);
        }
    }

    function drawFrame1() {
        const rounded = Math.max(0, Math.min(Math.floor(currentFrame1), TOTAL_FRAMES - 1));
        const img = frames1[rounded];
        if (img && img.complete && ctx1) {
            ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
            drawImageCover(ctx1, canvas1, img);
        }
    }

    function drawFrame2() {
        const rounded = Math.max(0, Math.min(Math.floor(currentFrame2), TOTAL_FRAMES - 1));
        const img = frames2[rounded];
        if (img && img.complete && ctx2) {
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            drawImageCover(ctx2, canvas2, img);
        }
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        if (canvasHero) {
            const parent = canvasHero.parentElement;
            canvasHero.width = parent.offsetWidth * dpr;
            canvasHero.height = parent.offsetHeight * dpr;
            drawFrameHero();
        }
        if (canvas1) {
            const parent = canvas1.parentElement;
            canvas1.width = parent.offsetWidth * dpr;
            canvas1.height = parent.offsetHeight * dpr;
            drawFrame1();
        }
        if (canvas2) {
            const parent = canvas2.parentElement;
            canvas2.width = parent.offsetWidth * dpr;
            canvas2.height = parent.offsetHeight * dpr;
            drawFrame2();
        }
    }

    function preloadSequenceHero() {
        if (!canvasHero) return;
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            const frameNumStr = String(i).padStart(4, '0');
            img.onload = () => {
                loadedHero++;
                if (loadedHero === TOTAL_FRAMES) {
                    preloadedHero = true;
                    console.log("Hero Sequence loaded.");
                    if (preloadedHero && preloaded1 && preloaded2) resizeCanvas();
                }
            };
            img.src = `frames/scene-hero/frame_${frameNumStr}.jpg`;
            framesHero.push(img);
        }
    }

    function preloadSequence1() {
        if (!canvas1) return;
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            const frameNumStr = String(i).padStart(4, '0');
            img.onload = () => {
                loaded1++;
                if (loaded1 === TOTAL_FRAMES) {
                    preloaded1 = true;
                    console.log("Sequence 1 loaded.");
                    if (preloadedHero && preloaded1 && preloaded2) resizeCanvas();
                }
            };
            img.src = `frames/scene-0/frame_${frameNumStr}.jpg`;
            frames1.push(img);
        }
    }

    function preloadSequence2() {
        if (!canvas2) return;
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            const frameNumStr = String(i).padStart(4, '0');
            img.onload = () => {
                loaded2++;
                if (loaded2 === TOTAL_FRAMES) {
                    preloaded2 = true;
                    console.log("Sequence 2 loaded.");
                    if (preloadedHero && preloaded1 && preloaded2) resizeCanvas();
                }
            };
            img.src = `frames/scene-1/frame_${frameNumStr}.jpg`;
            frames2.push(img);
        }
    }

    function tick() {
        if (preloadedHero) {
            currentFrameHero += (targetFrameHero - currentFrameHero) * 0.15;
            if (Math.abs(targetFrameHero - currentFrameHero) < 0.01) currentFrameHero = targetFrameHero;
            drawFrameHero();
        }
        if (preloaded1) {
            currentFrame1 += (targetFrame1 - currentFrame1) * 0.15;
            if (Math.abs(targetFrame1 - currentFrame1) < 0.01) currentFrame1 = targetFrame1;
            drawFrame1();
        }
        if (preloaded2) {
            currentFrame2 += (targetFrame2 - currentFrame2) * 0.15;
            if (Math.abs(targetFrame2 - currentFrame2) < 0.01) currentFrame2 = targetFrame2;
            drawFrame2();
        }
        requestAnimationFrame(tick);
    }

    if (canvasHero || canvas1 || canvas2) {
        preloadSequenceHero();
        preloadSequence1();
        preloadSequence2();
        window.addEventListener('resize', resizeCanvas);
        requestAnimationFrame(tick);
    }


    /* ==========================================
       3. STICKY HEADER & SCROLL-SPY ACTIVE LINKS
       ========================================== */
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main, section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        // Sticky header
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active link spy
        let currentSectionId = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 150;
            const secHeight = sec.offsetHeight;
            if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }

        // Helper to calculate scroll progress dynamically based on pinning range
        function getScrollProgress(element) {
            if (!element) return 0;
            const rect = element.getBoundingClientRect();
            const elementHeight = rect.height;
            const viewportHeight = window.innerHeight;
            const scrollDistance = -rect.top;
            const maxScroll = elementHeight - viewportHeight;
            if (maxScroll <= 0) return 0;
            return Math.max(0, Math.min(scrollDistance / maxScroll, 1));
        }

        // Hero calculations
        const scrubHero = document.getElementById('hero-scrub-container');
        if (scrubHero) {
            const progress = getScrollProgress(scrubHero);
            targetFrameHero = Math.floor(progress * (TOTAL_FRAMES - 1));
        }

        // B-Roll 1 calculations
        const scrub1 = document.getElementById('broll-scrub-container-1');
        if (scrub1) {
            const progress = getScrollProgress(scrub1);
            targetFrame1 = Math.floor(progress * (TOTAL_FRAMES - 1));
        }

        // B-Roll 2 calculations
        const scrub2 = document.getElementById('broll-scrub-container-2');
        if (scrub2) {
            const progress = getScrollProgress(scrub2);
            targetFrame2 = Math.floor(progress * (TOTAL_FRAMES - 1));
        }
    });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const targetScrollPos = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: targetScrollPos,
                    behavior: 'smooth'
                });
            }
        });
    });


    /* ==========================================
       4. MOBILE NAVIGATION DRAWER
       ========================================== */
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navLinksContainer.classList.contains('mobile-active');
            
            if (isOpen) {
                navLinksContainer.classList.remove('mobile-active');
                mobileToggle.querySelectorAll('span').forEach(s => s.style.transform = 'none');
            } else {
                navLinksContainer.classList.add('mobile-active');
                mobileToggle.querySelectorAll('span')[0].style.transform = 'translateY(7.5px) rotate(45deg)';
                mobileToggle.querySelectorAll('span')[1].style.transform = 'scale(0)';
                mobileToggle.querySelectorAll('span')[2].style.transform = 'translateY(-7.5px) rotate(-45deg)';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    navLinksContainer.classList.remove('mobile-active');
                    mobileToggle.querySelectorAll('span').forEach(s => s.style.transform = 'none');
                }
            });
        });
    }


    /* ==========================================
       5. TABLE RESERVATIONS
       ========================================== */
    const reservationForm = document.getElementById('reservation-form');
    const successView = document.getElementById('success-view');
    const zoneCards = document.querySelectorAll('.zone-card');

    if (reservationForm && successView) {
        let selectedZone = "Olive Canopy";

        zoneCards.forEach(card => {
            card.addEventListener('click', () => {
                zoneCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedZone = card.getAttribute('data-zone');
            });
        });

        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameVal = document.getElementById('booking-name').value;
            const phoneVal = document.getElementById('booking-phone').value;
            const dateVal = document.getElementById('booking-date').value;
            const guestsVal = document.getElementById('booking-guests').value;

            const codeNum = Math.floor(1000 + Math.random() * 9000);
            const confirmCode = `AURA-${codeNum}`;

            const dateObj = new Date(dateVal);
            const options = { month: 'long', day: 'numeric', year: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);

            document.getElementById('confirm-code').innerText = confirmCode;
            document.getElementById('confirm-guests').innerText = `${guestsVal} Guests`;
            document.getElementById('confirm-zone').innerText = selectedZone;
            document.getElementById('confirm-datetime').innerText = `${formattedDate} | Evening Space`;

            reservationForm.style.transition = 'opacity 0.4s ease';
            reservationForm.style.opacity = '0';

            setTimeout(() => {
                reservationForm.style.display = 'none';
                successView.style.display = 'flex';
                successView.style.opacity = '0';
                successView.offsetHeight;
                successView.style.opacity = '1';
                
                document.querySelector('.booking-box').scrollIntoView({ behavior: 'smooth' });
            }, 400);
        });

        const newBookingBtn = document.getElementById('new-booking-btn');
        if (newBookingBtn) {
            newBookingBtn.addEventListener('click', () => {
                reservationForm.reset();
                selectedZone = "Olive Canopy";
                zoneCards.forEach(c => c.classList.remove('selected'));
                if (zoneCards[0]) zoneCards[0].classList.add('selected');

                successView.style.transition = 'opacity 0.4s ease';
                successView.style.opacity = '0';

                setTimeout(() => {
                    successView.style.display = 'none';
                    reservationForm.style.display = 'flex';
                    reservationForm.style.opacity = '0';
                    reservationForm.offsetHeight;
                    reservationForm.style.opacity = '1';
                }, 400);
            });
        }

        // Mobile JS-based pinning manager (disabled in favor of CSS relative layouts)
        function initMobilePinning(wrapperId, stickySelector) {
            return; // Disabled: CSS-only layout handles mobile positioning reliably
            const wrapper = document.getElementById(wrapperId);
            if (!wrapper) return;
            const sticky = wrapper.querySelector(stickySelector);
            if (!sticky) return;

            function updatePinning() {
                if (window.innerWidth > 992) {
                    // Reset to CSS default for desktop
                    sticky.style.position = '';
                    sticky.style.top = '';
                    sticky.style.bottom = '';
                    return;
                }

                const rect = wrapper.getBoundingClientRect();
                const wrapperHeight = rect.height;
                const viewportHeight = window.innerHeight;
                const scrollOffset = -rect.top;
                const maxScroll = wrapperHeight - viewportHeight;

                if (scrollOffset < 0) {
                    sticky.style.setProperty('position', 'absolute', 'important');
                    sticky.style.setProperty('top', '0', 'important');
                    sticky.style.setProperty('bottom', 'auto', 'important');
                } else if (scrollOffset > maxScroll) {
                    sticky.style.setProperty('position', 'absolute', 'important');
                    sticky.style.setProperty('top', 'auto', 'important');
                    sticky.style.setProperty('bottom', '0', 'important');
                } else {
                    sticky.style.setProperty('position', 'fixed', 'important');
                    sticky.style.setProperty('top', '0', 'important');
                    sticky.style.setProperty('bottom', 'auto', 'important');
                }
            }

            window.addEventListener('scroll', updatePinning);
            window.addEventListener('resize', updatePinning);
            // Run instantly
            updatePinning();
        }

        // Initialize mobile JS pinning
        initMobilePinning('hero-scrub-container', '.hero-sticky-container');
        initMobilePinning('broll-scrub-container-1', '.story-sticky');
        initMobilePinning('broll-scrub-container-2', '.story-sticky');
    }
});
