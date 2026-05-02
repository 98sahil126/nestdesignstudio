document.addEventListener("DOMContentLoaded", () => {
    
    // 1. INITIALIZE LENIS (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. CUSTOM INVERTING CURSOR
    const cursor = document.getElementById("cursor");
    window.addEventListener("mousemove", (e) => {
        gsap.to(cursor, { 
            x: e.clientX - 9, 
            y: e.clientY - 9, 
            duration: 0.3, 
            ease: "power2.out" 
        });
    });

    // Cursor Hover States
    const interactive = document.querySelectorAll('.menu-item, .hamburger, .logo, .ui-item');
    interactive.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    // 3. MAIN INTRO ANIMATION TIMELINE
    const videoHero = document.getElementById("bg-video");
    const mainTl = gsap.timeline();

    mainTl
    .to({}, { duration: 0.8 }) // Initial white pause
    .to("#loader-logo", { 
        opacity: 1, duration: 1.2, ease: "power2.out" 
    })
    .to(".line", { 
        scaleX: 1, duration: 1.2, stagger: 0.12, ease: "expo.inOut" 
    }, "+=0.3") // Lines appear after logo
    .to({}, { duration: 0.6 }) // Hold
    .to("#loader-logo", { 
        opacity: 0, duration: 0.6 
    })
    .to({}, { duration: 0.4 }) // Small pause before strips reveal
    
    // Strips Slide Out (1&3 Left, 2&4 Right)
    .to([".s1", ".s3"], { xPercent: -100, duration: 2, ease: "expo.inOut" })
    .to([".s2", ".s4"], { xPercent: 100, duration: 2, ease: "expo.inOut" }, "<")
    
    // Clean up lines
    .to("#intro-lines", { opacity: 0, duration: 0.3 }, "-=1.5")

    // REVEAL HERO CONTENT WITH ZOOM-IN
    .set(["#hero", "#main-header"], { visibility: "visible" })
    .to("#hero", { opacity: 1, duration: 0.1 }, "-=1.2")
    .to(".video-container", { 
        scale: 1, 
        duration: 2.2, 
        ease: "power2.out",
        onStart: () => videoHero.play()
    }, "-=1.2")
    .to(["#main-header", "#hero-footer"], { 
        opacity: 1, 
        scale: 1,
        y: 0,
        duration: 1.5, 
        stagger: 0.1,
        ease: "power3.out"
    }, "-=1.8");


    // 4. SCROLLTRIGGER: WORK SECTION EXPANSION & OVERLAP
    gsap.registerPlugin(ScrollTrigger);

    const workCarousel = document.querySelector("#work-carousel");
    const videoFrame = document.querySelector(".video-frame");
    const heroSection = document.querySelector("#hero");
    const nav = document.querySelector("#main-header");

    const scrollRevealTl = gsap.timeline({
        scrollTrigger: {
            trigger: workCarousel,
            start: "top bottom", // Starts when top of section enters bottom of viewport
            end: "top top",      // Ends when top of section hits top of viewport
            scrub: true,         // Links animation to scroll position
        }
    });

    scrollRevealTl
    .to(videoFrame, { 
        width: "100vw", // Expand to full width
        borderRadius: "30px", 
        borderWidth: "10px",
        ease: "none"
    })
    .to(".video-overlay", { 
        backgroundColor: "rgba(0,0,0,0.8)", // Hero video fades to grey
        ease: "none" 
    }, 0)
    .to(heroSection, { 
        y: 300, // Parallax effect: hero moves slower
        ease: "none" 
    }, 0)
    .to(nav, { 
        backgroundColor: "#000000b6", // Navbar becomes solid black
        padding: "12px 60px",
        backdropFilter: "blur(10px)", 
        webkitBackdropFilter: "blur(10px)", 
        ease: "none"
    }, 0.5);

    
    
    // 5. VIDEO CAROUSEL LOGIC (Sequential Playback)



    const carouselVideos = document.querySelectorAll(".c-video");
    const uiItems = document.querySelectorAll(".ui-item");
    const progressBars = document.querySelectorAll(".progress-bar");
    let currentSlide = 0;
    const slideDuration = 6000; // 6 seconds per slide

    function playSlide(index) {
        
        carouselVideos.forEach(v => { 
            v.classList.remove("active"); 
            v.pause(); 
        });
        uiItems.forEach(item => item.classList.remove("active"));
        gsap.set(progressBars, { width: 0 });

        
        const activeVid = carouselVideos[index];
        activeVid.classList.add("active");
        activeVid.currentTime = 0;
        activeVid.play();
        uiItems[index].classList.add("active");

        
        gsap.to(progressBars[index], {
            width: "100%",
            duration: slideDuration / 1000,
            ease: "none",
            onComplete: () => {
                currentSlide = (currentSlide + 1) % carouselVideos.length;
                playSlide(currentSlide);
            }
        });
    }

   
    ScrollTrigger.create({
        trigger: workCarousel,
        start: "top center",
        onEnter: () => playSlide(0), 
        once: true 
    });






    // 6. HAMBURGER & MENU TOGGLE
    const menuToggle = document.getElementById("menu-toggle");
    const menuOverlay = document.getElementById("menu-overlay");
    const lTop = document.querySelector(".l-top"), 
          lMid = document.querySelector(".l-mid"), 
          lBot = document.querySelector(".l-bot");
    let menuOpen = false;

    const menuTl = gsap.timeline({ paused: true });
    menuTl.to(menuOverlay, {
        clipPath: "circle(150% at 95% 5%)",
        duration: 1.2,
        ease: "expo.inOut"
    })
    .from(".menu-item", {
        y: 60, opacity: 0, stagger: 0.05, duration: 0.8, ease: "power4.out"
    }, "-=0.6");

    menuToggle.addEventListener("click", () => {
        if (!menuOpen) {
            menuTl.play();
            gsap.to(lMid, { scaleX: 0, opacity: 0, duration: 0.3 });
            gsap.to(lTop, { y: 8, rotate: 45, duration: 0.4 });
            gsap.to(lBot, { y: -8, rotate: -45, duration: 0.4 });
            lenis.stop(); // Stop scroll when menu is open
        } else {
            menuTl.reverse();
            gsap.to(lTop, { y: 0, rotate: 0, duration: 0.4 });
            gsap.to(lBot, { y: 0, rotate: 0, duration: 0.4 });
            gsap.to(lMid, { scaleX: 1, opacity: 1, duration: 0.3 });
            lenis.start();
        }
        menuOpen = !menuOpen;
    });



 // services

    var accordion = document.getElementById('mbxAccordion');
  if (!accordion) return;
  var items = accordion.querySelectorAll('.mbx-acc-item');

  function isMobile() {
    return window.innerWidth <= 768;
  }

  items.forEach(function (item) {
    // Hover for desktop
    item.addEventListener('mouseenter', function () {
      if (isMobile()) return;
      accordion.classList.add('mbx-is-hovered');
      items.forEach(function (i) { i.classList.remove('mbx-is-active'); });
      item.classList.add('mbx-is-active');
    });

    // Tap/click for mobile
    item.addEventListener('click', function () {
      if (!isMobile()) return;
      var isAlreadyActive = item.classList.contains('mbx-is-active');
      items.forEach(function (i) { i.classList.remove('mbx-is-active'); });
      if (!isAlreadyActive) {
        item.classList.add('mbx-is-active');
      }
    });
  });

  accordion.addEventListener('mouseleave', function () {
    if (isMobile()) return;
    accordion.classList.remove('mbx-is-hovered');
    items.forEach(function (i) { i.classList.remove('mbx-is-active'); });
  });

   



//   featured work

 // Hide empty video, show CSS fallback
  document.querySelectorAll('.fw-card--byoma video').forEach(v => {
    const src = v.querySelector('source')?.getAttribute('src');
    if (!src) v.style.display = 'none';
  });
 
  // Parallax cursor drift on images
  document.querySelectorAll('.fw-card').forEach(card => {
    const target = card.querySelector(
      '.fw-card__media img, .fw-card__media video, .fw-byoma-fallback'
    );
    if (!target) return;
 
    let raf;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 10;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * 7;
        target.style.transform = `scale(1.045) translate(${x}px, ${y}px)`;
      });
    });
 
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      target.style.transform = '';
    });
  });
    




