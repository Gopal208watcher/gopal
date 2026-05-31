const body = document.body;
const root = document.documentElement;
const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const themeToggle = document.querySelector(".theme-toggle");
const siteNav = document.querySelector(".site-nav");
const navIndicator = document.querySelector(".nav-indicator");
const navLinks = [...document.querySelectorAll(".nav-list a")];
const heroScroll = document.querySelector(".hero-scroll");
const hero = document.querySelector("[data-hero]");
const skillCapsules = [...document.querySelectorAll(".skill-capsule")];
const skillsSection = document.querySelector(".skills-section");
const skillNodes = [...document.querySelectorAll(".skill-node")];
const skillTreeContainer = document.querySelector(".skill-tree-container");
const skillTree = document.querySelector(".skill-tree");
const connectionLinesGroup = document.querySelector(".connection-lines");
const aboutSection = document.querySelector(".about-section");
const universe = document.querySelector("[data-universe]");
const showcaseMarquee = document.querySelector(".showcase-marquee");
const marqueeTracks = [...document.querySelectorAll(".marquee-track")];
const projectModal = document.querySelector("[data-project-modal]");
const modalVideo = projectModal?.querySelector(".modal-video");
const modalTitle = projectModal?.querySelector(".modal-title");
const modalCategory = projectModal?.querySelector(".modal-category");
const modalDescription = projectModal?.querySelector(".modal-description");
const modalCloseButtons = [...document.querySelectorAll("[data-modal-close]")];
const desktopQuery = window.matchMedia("(min-width: 641px)");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, amount) => start + (end - start) * amount;

const motionState = {
  heroShift: 0,
  heroShiftTarget: 0,
  universeProgress: 0,
  universeProgressTarget: 0,
  atmosphereX: 0,
  atmosphereXTarget: 0,
  atmosphereY: 0,
  atmosphereYTarget: 0,
  marqueeTop: -78,
  marqueeTopTarget: -78,
  marqueeBottom: 78,
  marqueeBottomTarget: 78,
  frame: null,
};

const writeMotionState = () => {
  hero?.style.setProperty("--hero-bg-shift", `${motionState.heroShift.toFixed(2)}px`);

  if (!universe) {
    return;
  }

  universe.style.setProperty("--universe-progress", motionState.universeProgress.toFixed(3));
  universe.style.setProperty("--atmosphere-x", `${motionState.atmosphereX.toFixed(2)}px`);
  universe.style.setProperty("--atmosphere-y", `${motionState.atmosphereY.toFixed(2)}px`);
  universe.style.setProperty("--marquee-top-y", `${motionState.marqueeTop.toFixed(2)}px`);
  universe.style.setProperty("--marquee-bottom-y", `${motionState.marqueeBottom.toFixed(2)}px`);
};

const renderMotionState = () => {
  const amount = reduceMotionQuery.matches ? 1 : 0.16;

  motionState.heroShift = lerp(motionState.heroShift, motionState.heroShiftTarget, amount);
  motionState.universeProgress = lerp(
    motionState.universeProgress,
    motionState.universeProgressTarget,
    amount,
  );
  motionState.atmosphereX = lerp(motionState.atmosphereX, motionState.atmosphereXTarget, amount);
  motionState.atmosphereY = lerp(motionState.atmosphereY, motionState.atmosphereYTarget, amount);
  motionState.marqueeTop = lerp(motionState.marqueeTop, motionState.marqueeTopTarget, amount);
  motionState.marqueeBottom = lerp(
    motionState.marqueeBottom,
    motionState.marqueeBottomTarget,
    amount,
  );

  writeMotionState();

  const isSettled =
    Math.abs(motionState.heroShift - motionState.heroShiftTarget) < 0.08 &&
    Math.abs(motionState.universeProgress - motionState.universeProgressTarget) < 0.001 &&
    Math.abs(motionState.atmosphereX - motionState.atmosphereXTarget) < 0.08 &&
    Math.abs(motionState.atmosphereY - motionState.atmosphereYTarget) < 0.08 &&
    Math.abs(motionState.marqueeTop - motionState.marqueeTopTarget) < 0.08 &&
    Math.abs(motionState.marqueeBottom - motionState.marqueeBottomTarget) < 0.08;

  if (isSettled) {
    motionState.heroShift = motionState.heroShiftTarget;
    motionState.universeProgress = motionState.universeProgressTarget;
    motionState.atmosphereX = motionState.atmosphereXTarget;
    motionState.atmosphereY = motionState.atmosphereYTarget;
    motionState.marqueeTop = motionState.marqueeTopTarget;
    motionState.marqueeBottom = motionState.marqueeBottomTarget;
    motionState.frame = null;
    writeMotionState();
    return;
  }

  motionState.frame = requestAnimationFrame(renderMotionState);
};

