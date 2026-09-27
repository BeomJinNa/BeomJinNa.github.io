// Preserve project anchors from previously shared root-page links.
if (document.body.classList.contains("directory-page") &&
    ["#tinyrenderer", "#minirt", "#fdf", "#irc", "#minishell"].includes(window.location.hash)) {
  window.location.replace(new URL("focus/cpp/index.html" + window.location.hash, window.location.href));
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const loopVideos = [...document.querySelectorAll("[data-loop-video]")];
const carousels = [...document.querySelectorAll("[data-carousel]")];

function canAutoPlay(video) {
  if (reducedMotion.matches || document.hidden || video.closest('[aria-hidden="true"]')) return false;
  const bounds = video.getBoundingClientRect();
  const visibleHeight = Math.min(bounds.bottom, innerHeight) - Math.max(bounds.top, 0);
  return bounds.height > 0 && visibleHeight >= bounds.height * .35;
}

for (const carousel of carousels) {
  const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
  const previous = carousel.querySelector("[data-carousel-previous]");
  const next = carousel.querySelector("[data-carousel-next]");
  const counter = carousel.querySelector("[data-carousel-counter]");
  const thumbnailStrip = carousel.querySelector("[data-thumbnail-strip]");
  let currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      const focusTarget = slide.querySelector("a, video");
      const slideVideo = slide.querySelector("video");
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
      if (focusTarget) {
        focusTarget.tabIndex = isActive ? 0 : -1;
      }
      if (slideVideo) {
        if (isActive && canAutoPlay(slideVideo)) {
          slideVideo.play().catch(() => {});
        } else {
          slideVideo.pause();
        }
      }
    });

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === currentIndex) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    if (thumbnailStrip) {
      const selected = dots[currentIndex];
      const left = selected.offsetLeft;
      const right = left + selected.offsetWidth;
      if (left < thumbnailStrip.scrollLeft || right > thumbnailStrip.scrollLeft + thumbnailStrip.clientWidth) {
        thumbnailStrip.scrollTo({
          left: left < thumbnailStrip.scrollLeft ? left - 5 : right - thumbnailStrip.clientWidth + 5,
          behavior: reducedMotion.matches ? "instant" : "smooth",
        });
      }
    }
  }

  previous.addEventListener("click", () => showSlide(currentIndex - 1));
  next.addEventListener("click", () => showSlide(currentIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));

  carousel.addEventListener("keydown", (event) => {
    if (event.target.closest("video")) return;
    const destination = { ArrowLeft: currentIndex - 1, ArrowRight: currentIndex + 1,
      Home: 0, End: slides.length - 1 }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    showSlide(destination);
    if (event.target.closest("[data-thumbnail-strip]")) dots[currentIndex].focus({ preventScroll: true });
  });

  showSlide(0);
}

function syncMotionPreference() {
  for (const video of loopVideos) {
    // Visibility and active-slide state control autoplay, including hidden videos.
    video.removeAttribute("autoplay");
    if (canAutoPlay(video)) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
}

syncMotionPreference();
reducedMotion.addEventListener("change", syncMotionPreference);
document.addEventListener("visibilitychange", syncMotionPreference);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target;
      if (entry.isIntersecting && canAutoPlay(video)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, { threshold: 0.35 });

  for (const video of loopVideos) {
    observer.observe(video);
  }
}
