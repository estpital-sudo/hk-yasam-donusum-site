(function () {
  const cfg = window.HK_CONFIG || {};
  const lang = document.documentElement.lang || "tr";
  const basePath = cfg.BASE_PATH || "/";

  function contactHref(page = "contact") {
    const routes = {
      tr: "iletisim.html",
      en: "contact.html",
      de: "kontakt.html",
      ar: "contact.html"
    };
    return page === "home" ? "index.html" : (routes[lang] || "contact.html");
  }

  function setupHeader() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    const header = document.querySelector(".site-header");
    if (!toggle || !nav || !header) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      header.classList.toggle("menu-open", open);
    });
  }

  function setupContactLinks() {
    document.querySelectorAll(".js-whatsapp").forEach((link) => {
      if (cfg.WHATSAPP_NUMBER) {
        link.href = "https://wa.me/" + cfg.WHATSAPP_NUMBER.replace(/\D/g, "");
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        link.href = contactHref();
      }
      link.addEventListener("click", () => {
        window.HKTracking?.whatsappClick({ source_page: location.pathname });
        window.HKQuiz?.markWhatsappClicked?.();
      });
    });
    document.querySelectorAll(".js-call").forEach((link) => {
      if (cfg.PHONE_NUMBER) link.href = "tel:" + cfg.PHONE_NUMBER.replace(/\s/g, "");
      else link.href = contactHref();
      link.addEventListener("click", () => window.HKTracking?.callClick({ source_page: location.pathname }));
    });
  }

  function setupQuizButtons() {
    document.querySelectorAll(".js-quiz-open").forEach((button) => {
      button.addEventListener("click", () => window.HKQuiz?.open?.());
    });
  }

  function setupFaq() {
    document.querySelectorAll(".faq-item button").forEach((button) => {
      button.addEventListener("click", () => {
        const answer = button.nextElementSibling;
        const open = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!open));
        if (answer) answer.hidden = open;
      });
    });
  }

  function setupMedia() {
    const filters = document.querySelectorAll(".media-filter");
    const cards = document.querySelectorAll(".video-card");
    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        const value = filter.dataset.filter;
        filters.forEach((item) => item.classList.toggle("is-active", item === filter));
        cards.forEach((card) => {
          card.hidden = value !== "all" && card.dataset.category !== value;
        });
        window.HKTracking?.content?.("hk_gallery_view", { filter: value });
      });
    });

    document.querySelectorAll(".video-card").forEach((card) => {
      const id = card.dataset.youtubeId || card.dataset.videoId;
      const image = card.querySelector(".video-thumb img");
      if (id && image && !image.dataset.staticThumb) {
        image.src = "https://img.youtube.com/vi/" + encodeURIComponent(id) + "/hqdefault.jpg";
      }
    });

    document.querySelectorAll(".video-thumb").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".video-card");
        const id = card?.dataset.youtubeId || card?.dataset.videoId;
        const title = card?.querySelector("h3")?.textContent || "HK video";
        window.HKTracking?.content?.("hk_video_play_click", { video_title: title, has_embed: Boolean(id) });
        if (!card || card.dataset.loaded === "true") return;
        if (!id) return;
        const iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(id) + "?autoplay=1";
        iframe.title = title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.style.width = "100%";
        iframe.style.aspectRatio = "16 / 9";
        iframe.style.border = "0";
        iframe.style.borderRadius = "var(--radius)";
        button.replaceWith(iframe);
        card.dataset.loaded = "true";
      });
    });
  }

  function setupContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const lead = {
        project: "HK",
        language: lang,
        source_page: location.pathname,
        lead_type: "contact_form",
        created_at: new Date().toISOString(),
        ...data
      };
      const key = "hk_contact_leads";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(lead);
      localStorage.setItem(key, JSON.stringify(existing));
      console.log("HK contact lead", lead);
      window.HKTracking?.leadSubmit?.(lead);
      form.reset();
      const message = window.HK_I18N?.[lang]?.quiz?.resultTitle || "OK";
      form.insertAdjacentHTML("beforeend", '<p class="note" role="status">' + message + '</p>');
    });
  }

  function setupContentTracking() {
    if (document.body.dataset.page === "program") window.HKTracking?.content?.("hk_program_view");
    if (document.body.dataset.page === "rooms") window.HKTracking?.content?.("hk_room_view");
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupHeader();
    setupContactLinks();
    setupQuizButtons();
    setupFaq();
    setupMedia();
    setupContactForm();
    setupContentTracking();
    document.documentElement.style.setProperty("--hk-base-path", '"' + basePath + '"');
  });
})();