const requestMotionRender = () => {
  if (motionState.frame) {
    return;
  }

  motionState.frame = requestAnimationFrame(renderMotionState);
};

// ============================================
// THEME SYSTEM - Premium Day/Night Transition
// ============================================

const setTheme = (theme, animate = true) => {
  const nextTheme = theme === "light" ? "light" : "dark";
  const isLight = nextTheme === "light";

  // Add transition class for smooth animation
  if (animate) {
    root.classList.add("theme-transitioning");
    
    // Remove transition class after animation completes
    setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 900); // Match --theme-duration
  }

  // Update theme attribute
  root.dataset.theme = nextTheme;
  
  // Persist preference
  localStorage.setItem("theme", nextTheme);
  
  // Update ARIA attributes
  themeToggle?.setAttribute("aria-pressed", String(isLight));
  themeToggle?.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode",
  );

  // Dispatch custom event for other components that may need to react
  window.dispatchEvent(new CustomEvent("themechange", { 
    detail: { theme: nextTheme, isLight } 
  }));
};

// Theme toggle click handler
themeToggle?.addEventListener("click", () => {
  const currentTheme = root.dataset.theme || "dark";
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(nextTheme, true);
});

// Restore theme preference from localStorage on page load
// This runs before the page is fully visible to prevent flash
const initTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  
  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
    const isLight = savedTheme === "light";
    themeToggle?.setAttribute("aria-pressed", String(isLight));
    themeToggle?.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode",
    );
  }
};

// Initialize theme immediately (before DOM ready to prevent flash)
initTheme();

// Keyboard shortcut for theme toggle (accessibility)
document.addEventListener("keydown", (event) => {
  // Alt + T to toggle theme
  if (event.altKey && event.key === "t") {
    event.preventDefault();
    const currentTheme = root.dataset.theme || "dark";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(nextTheme, true);
  }
});

const setNavigation = (isOpen) => {
  body.classList.toggle("nav-open", isOpen);
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  navToggle?.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation",
  );
};

