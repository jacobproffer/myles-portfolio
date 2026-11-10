import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) =>
  root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(s));

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const root = document.documentElement;

/* ------------------------------------------------------------------
   Fit text: scale font-size so a single line fills its container.
------------------------------------------------------------------- */
function fit(el: HTMLElement) {
  const parent = el.parentElement!;
  const cs = getComputedStyle(parent);
  const available = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  el.style.whiteSpace = "nowrap";
  el.style.fontSize = "100px";
  el.style.width = "max-content";
  const natural = el.offsetWidth;
  el.style.width = "";
  el.style.fontSize = `${(100 * available) / natural}px`;
}
const fitAll = () => $$("[data-fit]").forEach(fit);

/* ------------------------------------------------------------------
   Small, always-on utilities
------------------------------------------------------------------- */
function clock() {
  const els = $$("[data-clock]");
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Detroit", // Marquette, MI
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
  const tick = () => els.forEach((el) => (el.textContent = fmt.format(new Date())));
  tick();
  setInterval(tick, 1000);
}

function gridToggle() {
  const toggle = () => root.classList.toggle("show-grid");
  $$("[data-grid-toggle]").forEach((b) => b.addEventListener("click", toggle));
  window.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, [contenteditable]") || e.metaKey || e.ctrlKey) return;
    if (e.key.toLowerCase() === "g") toggle();
  });
}

/* ------------------------------------------------------------------
   Smooth scroll
------------------------------------------------------------------- */
let lenis: Lenis | null = null;
function smoothScroll() {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href")!;
      if (id === "#") return e.preventDefault();
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      lenis!.scrollTo(target, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    }),
  );
}

/* ------------------------------------------------------------------
   Cursor + magnetic elements
------------------------------------------------------------------- */
const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };

function cursor() {
  const el = $(".cursor")!;
  const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.addEventListener("pointerover", (e) => {
    const hit = (e.target as HTMLElement).closest("a, button, [data-cursor]");
    root.classList.toggle("cursor-hover", !!hit);
  });

  $$("[data-magnetic]").forEach((m) => {
    const mx = gsap.quickTo(m, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const my = gsap.quickTo(m, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    m.addEventListener("pointermove", (e) => {
      const r = m.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.35);
      my((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    m.addEventListener("pointerleave", () => {
      mx(0);
      my(0);
    });
  });
}

/* ------------------------------------------------------------------
   Hero: letters stretch toward the cursor (variable font width axis)
------------------------------------------------------------------- */
function heroLetters() {
  const line = $("[data-wdth-letters]");
  if (!line) return;
  const letters = $$("[data-letter]", line);
  const state = letters.map(() => ({ wdth: 112, wght: 800 }));

  // Intro
  gsap.from(letters, {
    yPercent: 105,
    scaleY: 2.4,
    transformOrigin: "50% 100%",
    duration: 1.6,
    ease: "expo.out",
    stagger: 0.07,
    delay: 0.15,
  });

  // Each frame: ease letters toward target width/weight, then
  // squash the whole line horizontally so it always fills the frame.
  gsap.ticker.add(() => {
    const vw = innerWidth;
    letters.forEach((l, i) => {
      let tw = 112;
      let tg = 800;
      if (mouse.active && finePointer) {
        const r = l.getBoundingClientRect();
        const d = Math.abs(mouse.x - (r.left + r.width / 2)) / vw;
        const f = Math.exp(-(d * d) / 0.012); // gaussian falloff
        tw = 62 + 63 * f;
        tg = 300 + 600 * f;
      }
      const s = state[i];
      s.wdth += (tw - s.wdth) * 0.09;
      s.wght += (tg - s.wght) * 0.09;
      l.style.fontStretch = `${s.wdth.toFixed(2)}%`;
      l.style.fontWeight = `${Math.round(s.wght)}`;
    });
    const natural = letters.reduce((sum, l) => sum + l.offsetWidth, 0);
    const avail = line.clientWidth;
    line.style.transform = `scaleX(${(avail / natural).toFixed(4)})`;
    line.style.transformOrigin = "0 50%";
  });

  // Scroll out: name sinks and stretches
  gsap.to(line, {
    yPercent: 30,
    ease: "none",
    scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
  });
}

/* ------------------------------------------------------------------
   Text reveals
------------------------------------------------------------------- */
function splitChars() {
  $$("[data-split-chars]").forEach((el) => {
    const split = SplitText.create(el, { type: "chars", mask: "chars" });
    const inHero = !!el.closest("[data-hero]");
    gsap.from(split.chars, {
      yPercent: 110,
      rotate: 8,
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.035,
      delay: inHero ? 0.5 : 0,
      scrollTrigger: inHero ? undefined : { trigger: el, start: "top 88%" },
    });
  });
}

/** Wrap every word in a span, leaving the original whitespace and nested markup intact. */
function wrapWords(el: HTMLElement): HTMLElement[] {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const words: HTMLElement[] = [];
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.data.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) return frag.append(" ");
      const span = document.createElement("span");
      span.textContent = part;
      frag.append(span);
      words.push(span);
    });
    node.replaceWith(frag);
  });
  return words;
}