//   bip-section


  const cols = document.querySelectorAll('.bip-col');
 
  /* per-icon float personality */
  const floatDurs   = [4.4, 3.9, 4.8, 3.7, 5.0, 4.2];
  const floatDelays = [0, -1.3, -0.6, -2.0, -0.4, -1.7];
  const floatRots   = [[-3,3],[4,-3],[-2,3],[5,-3],[-3,4],[3,-4]];
 
  /* physics constants — tuned for a slow, dreamy balloon feel */
  const SPRING      = 0.018;   // very soft spring — slow drift back
  const DAMPING     = 0.88;    // high damping = gentle, no harsh bounce
  const MAX_PUSH    = 10;      // hard cap on velocity per frame (keeps it subtle)
  const PUSH_SCALE  = 0.10;    // how much cursor distance translates to force
  const MAX_OFFSET  = 18;      // px — icon cannot move more than this from rest
 
  cols.forEach((col, i) => {
    const wrap = col.querySelector('.bip-icon-wrap');
    if (!wrap) return;
 
    /* inject unique float keyframe */
    const kfName = `bipFloat${i}`;
    const [r0, r1] = floatRots[i];
    const s = document.createElement('style');
    s.textContent = `@keyframes ${kfName}{
      0%,100%{transform:translateY(0px) rotate(${r0}deg)}
      50%{transform:translateY(-16px) rotate(${r1}deg)}
    }`;
    document.head.appendChild(s);
    const cssAnim = `${kfName} ${floatDurs[i]}s ease-in-out ${floatDelays[i]}s infinite`;
    wrap.style.animation = cssAnim;
 
    /* physics state */
    let posX = 0, posY = 0, vx = 0, vy = 0;
    let physicsActive = false;
    let isHovered = false;
    let raf = null;
 
    /* lerp target driven by cursor */
    let targetX = 0, targetY = 0;
 
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
 
    function startPhysics() {
      if (physicsActive) return;
      physicsActive = true;
      wrap.style.animation = 'none';
      posX = 0; posY = 0; vx = 0; vy = 0;
      loop();
    }
 
    function stopPhysics() {
      physicsActive = false;
      cancelAnimationFrame(raf);
      wrap.style.transform = '';
      wrap.style.animation = cssAnim;
    }
 
    function loop() {
      if (!physicsActive) return;
 
      /* gentle spring toward target (0,0 when not hovered, cursor-driven when hovered) */
      const ax = (targetX - posX) * SPRING;
      const ay = (targetY - posY) * SPRING;
 
      vx = clamp((vx + ax) * DAMPING, -MAX_PUSH, MAX_PUSH);
      vy = clamp((vy + ay) * DAMPING, -MAX_PUSH, MAX_PUSH);
 
      posX += vx;
      posY += vy;
 
      /* hard clamp so icon never leaves safe zone */
      posX = clamp(posX, -MAX_OFFSET, MAX_OFFSET);
      posY = clamp(posY, -MAX_OFFSET, MAX_OFFSET);
 
      const tilt = posX * 0.25;
      wrap.style.transform =
        `translate(${posX.toFixed(2)}px, ${posY.toFixed(2)}px) rotate(${tilt.toFixed(2)}deg)`;
 
      /* when not hovered, return to CSS float once settled near origin */
      if (!isHovered) {
        const settled = Math.abs(vx) < 0.04 && Math.abs(vy) < 0.04
                     && Math.hypot(posX, posY) < 0.3;
        if (settled) { stopPhysics(); return; }
      }
 
      raf = requestAnimationFrame(loop);
    }
 
    col.addEventListener('mouseenter', () => {
      isHovered = true;
      startPhysics();
    });
 
    col.addEventListener('mousemove', e => {
      if (!physicsActive) startPhysics();
 
      const colRect = col.getBoundingClientRect();
      /* cursor position relative to column centre, normalised –1…1 */
      const cx = colRect.left + colRect.width  / 2;
      const cy = colRect.top  + colRect.height / 2;
      const nx = (e.clientX - cx) / (colRect.width  / 2);   // –1 to 1
      const ny = (e.clientY - cy) / (colRect.height / 2);   // –1 to 1
 
      /* target offset: icon drifts TOWARD cursor, softly */
      targetX = clamp(nx * MAX_OFFSET * PUSH_SCALE * 60, -MAX_OFFSET, MAX_OFFSET);
      targetY = clamp(ny * MAX_OFFSET * PUSH_SCALE * 60, -MAX_OFFSET, MAX_OFFSET);
    });
 
    col.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
      /* physics loop will spring it back and then hand off to CSS float */
    });
  });




});