navToggle?.addEventListener("click", () => {
  setNavigation(!body.classList.contains("nav-open"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setNavigation(false);
  }
});

document.addEventListener("click", (event) => {
  if (!body.classList.contains("nav-open")) {
    return;
  }

  const clickedInsideNav = siteNav?.contains(event.target);
  const clickedToggle = navToggle?.contains(event.target);

  if (!clickedInsideNav && !clickedToggle) {
    setNavigation(false);
  }
});

const indicatorState = {
  x: 0,
  width: 0,
  targetX: 0,
  targetWidth: 0,
  velocityX: 0,
  velocityWidth: 0,
  frame: null,
  visible: false,
  token: 0,
};

let activeLink =
  navLinks.find((link) => link.getAttribute("aria-current") === "page") ??
  navLinks[0];
let indicatorLink = activeLink;

const writeIndicator = () => {
  if (!siteNav) {
    return;
  }

  siteNav.style.setProperty("--indicator-x", `${indicatorState.x}px`);
  siteNav.style.setProperty("--indicator-width", `${indicatorState.width}px`);
};

const animateIndicator = () => {
  const stiffness = 0.22;
  const damping = 0.72;

  indicatorState.velocityX =
    (indicatorState.velocityX +
      (indicatorState.targetX - indicatorState.x) * stiffness) *
    damping;
  indicatorState.velocityWidth =
    (indicatorState.velocityWidth +
      (indicatorState.targetWidth - indicatorState.width) * stiffness) *
    damping;

  indicatorState.x += indicatorState.velocityX;
  indicatorState.width += indicatorState.velocityWidth;

  const isSettled =
    Math.abs(indicatorState.targetX - indicatorState.x) < 0.08 &&
    Math.abs(indicatorState.targetWidth - indicatorState.width) < 0.08 &&
    Math.abs(indicatorState.velocityX) < 0.08 &&
    Math.abs(indicatorState.velocityWidth) < 0.08;

  if (isSettled) {
    indicatorState.x = indicatorState.targetX;
    indicatorState.width = indicatorState.targetWidth;
    indicatorState.velocityX = 0;
    indicatorState.velocityWidth = 0;
    indicatorState.frame = null;
    writeIndicator();
    return;
  }

  writeIndicator();
  indicatorState.frame = requestAnimationFrame(animateIndicator);
};

const startIndicatorAnimation = () => {
  if (indicatorState.frame || reduceMotionQuery.matches) {
    if (reduceMotionQuery.matches) {
      indicatorState.x = indicatorState.targetX;
      indicatorState.width = indicatorState.targetWidth;
      indicatorState.velocityX = 0;
      indicatorState.velocityWidth = 0;
      writeIndicator();
    }

    return;
  }

  indicatorState.frame = requestAnimationFrame(animateIndicator);
};

const setIndicatorVisibility = (isVisible) => {
  if (!siteNav) {
    return;
  }

  indicatorState.visible = isVisible && desktopQuery.matches;
  siteNav.classList.toggle("indicator-visible", indicatorState.visible);
};

const moveIndicatorTo = (link, immediate = false) => {
  if (!siteNav || !navIndicator || !link || !desktopQuery.matches) {
    return;
  }

  const navRect = siteNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  indicatorState.targetX = linkRect.left - navRect.left;
  indicatorState.targetWidth = linkRect.width;

  if (immediate || indicatorState.width === 0) {
    indicatorState.x = indicatorState.targetX;
    indicatorState.width = indicatorState.targetWidth;
    indicatorState.velocityX = 0;
    indicatorState.velocityWidth = 0;
    writeIndicator();
    return;
  }

  startIndicatorAnimation();
};

const showIndicatorFor = (link) => {
  const shouldPlaceImmediately = !indicatorState.visible;
  const token = indicatorState.token + 1;

  indicatorState.token = token;
  indicatorLink = link;
  moveIndicatorTo(link, shouldPlaceImmediately);

  if (shouldPlaceImmediately) {
    requestAnimationFrame(() => {
      if (indicatorState.token === token) {
        setIndicatorVisibility(true);
      }
    });
    return;
  }

  setIndicatorVisibility(true);
};

const hideIndicator = () => {
  indicatorState.token += 1;
  setIndicatorVisibility(false);
};

const setActiveLink = (link) => {
  activeLink = link;

  navLinks.forEach((navLink) => {
    if (navLink === activeLink) {
      navLink.setAttribute("aria-current", "page");
    } else {
      navLink.removeAttribute("aria-current");
    }
  });

  indicatorLink = activeLink;
  moveIndicatorTo(activeLink);
};

navLinks.forEach((link) => {
  link.addEventListener("pointerenter", () => {
    showIndicatorFor(link);
  });

  link.addEventListener("focus", () => {
    showIndicatorFor(link);
  });

  link.addEventListener("click", () => {
    setActiveLink(link);
    if (!desktopQuery.matches) {
      setNavigation(false);
    }
  });
});

siteNav?.addEventListener("pointerleave", () => {
  hideIndicator();
});

siteNav?.addEventListener("focusout", (event) => {
  if (!siteNav.contains(event.relatedTarget)) {
    hideIndicator();
  }
});

const updateHeroScroll = () => {
  if (!hero || !heroScroll) {
    return;
  }

  const wasScrolled = siteHeader?.classList.contains("is-scrolled") ?? false;
  const scrollRange = heroScroll.offsetHeight - window.innerHeight;
  const scrollProgress =
    scrollRange > 0
      ? clamp(-heroScroll.getBoundingClientRect().top / scrollRange, 0, 1)
      : 0;
  const cinematicProgress = 1 - Math.pow(1 - scrollProgress, 1.45);
  const revealTravel = hero.offsetHeight * 0.45;
  const backgroundShift = -cinematicProgress * revealTravel;
  const isScrolled = window.scrollY > 120;

  motionState.heroShiftTarget = backgroundShift;
  requestMotionRender();
  siteHeader?.classList.toggle("is-scrolled", isScrolled);

  // Hero content visibility control - completely hide when past hero section
  const heroContent = document.querySelector(".hero-content");
  const heroBackground = document.querySelector(".hero-background");
  const heroOverlay = document.querySelector(".hero-overlay");
  const moonGlow = document.querySelector(".moon-glow");

  // Threshold: when scroll progress exceeds 95%, completely hide all hero elements
  const hideThreshold = 0.95;
  const shouldHideHero = scrollProgress >= hideThreshold;

  // Hide/show hero content
  if (heroContent) {
    if (shouldHideHero) {
      heroContent.style.opacity = "0";
      heroContent.style.visibility = "hidden";
      heroContent.style.pointerEvents = "none";
    } else {
      // Normal fade behavior when not past threshold
      const fadeStart = 0.6;
      const fadeEnd = 0.95;
      let contentOpacity = 1;
      let contentY = 0;

      if (scrollProgress > fadeStart) {
        const fadeProgress = (scrollProgress - fadeStart) / (fadeEnd - fadeStart);
        contentOpacity = 1 - clamp(fadeProgress, 0, 1);
        contentY = fadeProgress * -30;
      }

      heroContent.style.opacity = "";
      heroContent.style.visibility = "";
      heroContent.style.pointerEvents = "";
      heroContent.style.setProperty("--hero-content-opacity", contentOpacity.toFixed(3));
      heroContent.style.setProperty("--hero-content-y", `${contentY.toFixed(1)}px`);
    }
  }

  // Hide/show hero decorative elements (background, overlay, moon glow)
  const decorativeElements = [heroBackground, heroOverlay, moonGlow];
  decorativeElements.forEach((el) => {
    if (!el) return;
    if (shouldHideHero) {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
    } else {
      el.style.opacity = "";
      el.style.visibility = "";
      el.style.pointerEvents = "";
    }
  });

  if (indicatorState.visible && wasScrolled !== isScrolled) {
    requestAnimationFrame(() => moveIndicatorTo(indicatorLink));
  }
};

skillCapsules.forEach((capsule) => {
  capsule.addEventListener("pointermove", (event) => {
    const rect = capsule.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const magnetX = clamp(x * 0.16, -8, 8);
    const magnetY = clamp(y * 0.18, -7, 7);
    const rotate = clamp(x * 0.018, -1.2, 1.2);

    capsule.style.setProperty("--magnet-x", `${magnetX.toFixed(2)}px`);
    capsule.style.setProperty("--magnet-y", `${magnetY.toFixed(2)}px`);
    capsule.style.setProperty("--capsule-rotate", `${rotate.toFixed(2)}deg`);
  });

  capsule.addEventListener("pointerleave", () => {
    capsule.style.setProperty("--magnet-x", "0px");
    capsule.style.setProperty("--magnet-y", "0px");
    capsule.style.setProperty("--capsule-rotate", "0deg");
  });
});

const pointerState = {
  x: 0,
  y: 0,
  active: false,
};

let lastFocusedProjectTrigger = null;
let showcaseEventsBound = false;
let modalCloseTimer = null;
let modalOpenTimer = null;
let marqueeResizeTimer = null;

const prepareMarqueeTracks = () => {
  marqueeTracks.forEach((track) => {
    if (!track.dataset.originalMarkup) {
      track.dataset.originalMarkup = track.innerHTML.trim();
    } else {
      track.innerHTML = track.dataset.originalMarkup;
    }

    const originals = [...track.children];

    if (!originals.length) {
      return;
    }

    originals.forEach((item) => {
      item.dataset.clone = "false";
    });

    const appendSequence = () => {
      originals.forEach((item) => {
        const clone = item.cloneNode(true);

        clone.dataset.clone = "true";
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a, button").forEach((interactiveElement) => {
          interactiveElement.tabIndex = -1;
        });
        track.appendChild(clone);
      });
    };

    appendSequence();

    const firstOriginal = originals[0];
    const firstClone = track.children[originals.length];
    const measuredDistance =
      firstClone.getBoundingClientRect().left -
      firstOriginal.getBoundingClientRect().left;
    const sequenceWidth =
      measuredDistance > 0 ? measuredDistance : track.scrollWidth / 2;
    const requiredWidth = window.innerWidth + sequenceWidth + 360;
    let duplicateCount = 1;

    while (track.scrollWidth < requiredWidth && duplicateCount < 10) {
      appendSequence();
      duplicateCount += 1;
    }

    track.style.setProperty("--marquee-distance", `${Math.ceil(sequenceWidth)}px`);
  });
};

