const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const loopVideos = [...document.querySelectorAll("[data-loop-video]")];
const carousels = [...document.querySelectorAll("[data-carousel]")];

for (const carousel of carousels) {
  const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
  const previous = carousel.querySelector("[data-carousel-previous]");
  const next = carousel.querySelector("[data-carousel-next]");
  const counter = carousel.querySelector("[data-carousel-counter]");
  let currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      const focusTarget = slide.querySelector("a, video");
      const slideVideo = slide.querySelector("video");
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      if (focusTarget) {
        focusTarget.tabIndex = isActive ? 0 : -1;
      }
      if (slideVideo) {
        if (isActive && !reducedMotion.matches) {
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
  }

  previous.addEventListener("click", () => showSlide(currentIndex - 1));
  next.addEventListener("click", () => showSlide(currentIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(currentIndex + 1);
    }
  });

  showSlide(0);
}

function syncMotionPreference() {
  for (const video of loopVideos) {
    if (reducedMotion.matches) {
      video.pause();
      video.removeAttribute("autoplay");
    } else {
      video.setAttribute("autoplay", "");
    }
  }
}

syncMotionPreference();
reducedMotion.addEventListener("change", syncMotionPreference);

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target;
      const carouselSlide = video.closest("[data-carousel-slide]");
      const isActiveSlide = !carouselSlide || carouselSlide.classList.contains("is-active");
      if (entry.isIntersecting && isActiveSlide) {
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
