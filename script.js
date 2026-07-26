/* ==========================================================================
   TLÖN — shared behaviour
   Linked from index.html now; also meant to be reused (as "../script.js")
   from /pages/*.html and /products/*.html later.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Pedal art — drawn in code so no external product photos are needed.
     ------------------------------------------------------------------ */
  const PEDAL_DATA = {
    alevosia: {
      label: "ALEVOSÍA",
      body: "#8a5a33",
      bodyLight: "#a9754a",
      knob: "#1a1a1a",
      rows: [1, 3],
      footswitches: 1
    },
    menjurje: {
      label: "MENJURJE",
      body: "#f4f1ea",
      bodyLight: "#ffffff",
      knob: "#3b7d6b",
      rows: [3, 3],
      footswitches: 2,
      dark: false,
      textColor: "#1a1a1a"
    },
    suavicrema: {
      label: "SUAVICREMA",
      body: "#2f5f86",
      bodyLight: "#3d76a3",
      knob: "#e8c84a",
      rows: [3],
      footswitches: 1
    }
  };

  function knobSVG(cx, cy, r, fill) {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r + 4}" stroke="rgba(0,0,0,.5)" stroke-width="2" stroke-linecap="round"/>
    `;
  }

  function buildPedalSVG(key) {
    const d = PEDAL_DATA[key];
    if (!d) return "";

    const width = 220, height = 240;
    let knobsSVG = "";
    let y = 74;
    d.rows.forEach((count) => {
      const startX = width / 2 - ((count - 1) * 52) / 2;
      for (let i = 0; i < count; i++) {
        knobsSVG += knobSVG(startX + i * 52, y, 15, d.knob);
      }
      y += 52;
    });

    const footswitches = [];
    const fsY = height - 40;
    if (d.footswitches === 1) {
      footswitches.push(width / 2);
    } else {
      const gap = 60;
      const start = width / 2 - (gap * (d.footswitches - 1)) / 2;
      for (let i = 0; i < d.footswitches; i++) footswitches.push(start + i * gap);
    }
    const footswitchSVG = footswitches
      .map(
        (x) => `
        <circle cx="${x}" cy="${fsY}" r="18" fill="#161616" stroke="rgba(0,0,0,.4)" stroke-width="2"/>
        <circle cx="${x}" cy="${fsY}" r="11" fill="#cfcfcf" opacity=".9"/>`
      )
      .join("");

    const textColor = d.textColor || "#f4f1ea";

    return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${d.label} pedal illustration">
      <defs>
        <linearGradient id="grad-${key}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${d.bodyLight}"/>
          <stop offset="100%" stop-color="${d.body}"/>
        </linearGradient>
      </defs>

      <rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="10"
            fill="url(#grad-${key})" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>

      <circle cx="26" cy="26" r="2.5" fill="rgba(0,0,0,.35)"/>
      <circle cx="${width - 26}" cy="26" r="2.5" fill="rgba(0,0,0,.35)"/>
      <circle cx="26" cy="${height - 26}" r="2.5" fill="rgba(0,0,0,.35)"/>
      <circle cx="${width - 26}" cy="${height - 26}" r="2.5" fill="rgba(0,0,0,.35)"/>

      <circle cx="26" cy="${height / 2}" r="7" fill="#0c0c0c" stroke="rgba(0,0,0,.3)"/>
      <circle cx="${width - 26}" cy="${height / 2}" r="7" fill="#0c0c0c" stroke="rgba(0,0,0,.3)"/>

      ${knobsSVG}

      <text x="${width / 2}" y="${fsY - 30}" text-anchor="middle"
            font-family="'Playfair Display', serif" font-size="14" letter-spacing="1.5"
            fill="${textColor}" font-weight="700">${d.label}</text>

      ${footswitchSVG}
    </svg>`;
  }

  function mountPedalArt() {
    document.querySelectorAll("[data-pedal]").forEach((el) => {
      const key = el.getAttribute("data-pedal");
      el.innerHTML = buildPedalSVG(key);
    });
  }

  /* ------------------------------------------------------------------
     Newsletter form (demo only — no backend is connected)
     ------------------------------------------------------------------ */
  function initNewsletterForms() {
    document.querySelectorAll(".newsletter-form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const msg = form.parentElement.querySelector(".newsletter-msg");
        const emailInput = form.querySelector('input[type="email"]');
        if (msg) {
          msg.textContent =
            emailInput && emailInput.value
              ? "You're on the list. Thank you."
              : "Please enter an email address.";
        }
        if (emailInput && emailInput.value) form.reset();
      });
    });
  }

  /* ------------------------------------------------------------------
     Product page tabs (Descripción / Más Detalles)
     ------------------------------------------------------------------ */
  function initProductTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        const tabGroup = btn.closest(".product-tabs");
        const panelGroup = document.querySelector(".tab-panels");

        tabGroup.querySelectorAll(".tab-btn").forEach((b) => {
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });

        panelGroup.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.hidden = panel.getAttribute("data-panel") !== target;
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------
     Product story scroll animation (pedal travels down+left, then
     info cards reveal one by one as scrolling continues)
     ------------------------------------------------------------------ */
  function initStoryScroll() {
    const storyScroll = document.querySelector("[data-story]");
    if (!storyScroll) return;

    const pedal = storyScroll.querySelector("[data-story-pedal]");
    const cards = Array.from(storyScroll.querySelectorAll("[data-story-card]"));

    // How far the pedal travels, in pixels, relative to its starting spot
    const endX = -220; // negative = moves left
    const endY = 0;  // positive = moves down

    // Fraction of the total scroll distance used just for the pedal's move
    // (the remaining fraction is divided evenly between the 3 cards)
    const moveEnd = 0.4;

    let ticking = false;

    function update() {
      const rect = storyScroll.getBoundingClientRect();
      const total = storyScroll.offsetHeight - window.innerHeight;
      let progress = total > 0 ? -rect.top / total : 0;
      progress = Math.min(Math.max(progress, 0), 1);

      const moveT = Math.min(progress / moveEnd, 1);
      const x = endX * moveT;
      const y = endY * moveT;
      pedal.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

      const cardRange = (1 - moveEnd) / cards.length;
      cards.forEach((card, i) => {
        const threshold = moveEnd + cardRange * i;
        card.classList.toggle("is-visible", progress >= threshold);
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  document.addEventListener("DOMContentLoaded", () => {
    mountPedalArt();
    initNewsletterForms();
    setYear();
  });

document.addEventListener("DOMContentLoaded", () => {
    mountPedalArt();
    initNewsletterForms();
    setYear();
    initProductTabs();   // ← add this line
  });

  document.addEventListener("DOMContentLoaded", () => {
    mountPedalArt();
    initNewsletterForms();
    setYear();
    initProductTabs();
    initStoryScroll();   // ← add this line
  });

})();