const classifyProjectVideo = (project, video, index) => {
  if (!project || !video.videoWidth || !video.videoHeight) {
    return;
  }

  const isPortrait = video.videoHeight > video.videoWidth;

  project.dataset.orientation = isPortrait ? "portrait" : "landscape";
};

const resetProjectVideo = (project, video) => {
  project?.classList.remove("is-playing");
  video?.pause();

  try {
    if (video && Number.isFinite(video.duration)) {
      video.currentTime = 0;
    }
  } catch {
    // Some browsers defer seeking until metadata and the first frame are ready.
  }
};

const playProjectVideo = (project, video) => {
  if (!project || !video) {
    return;
  }

  project.classList.add("is-playing");
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";

  video.play().catch(() => {
    project.classList.remove("is-playing");
  });
};

const closeProjectModal = () => {
  if (
    !projectModal ||
    !modalVideo ||
    (!projectModal.classList.contains("is-open") &&
      !projectModal.classList.contains("is-closing"))
  ) {
    return;
  }

  window.clearTimeout(modalOpenTimer);
  window.clearTimeout(modalCloseTimer);
  projectModal.classList.add("is-closing");
  projectModal.classList.remove("is-open");
  projectModal.classList.remove("is-video-ready");
  body.classList.remove("modal-open");
  body.classList.remove("modal-preparing");

  modalCloseTimer = window.setTimeout(() => {
    projectModal.classList.remove("is-closing");
    projectModal.setAttribute("aria-hidden", "true");
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();

    lastFocusedProjectTrigger?.focus({ preventScroll: true });
    lastFocusedProjectTrigger = null;
  }, 560);
};

