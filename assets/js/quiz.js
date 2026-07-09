(function quizRuntime() {
  const cfg = window.HK_CONFIG || {};
  const lang = document.documentElement.lang || "tr";
  const copy = (window.HK_I18N && window.HK_I18N[lang] && window.HK_I18N[lang].quiz) || window.HK_I18N.tr.quiz;
  const modal = () => document.getElementById("hk-quiz");
  const root = () => document.getElementById("quiz-root");
  let stepIndex = 0;
  let state = {};
  let lastLead = null;

  const stepDefs = [
    { key: "goal", type: "choice", event: "hk_goal_selected" },
    { key: "duration", type: "choice", event: "hk_duration_selected" },
    { key: "metrics", type: "metrics", event: "hk_bmi_entered" },
    { key: "activity", type: "choice", event: "hk_activity_selected" },
    { key: "timing", type: "choice", event: "hk_join_timing_selected" },
    { key: "region", type: "choice" },
    { key: "contact", type: "contact", event: "hk_form_start" }
  ];

  function valueSlug(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function durationDays(value) {
    const match = String(value || "").match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function bmi() {
    const height = Number(state.height);
    const weight = Number(state.weight);
    if (!height || !weight) return "";
    return (weight / ((height / 100) ** 2)).toFixed(1);
  }

  function scoreLead(lead) {
    const days = durationDays(lead.duration);
    const bmiValue = Number(lead.bmi || 0);
    const timing = valueSlug(lead.join_timing);
    const hasPhone = String(lead.phone || "").replace(/\D/g, "").length >= 8;
    const soon = timing.includes("bu_hafta") || timing.includes("this_week") || timing.includes("diese_woche") || timing.includes("هذا_الأسبوع") || timing.includes("bu_ay") || timing.includes("this_month") || timing.includes("diesen_monat") || timing.includes("هذا_الشهر");
    const later = timing.includes("1_3") || timing.includes("information") || timing.includes("bilgi") || timing.includes("informationen") || timing.includes("معلومات");
    if (hasPhone && soon && (days >= 14 || bmiValue >= 30 || lead.whatsapp_clicked)) return "hot";
    if (hasPhone && (later || days >= 7)) return "warm";
    return "cold";
  }

  function utm() {
    const params = new URLSearchParams(location.search);
    return {
      campaign_source: params.get("utm_source") || "",
      campaign_medium: params.get("utm_medium") || "",
      campaign_campaign: params.get("utm_campaign") || ""
    };
  }

  function buildLead() {
    const lead = {
      project: "HK",
      language: lang,
      source_page: location.pathname,
      ...utm(),
      goal: state.goal || "",
      duration: state.duration || "",
      age: state.age || "",
      height: state.height || "",
      weight: state.weight || "",
      bmi: bmi(),
      activity_level: state.activity || "",
      join_timing: state.timing || "",
      region: state.region || "",
      name: state.name || "",
      phone: state.phone || "",
      city_country: state.city_country || "",
      preferred_language: state.preferred_language || lang,
      whatsapp_clicked: false,
      created_at: new Date().toISOString()
    };
    lead.lead_score = scoreLead(lead);
    return lead;
  }

  async function submitLead(lead) {
    lastLead = lead;
    if (cfg.LEAD_ENDPOINT) {
      const response = await fetch(cfg.LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });
      if (!response.ok) throw new Error("Lead endpoint failed");
    } else {
      const key = "hk_quiz_leads";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(lead);
      localStorage.setItem(key, JSON.stringify(existing));
      console.log("HK quiz lead", lead);
    }
    window.HKTracking?.leadSubmit?.(lead);
  }

  function open() {
    stepIndex = 0;
    state = {};
    const element = modal();
    if (!element) return;
    element.hidden = false;
    document.body.style.overflow = "hidden";
    window.HKTracking?.quizStart?.();
    render();
    setTimeout(() => element.querySelector("button, input, select")?.focus(), 30);
  }

  function close() {
    const element = modal();
    if (!element) return;
    element.hidden = true;
    document.body.style.overflow = "";
  }

  function render() {
    const step = stepDefs[stepIndex];
    const progress = Math.round(((stepIndex + 1) / stepDefs.length) * 100);
    const stepCopy = copy.steps[step.key];
    const title = Array.isArray(stepCopy) ? stepCopy[0] : stepCopy;
    root().innerHTML = `
      <p class="eyebrow">${copy.progress} ${stepIndex + 1}/${stepDefs.length}</p>
      <h2 id="quiz-title">${copy.title}</h2>
      <p>${copy.intro}</p>
      <div class="quiz-progress" aria-hidden="true"><span style="width:${progress}%"></span></div>
      <form class="quiz-step" novalidate>
        <h3>${title}</h3>
        ${renderStep(step)}
        <p class="quiz-error" role="alert"></p>
        <div class="quiz-actions">
          <button class="button button-secondary" type="button" data-back ${stepIndex === 0 ? "disabled" : ""}>${copy.back}</button>
          <button class="button button-primary" type="submit">${stepIndex === stepDefs.length - 1 ? copy.submit : copy.next}</button>
        </div>
      </form>
    `;
    const form = root().querySelector("form");
    form.addEventListener("submit", onSubmit);
    form.querySelector("[data-back]")?.addEventListener("click", () => {
      if (stepIndex > 0) {
        stepIndex -= 1;
        render();
      }
    });
    form.querySelectorAll(".quiz-option").forEach((button) => {
      button.addEventListener("click", () => {
        state[step.key] = button.dataset.value;
        form.querySelectorAll(".quiz-option").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        if (step.event) window.HKTracking?.track?.(step.event, { value: button.dataset.value });
      });
    });
    if (step.type === "contact") window.HKTracking?.track?.("hk_form_start");
  }

  function renderStep(step) {
    if (step.type === "choice") {
      const options = copy.steps[step.key][1];
      return `<div class="quiz-options">${options.map((option) => `<button class="quiz-option" type="button" data-value="${escapeAttr(option)}" aria-pressed="${state[step.key] === option ? "true" : "false"}">${escapeHtml(option)}</button>`).join("")}</div>`;
    }
    if (step.type === "metrics") {
      return `<div class="quiz-fields">
        ${input("age", "number", copy.labels.age, "18", "99")}
        ${input("height", "number", copy.labels.height, "120", "230")}
        ${input("weight", "number", copy.labels.weight, "35", "300")}
      </div><p class="small">${copy.bmiNote}</p>`;
    }
    return `<div class="quiz-fields contact">
      ${input("name", "text", copy.labels.name)}
      ${input("phone", "tel", copy.labels.phone, "", "", "+90")}
      ${input("city_country", "text", copy.labels.city_country)}
      <label class="quiz-field">${copy.labels.preferred_language}<select name="preferred_language">${Object.entries(window.HK_I18N).map(([code, value]) => `<option value="${code}" ${code === lang ? "selected" : ""}>${escapeHtml(value.name)}</option>`).join("")}</select></label>
      <label class="checkbox"><input type="checkbox" name="consent" ${state.consent ? "checked" : ""}><span>${copy.consent}</span></label>
    </div>`;
  }

  function input(name, type, label, min = "", max = "", placeholder = "") {
    return `<label class="quiz-field">${label}<input name="${name}" type="${type}" value="${escapeAttr(state[name] || "")}" ${min ? `min="${min}"` : ""} ${max ? `max="${max}"` : ""} ${placeholder ? `placeholder="${placeholder}"` : ""}></label>`;
  }

  function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const step = stepDefs[stepIndex];
    const error = form.querySelector(".quiz-error");
    if (!saveStep(form, step)) {
      error.textContent = copy.required;
      return;
    }
    error.textContent = "";
    if (step.event && step.type !== "choice") window.HKTracking?.track?.(step.event, { bmi: bmi() });
    if (stepIndex < stepDefs.length - 1) {
      stepIndex += 1;
      render();
      return;
    }
    const lead = buildLead();
    submitLead(lead)
      .then(renderResult)
      .catch((err) => {
        console.error(err);
        error.textContent = copy.required;
      });
  }

  function saveStep(form, step) {
    if (step.type === "choice") return Boolean(state[step.key]);
    const data = Object.fromEntries(new FormData(form).entries());
    if (step.type === "metrics") {
      for (const key of ["age", "height", "weight"]) {
        if (!data[key]) return false;
        state[key] = data[key];
      }
      return true;
    }
    for (const key of ["name", "phone", "city_country", "preferred_language"]) state[key] = data[key] || "";
    state.consent = data.consent === "on";
    return state.name && state.phone && state.city_country && state.preferred_language && state.consent;
  }

  function renderResult() {
    root().innerHTML = `<div class="quiz-result">
      <p class="eyebrow">HK</p>
      <h2>${copy.resultTitle}</h2>
      <p>${copy.resultBody}</p>
      <div class="hero-actions">
        <a class="button button-primary js-result-whatsapp" href="#">${copy.whatsapp}</a>
        <a class="button button-secondary" href="index.html">${copy.home}</a>
      </div>
    </div>`;
    root().querySelector(".js-result-whatsapp")?.addEventListener("click", (event) => {
      markWhatsappClicked();
      if (cfg.WHATSAPP_NUMBER) {
        event.currentTarget.href = "https://wa.me/" + cfg.WHATSAPP_NUMBER.replace(/\D/g, "");
        event.currentTarget.target = "_blank";
        event.currentTarget.rel = "noopener";
      } else {
        event.preventDefault();
        close();
      }
      window.HKTracking?.whatsappClick?.({ source_page: location.pathname, from_quiz_result: true });
    });
  }

  function markWhatsappClicked() {
    if (!lastLead) return;
    lastLead.whatsapp_clicked = true;
    lastLead.lead_score = scoreLead(lastLead);
    const key = "hk_quiz_leads";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const index = existing.findIndex((item) => item.created_at === lastLead.created_at);
    if (index >= 0) {
      existing[index] = lastLead;
      localStorage.setItem(key, JSON.stringify(existing));
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }
  function escapeAttr(value) {
    return escapeHtml(value);
  }

  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-quiz-close]")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal()?.hidden) close();
  });

  window.HKQuiz = { open, close, markWhatsappClicked };
})();
