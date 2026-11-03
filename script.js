(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  try { var saved = localStorage.getItem("theme"); if (saved) root.dataset.theme = saved; } catch (e) {}

  /* Thème avec fondu */
  document.getElementById("theme").addEventListener("click", function () {
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : !window.matchMedia("(prefers-color-scheme: light)").matches;
    var next = dark ? "light" : "dark";
    root.classList.add("theming");
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    setTimeout(function () { root.classList.remove("theming"); }, 650);
  });

  /* Apparition au défilement, avec décalage entre éléments d'un même groupe */
  function mark(sel, step) {
    $(sel).forEach(function (el, i) {
      el.classList.add("rv");
      el.style.setProperty("--d", (step ? (i % 6) * step : 0) + "ms");
    });
  }
  if (!reduce) {
    mark("section:not(.hero) h2"); mark(".sub"); mark(".note"); mark(".legend");
    mark(".two p", 120); mark(".grid3 .card, .grid2 .card", 110); mark(".projects .project", 90);
    mark(".filters"); mark(".scroll"); mark(".timeline li", 110); mark(".contact .btn", 100);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      el.classList.add("in");
      if (el.classList.contains("rv")) setTimeout(function () { el.classList.remove("rv"); }, 1400);
      if (el.matches(".scroll")) { var m = el.querySelector(".matrix"); if (m) m.classList.add("in"); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $(".rv").forEach(function (el) { io.observe(el); });
  $(".matrix .dot").forEach(function (d, i) {
    var row = d.closest("tr"); var idx = $("tr", row.parentNode).indexOf(row);
    d.style.setProperty("--i", idx);
  });
  if (reduce) { var mx = document.querySelector(".matrix"); if (mx) mx.classList.add("in"); }

  /* Filet entre sections */
  var so = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("seen"); so.unobserve(e.target); } });
  }, { threshold: 0.05 });
  $("main > section:not(.hero)").forEach(function (s) { so.observe(s); });

  /* Lien actif dans le menu */
  var links = $(".top nav a");
  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
    });
  }, { rootMargin: "-35% 0px -60% 0px" });
  $("main > section[id]").forEach(function (s) { spy.observe(s); });

  /* Clic dans le menu : le titre de la section arrivée s'anime */
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      var t = document.querySelector(a.getAttribute("href")); if (!t) return;
      var h = t.querySelector("h2"); if (!h) return;
      setTimeout(function () { h.classList.remove("flash"); void h.offsetWidth; h.classList.add("flash"); }, reduce ? 0 : 550);
      setTimeout(function () { h.classList.remove("flash"); }, reduce ? 800 : 1700);
    });
  });

  /* Filtres de projets avec animation d'entrée */
  var chips = $(".chip"), projects = $(".project");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      var n = 0;
      projects.forEach(function (p) {
        var show = chip.dataset.f === "all" || p.dataset.k === chip.dataset.f;
        p.hidden = !show;
        p.classList.remove("pop");
        if (show) { void p.offsetWidth; p.style.setProperty("--d", (n++ * 80) + "ms"); p.classList.add("pop"); }
      });
    });
  });

  /* Lueur qui suit le pointeur */
  $(".card, .project, .facts div").forEach(function (el) {
    el.classList.add("glow");
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* Un seul projet ouvert à la fois, avec recentrage */
  projects.forEach(function (p) {
    p.addEventListener("toggle", function () {
      if (!p.open) return;
      projects.forEach(function (o) { if (o !== p) o.open = false; });
      setTimeout(function () {
        var r = p.getBoundingClientRect();
        if (r.top < 70 || r.top > window.innerHeight * 0.5) window.scrollBy({ top: r.top - 90, behavior: reduce ? "auto" : "smooth" });
      }, 60);
    });
  });

  /* Progression, retour en haut */
  var bar = document.getElementById("progress"), up = document.getElementById("up"), tick = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max) : 0);
    up.classList.toggle("show", window.scrollY > 700);
    tick = false;
  }
  window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  up.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* Copier l'adresse */
  var toast = document.getElementById("toast"), tt;
  function say(m) { toast.textContent = m; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 2200); }
  var copy = document.getElementById("copy");
  if (copy) copy.addEventListener("click", function () {
    var a = "lfouillade.pro@gmail.com";
    function ok() { say("Adresse copiée"); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(a).then(ok, function () { say(a); });
    else say(a);
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