const openProjectModal = (project) => {
  const trigger = project?.querySelector(".project-trigger");
  const video = project?.querySelector("video");
  const videoSource = video?.currentSrc || video?.getAttribute("src");

  if (!projectModal || !modalVideo || !project || !videoSource) {
    return;
  }

  window.clearTimeout(modalOpenTimer);
  window.clearTimeout(modalCloseTimer);
  lastFocusedProjectTrigger = trigger;
  project.classList.add("is-launching");
  body.classList.add("modal-preparing");

  if (modalTitle) {
    modalTitle.textContent = project.dataset.title ?? "Selected Work";
  }

  if (modalCategory) {
    modalCategory.textContent = project.dataset.category ?? "Motion Design";
  }

  if (modalDescription) {
    modalDescription.textContent =
      project.dataset.description ?? "A selected motion project preview.";
  }

  modalVideo.src = videoSource;
  modalVideo.muted = true;
  modalVideo.loop = true;
  modalVideo.playsInline = true;
  modalVideo.preload = "auto";

  projectModal.classList.remove("is-closing");
  projectModal.classList.remove("is-video-ready");
  projectModal.setAttribute("aria-hidden", "false");

  modalOpenTimer = window.setTimeout(() => {
    projectModal.classList.add("is-open");
    body.classList.add("modal-open");
    body.classList.remove("modal-preparing");

    modalVideo.play().catch(() => {
      // Autoplay can be denied in strict browser settings; the modal remains useful.
    });
  }, 120);

  window.setTimeout(() => {
    project.classList.remove("is-launching");
  }, 620);
};

