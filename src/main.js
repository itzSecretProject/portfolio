import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initBackground } from "./three-bg.js";
import { detectLang, applyLang } from "./i18n.js";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initBackground();

/* ---------- dynamic year + age (birthday: 17 July, auto-updates) ---------- */
function computeAge() {
  const birth = new Date(2011, 6, 17); // 17 July 2011 → 14 in 2025
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
document.getElementById("year").textContent = new Date().getFullYear();
const ageEl = document.getElementById("age");
if (ageEl) ageEl.textContent = computeAge();

/* ---------- i18n (automatic, device language) ---------- */
applyLang(detectLang());

/* ---------- nav: sliding indicator ---------- */
const navLinks = document.querySelectorAll(".nav-pill a");
const indicator = document.querySelector(".nav-indicator");
function moveIndicator(link, animate = true) {
  if (!link || !indicator) return;
  const x = link.offsetLeft - 6;
  const w = link.offsetWidth;
  if (animate && !reduced) {
    gsap.to(indicator, { x, width: w, duration: 0.5, ease: "power3.out" });
  } else {
    gsap.set(indicator, { x, width: w });
  }
}
window.addEventListener("load", () => moveIndicator(document.querySelector(".nav-pill a.active"), false));
window.addEventListener("resize", () => moveIndicator(document.querySelector(".nav-pill a.active"), false));

/* ---------- mobile menu ---------- */
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
function setMenu(open) {
  mobileMenu.classList.toggle("open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuBtn.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}
menuBtn.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* ---------- loader & hero intro ---------- */
function runIntro() {
  const tl = gsap.timeline();
  tl.to(".loader-bar span", { width: "100%", duration: 0.9, ease: "power2.inOut" })
    .to("#loader", { yPercent: -100, duration: 0.7, ease: "power3.inOut" }, "+=0.1")
    .set("#loader", { display: "none" })
    .add(heroIn, "-=0.3");
}
function heroIn() {
  gsap.set(".reveal", { opacity: 0, y: 24 });
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero-title .line span", { yPercent: 110, duration: 1, stagger: 0.12 })
    .to(".hero-intro.reveal", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
    .to(".hero-aside.reveal", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");
  countUp();
}

/* ---------- counters ---------- */
function countUp() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.6, ease: "power2.out",
      onUpdate: () => (el.textContent = Math.round(obj.v) + suffix),
    });
  });
}

/* ---------- scroll reveals + parallax ---------- */
function scrollReveals() {
  gsap.utils.toArray(".reveal-up").forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  gsap.to("[data-parallax]", {
    yPercent: -30, ease: "none",
    scrollTrigger: { trigger: ".pricing", start: "top bottom", end: "bottom top", scrub: true },
  });
}

/* ---------- magnetic buttons (pointer-fine only) ---------- */
function magnetic() {
  if (reduced || !window.matchMedia("(pointer:fine)").matches) return;
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3,
                    y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.5, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", () =>
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }));
  });
}

/* ---------- card tilt (pointer-fine only) ---------- */
function tilt() {
  if (reduced || !window.matchMedia("(pointer:fine)").matches) return;
  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 8,
                    rotateX: -((e.clientY - r.top) / r.height - 0.5) * 8, duration: 0.4, ease: "power2.out" });
    });
    el.addEventListener("pointerleave", () =>
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power2.out" }));
  });
}

/* ---------- nav spy: animate indicator between sections on scroll ---------- */
function navSpy() {
  const map = new Map([...navLinks].map((a) => [a.getAttribute("href").slice(1), a]));
  document.querySelectorAll("section[id]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: "top center", end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) {
          navLinks.forEach((l) => l.classList.remove("active"));
          const link = map.get(sec.id);
          if (link) { link.classList.add("active"); moveIndicator(link); }
        }
      },
    });
  });
}

/* ---------- boot ---------- */
scrollReveals();
magnetic();
tilt();
navSpy();
moveIndicator(document.querySelector(".nav-pill a.active"), false);

if (reduced) {
  gsap.set("#loader", { display: "none" });
  gsap.set(".reveal", { opacity: 1, y: 0 });
  countUp();
} else {
  window.addEventListener("load", runIntro);
  if (document.readyState === "complete") runIntro();
}
