(function () {
  const cfg = window.HK_CONFIG || {};
  const standardMap = {
    hk_page_view: "PageView",
    hk_program_view: "ViewContent",
    hk_room_view: "ViewContent",
    hk_gallery_view: "ViewContent",
    hk_lead_submit: "Lead",
    hk_whatsapp_click: "Contact",
    hk_call_click: "Contact",
    hk_quiz_start: "CompleteRegistration"
  };

  function injectGtm() {
    if (!cfg.GTM_ID || document.querySelector("[data-hk-gtm]")) return;
    const script = document.createElement("script");
    script.dataset.hkGtm = "true";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(cfg.GTM_ID);
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  }

  function initMeta() {
    if (!cfg.META_PIXEL_ID || window.fbq) return;
    window.fbq = function () {
      window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
    };
    window.fbq.queue = [];
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq("init", cfg.META_PIXEL_ID);
  }

  function track(eventName, payload = {}, metaEvent) {
    window.dataLayer = window.dataLayer || [];
    const eventPayload = {
      event: eventName,
      project: "HK",
      language: document.documentElement.lang || payload.language,
      page: document.body?.dataset?.page,
      ...payload
    };
    window.dataLayer.push(eventPayload);
    if (typeof window.fbq === "function") {
      const standard = metaEvent || standardMap[eventName];
      if (standard) window.fbq("track", standard, eventPayload);
      window.fbq("trackCustom", eventName, eventPayload);
    }
    return eventPayload;
  }

  window.HKTracking = {
    track,
    pageView: () => track("hk_page_view", { source_page: location.pathname }),
    quizStart: () => track("hk_quiz_start"),
    leadSubmit: (lead) => track("hk_lead_submit", lead, "Lead"),
    whatsappClick: (payload = {}) => track("hk_whatsapp_click", payload, "Contact"),
    callClick: (payload = {}) => track("hk_call_click", payload, "Contact"),
    content: (eventName, payload = {}) => track(eventName, payload, standardMap[eventName])
  };

  injectGtm();
  initMeta();
  document.addEventListener("DOMContentLoaded", () => window.HKTracking.pageView());
})();