const setupProjectShowcase = () => {
  prepareMarqueeTracks();

  const showcaseProjects = [...document.querySelectorAll(".showcase-project")];

  showcaseProjects.forEach((project, index) => {
    const trigger = project.querySelector(".project-trigger");
    const video = project.querySelector("video");

    if (!trigger || !video) {
      return;
    }

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";

    if (video.readyState >= 2) {
      project.classList.add("is-ready");
    } else {
      video.addEventListener(
        "loadeddata",
        () => {
          project.classList.add("is-ready");
        },
        { once: true },
      );
    }

    const classify = () => classifyProjectVideo(project, video, index);

    if (video.readyState >= 1) {
      classify();
    } else {
      video.addEventListener("loadedmetadata", classify, { once: true });
    }

    video.load();
  });

  if (showcaseEventsBound || !showcaseMarquee) {
    return;
  }

  showcaseEventsBound = true;

  showcaseMarquee.addEventListener("pointerover", (event) => {
    const project = event.target.closest(".showcase-project");

    if (!project || project.contains(event.relatedTarget)) {
      return;
    }

    playProjectVideo(project, project.querySelector("video"));
  });

  showcaseMarquee.addEventListener("pointerout", (event) => {
    const project = event.target.closest(".showcase-project");

    if (!project || project.contains(event.relatedTarget)) {
      return;
    }

    resetProjectVideo(project, project.querySelector("video"));
  });

  showcaseMarquee.addEventListener("focusin", (event) => {
    const project = event.target.closest(".showcase-project");

    if (!project) {
      return;
    }

    playProjectVideo(project, project.querySelector("video"));
  });

  showcaseMarquee.addEventListener("focusout", (event) => {
    const project = event.target.closest(".showcase-project");

    if (!project || project.contains(event.relatedTarget)) {
      return;
    }

    resetProjectVideo(project, project.querySelector("video"));
  });

  showcaseMarquee.addEventListener("click", (event) => {
    const project = event.target.closest(".showcase-project");

    if (!project) {
      return;
    }

    openProjectModal(project);
  });
};

setupProjectShowcase();

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeProjectModal);
});

modalVideo?.addEventListener("loadeddata", () => {
  projectModal?.classList.add("is-video-ready");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectModal();
  }
});

const updateUniverse = () => {
  if (!universe) {
    return;
  }

  const rect = universe.getBoundingClientRect();
  const scrollRange = Math.max(1, rect.height - window.innerHeight);
  const progress = clamp(-rect.top / scrollRange, 0, 1);
  const isVisible = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.18;

  universe.classList.toggle("is-visible", isVisible);
  motionState.universeProgressTarget = progress;
  motionState.atmosphereXTarget = pointerState.x * 8;
  motionState.atmosphereYTarget = (progress - 0.5) * 18 + pointerState.y * 6;
  motionState.marqueeTopTarget = -78 - 32 * (progress - 0.5) + pointerState.y * 7;
  motionState.marqueeBottomTarget = 78 + 28 * (progress - 0.5) - pointerState.y * 6;
  requestMotionRender();
};

let scrollFrame = null;

const requestHeroScrollUpdate = () => {
  if (scrollFrame) {
    return;
  }

  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null;
    updateHeroScroll();
    updateUniverse();
  });
};

window.addEventListener("scroll", requestHeroScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
  updateHeroScroll();
  updateUniverse();

  window.clearTimeout(marqueeResizeTimer);
  marqueeResizeTimer = window.setTimeout(() => {
    setupProjectShowcase();
  }, 180);

  if (indicatorState.visible) {
    moveIndicatorTo(indicatorLink, true);
  }
});