function scrubWords() {
  $$("[data-words]").forEach((el) => {
    gsap.fromTo(
      wrapWords(el),
      { opacity: 0.12 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
      },
    );
  });
}

function reveals() {
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 92%",
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08 },
      ),
  });
}

/* ------------------------------------------------------------------
   Work index hover preview
------------------------------------------------------------------- */
function workPreview() {
  const preview = $("[data-preview]");
  const art = $("[data-preview-art]");
  if (!preview || !art || !finePointer) return;

  gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
  const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
  const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
  const rTo = gsap.quickTo(preview, "rotate", { duration: 0.8, ease: "power3" });
  let lastX = 0;

  window.addEventListener("pointermove", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
    rTo(gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.6));
    lastX = e.clientX;
  });

  $$("[data-work-row]").forEach((row) => {
    row.addEventListener("pointerenter", () => {
      art.style.background = row.dataset.art ?? "";
      gsap.fromTo(art, { scale: 1.4 }, { scale: 1.1, duration: 1, ease: "expo.out" });
      gsap.to(preview, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "expo.out" });
    });
  });
  $("[data-work-list]")!.addEventListener("pointerleave", () =>
    gsap.to(preview, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "expo.out" }),
  );
}

/* ------------------------------------------------------------------
   Capabilities cylinder
------------------------------------------------------------------- */
function cylinder() {
  const section = $("[data-cylinder-section]");
  const wheel = $("[data-cylinder]");
  if (!section || !wheel) return;
  const items = $$("[data-cylinder-item]", wheel);
  const counter = $("[data-cylinder-count]");
  const step = 360 / items.length;
  const unique = 7;

  const layout = () => {
    const h = items[0].offsetHeight;
    const radius = h / 2 / Math.tan((step / 2) * (Math.PI / 180));
    items.forEach((it, i) => {
      it.style.transform = `rotateX(${-i * step}deg) translateZ(${radius * 1.08}px)`;
    });
  };
  layout();
  window.addEventListener("resize", layout);

  const paint = (angle: number) => {
    let front = 0;
    items.forEach((it, i) => {
      let a = (((angle - i * step) % 360) + 540) % 360 - 180; // -180..180
      const c = Math.max(0, Math.cos((a * Math.PI) / 180));
      it.style.opacity = (c ** 2.2).toFixed(3);
      const isFront = Math.abs(a) < step / 2;
      it.style.color = isFront ? "var(--color-hit)" : "";
      it.style.fontStretch = `${70 + 42 * c ** 6}%`;
      if (isFront) front = i;
    });
    if (counter) counter.textContent = `${String((front % unique) + 1).padStart(2, "0")} / 0${unique}`;
  };

  const proxy = { angle: 0 };
  paint(0);
  gsap.to(proxy, {
    angle: step * (items.length - 1),
    ease: "none",
    onUpdate: () => {
      wheel.style.transform = `rotateX(${proxy.angle}deg)`;
      paint(proxy.angle);
    },
    scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6 },
  });
}

/* ------------------------------------------------------------------
   Velocity-reactive marquee
------------------------------------------------------------------- */
function marquee() {
  const track = $("[data-marquee-track]");
  if (!track) return;
  let x = 0;
  let dir = 1;
  let boost = 0;

  gsap.ticker.add((_t, dt) => {
    const v = lenis?.velocity ?? 0;
    if (Math.abs(v) > 0.5) dir = Math.sign(v);
    boost += (Math.abs(v) * 0.6 - boost) * 0.1;
    x -= dir * (0.04 + boost * 0.02) * dt * 0.1;
    if (x <= -50) x += 50;
    if (x > 0) x -= 50;
    track.style.transform = `translate3d(${x}%,0,0) skewX(${gsap.utils.clamp(-12, 12, -v * 0.2).toFixed(2)}deg)`;
  });
}

/* ------------------------------------------------------------------
   Boot
------------------------------------------------------------------- */
async function boot() {
  clock();
  gridToggle();

  await document.fonts.ready;
  fitAll();

  if (reduced) {
    root.classList.remove("js");
    return;
  }

  smoothScroll();
  if (finePointer) cursor();
  heroLetters();
  splitChars();
  scrubWords();
  reveals();
  workPreview();
  cylinder();
  marquee();

  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      fitAll();
      ScrollTrigger.refresh();
    });
  });
}

boot();