universe?.addEventListener("pointermove", (event) => {
  const rect = universe.getBoundingClientRect();

  pointerState.x = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) * 2;
  pointerState.y = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5) * 2;
  pointerState.active = true;
  requestHeroScrollUpdate();
});

universe?.addEventListener("pointerleave", () => {
  pointerState.x = 0;
  pointerState.y = 0;
  pointerState.active = false;
  requestHeroScrollUpdate();
});

// ============================================
// SKILLS SECTION - Premium Pixel Skill Tree
// Enhanced network system with parallax & particles
// ============================================

const skillsState = {
  isVisible: false,
  connectionsDrawn: false,
  parallaxX: 0,
  parallaxY: 0,
  parallaxTargetX: 0,
  parallaxTargetY: 0,
  particlesCreated: false,
};

// Draw connection lines from center node to all branch nodes
// Uses smooth bezier curves for premium feel
const drawConnectionLines = () => {
  if (!skillTree || !connectionLinesGroup || reduceMotionQuery.matches) return;

  const centerNode = skillTree.querySelector(".skill-node-center");
  const branchNodes = skillTree.querySelectorAll(".skill-node-branch");

  if (!centerNode || branchNodes.length === 0) return;

  const treeRect = skillTree.getBoundingClientRect();
  const containerRect = skillTreeContainer.getBoundingClientRect();

  // Clear existing lines
  connectionLinesGroup.innerHTML = "";

  const centerX = centerNode.offsetLeft + centerNode.offsetWidth / 2;
  const centerY = centerNode.offsetTop + centerNode.offsetHeight / 2;

  branchNodes.forEach((node, index) => {
    const nodeX = node.offsetLeft + node.offsetWidth / 2;
    const nodeY = node.offsetTop + node.offsetHeight / 2;

    // Create smooth curved path with subtle S-curve
    const dx = nodeX - centerX;
    const dy = nodeY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control points for elegant curve
    const midX = centerX + dx * 0.5;
    const midY = centerY + dy * 0.3;
    const endMidX = centerX + dx * 0.7;
    const endMidY = centerY + dy * 0.7;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M ${centerX} ${centerY} C ${midX} ${midY}, ${endMidX} ${endMidY}, ${nodeX} ${nodeY}`;
    path.setAttribute("d", d);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-width", "1.5");
    path.style.setProperty("--line-index", index);

    connectionLinesGroup.appendChild(path);
  });

  skillsState.connectionsDrawn = true;

  // Create particles after lines are drawn
  if (!skillsState.particlesCreated) {
    createSkillParticles(centerNode, branchNodes);
    skillsState.particlesCreated = true;
  }
};

// Create floating particles that travel along connection paths
const createSkillParticles = (centerNode, branchNodes) => {
  // Remove existing particles
  document.querySelectorAll(".skill-particle").forEach(p => p.remove());

  const treeRect = skillTree.getBoundingClientRect();
  const centerX = centerNode.offsetLeft + centerNode.offsetWidth / 2;
  const centerY = centerNode.offsetTop + centerNode.offsetHeight / 2;

  branchNodes.forEach((node, index) => {
    const nodeX = node.offsetLeft + node.offsetWidth / 2;
    const nodeY = node.offsetTop + node.offsetHeight / 2;

    // Create 2 particles per connection for continuous flow
    for (let p = 0; p < 2; p++) {
      const particle = document.createElement("div");
      particle.className = "skill-particle";
      particle.style.setProperty("--particle-delay", index * 0.8 + p * 1.5);

      // Set start position (center node)
      particle.style.left = `${centerX - 2}px`;
      particle.style.top = `${centerY - 2}px`;

      // Set travel path via CSS custom properties
      particle.style.setProperty("--start-x", "0px");
      particle.style.setProperty("--start-y", "0px");
      particle.style.setProperty("--end-x", `${nodeX - centerX}px`);
      particle.style.setProperty("--end-y", `${nodeY - centerY}px`);

      skillTreeContainer.appendChild(particle);
    }
  });
};

// Intersection Observer for skills section visibility
const skillsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !skillsState.isVisible) {
        skillsState.isVisible = true;
        skillsSection.classList.add("is-visible");

        // Draw connection lines after a short delay for the reveal animation
        setTimeout(() => {
          drawConnectionLines();
        }, 300);
      } else if (!entry.isIntersecting && skillsState.isVisible) {
        skillsState.isVisible = false;
        skillsSection.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: 0.25,
    rootMargin: "0px",
  }
);

if (skillsSection) {
  skillsObserver.observe(skillsSection);
}

// Redraw connections on resize
const handleSkillsResize = () => {
  if (skillsState.isVisible && skillsState.connectionsDrawn) {
    drawConnectionLines();
  }
};

window.addEventListener("resize", handleSkillsResize);

// Parallax effect for skill nodes
const updateSkillsParallax = () => {
  if (!skillsSection || !skillsState.isVisible) return;

  const amount = reduceMotionQuery.matches ? 1 : 0.08;
  skillsState.parallaxX = lerp(skillsState.parallaxX, skillsState.parallaxTargetX, amount);
  skillsState.parallaxY = lerp(skillsState.parallaxY, skillsState.parallaxTargetY, amount);

  skillNodes.forEach((node) => {
    const position = node.dataset.position || "center";
    let multiplier = 0.03;

    // Different parallax intensity based on position
    if (position.includes("left")) multiplier = -0.04;
    else if (position.includes("right")) multiplier = 0.04;
    else if (position === "center") multiplier = 0.02;

    const offsetX = skillsState.parallaxX * multiplier * 20;
    const offsetY = skillsState.parallaxY * multiplier * 20;

    node.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  });

  // Continue animation loop if not settled
  if (
    Math.abs(skillsState.parallaxX - skillsState.parallaxTargetX) > 0.1 ||
    Math.abs(skillsState.parallaxY - skillsState.parallaxTargetY) > 0.1
  ) {
    requestAnimationFrame(updateSkillsParallax);
  }
};

// Track pointer movement over skills section
skillsSection?.addEventListener("pointermove", (event) => {
  const rect = skillsSection.getBoundingClientRect();
  skillsState.parallaxTargetX = clamp(
    ((event.clientX - rect.left) / rect.width - 0.5) * 2,
    -1,
    1
  );
  skillsState.parallaxTargetY = clamp(
    ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    -1,
    1
  );

  if (!reduceMotionQuery.matches) {
    requestAnimationFrame(updateSkillsParallax);
  }
});

skillsSection?.addEventListener("pointerleave", () => {
  skillsState.parallaxTargetX = 0;
  skillsState.parallaxTargetY = 0;

  if (!reduceMotionQuery.matches) {
    requestAnimationFrame(updateSkillsParallax);
  }
});

// Skill node hover effects - illuminate connected lines
skillNodes.forEach((node) => {
  node.addEventListener("mouseenter", () => {
    if (!skillsState.isVisible) return;

    // Add glow effect to the node
    node.querySelector(".skill-node-inner")?.style.setProperty(
      "--hover-glow",
      "1"
    );
  });

  node.addEventListener("mouseleave", () => {
    node.querySelector(".skill-node-inner")?.style.setProperty(
      "--hover-glow",
      "0"
    );
  });
});

// ============================================
// ABOUT SECTION - Scroll Animations
// ============================================

const aboutObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        aboutSection.classList.add("is-visible");
      } else {
        aboutSection.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  }
);

if (aboutSection) {
  aboutObserver.observe(aboutSection);
}

desktopQuery.addEventListener("change", (event) => {
  if (event.matches) {
    setNavigation(false);
  } else {
    hideIndicator();
  }
});

window.addEventListener("load", () => {
  updateHeroScroll();
  updateUniverse();
});

updateHeroScroll();
updateUniverse();
