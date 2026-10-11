(function () {
  "use strict";

  const DATA = window.__DEMO__;
  if (!DATA || !DATA.demo) {
    document.body.innerHTML =
      '<p style="padding:2rem;font-family:system-ui">DEMO data missing.</p>';
    return;
  }

  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

  const clientById = Object.fromEntries(DATA.clients.map((c) => [c.id, c]));
  const serviceById = Object.fromEntries(DATA.services.map((s) => [s.id, s]));

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  function money2(n) {
    return "$" + Number(n).toFixed(2);
  }

  function parseYMD(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(dt, n) {
    const x = new Date(dt);
    x.setDate(x.getDate() + n);
    return x;
  }

  function fmtYMD(dt) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function dowShort(dt) {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
  }

  function monthDay(dt) {
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Header
  $("#salonName").textContent = DATA.salon.name;
  $("#salonTag").textContent = DATA.salon.tagline;

  // —— Week view ——
  function renderWeek() {
    const start = parseYMD(DATA.weekStart);
    const end = addDays(start, 6);
    $("#weekLabel").textContent =
      "Week of " + monthDay(start) + " – " + monthDay(end) + ", " + end.getFullYear() + " · DEMO";

    const days = [];
    for (let i = 0; i < 7; i++) days.push(addDays(start, i));

    const todayStr = fmtYMD(new Date());
    const weekBookings = DATA.bookings.filter((b) => {
      return b.date >= DATA.weekStart && b.date <= fmtYMD(end);
    });
    const booked = weekBookings.length;
    const done = weekBookings.filter((b) => b.status === "done").length;
    const rev = weekBookings.reduce((s, b) => s + (b.price || 0), 0);

    $("#weekStats").innerHTML = [
      card("Appointments", String(booked), done + " completed"),
      card("Week revenue", money(rev), "services (DEMO)"),
      card("Clients on books", String(new Set(weekBookings.map((b) => b.clientId)).size), "unique"),
      card("Open chairs", String(Math.max(0, 21 - booked)), "slots left (est.)"),
    ].join("");

    function card(label, value, sub) {
      return (
        '<div class="stat-card"><div class="label">' +
        label +
        '</div><div class="value">' +
        value +
        '</div><div class="sub">' +
        sub +
        "</div></div>"
      );
    }

    const grid = $("#weekGrid");
    grid.innerHTML = days
      .map((dt) => {
        const key = fmtYMD(dt);
        const list = weekBookings
          .filter((b) => b.date === key)
          .sort((a, b) => a.start.localeCompare(b.start));
        const isToday = key === todayStr;
        const appts = list.length
          ? list
              .map((b) => {
                const c = clientById[b.clientId];
                const s = serviceById[b.serviceId];
                return (
                  '<div class="appt ' +
                  b.status +
                  '">' +
                  '<div class="time">' +
                  b.start +
                  "–" +
                  b.end +
                  "</div>" +
                  '<div class="who">' +
                  (c ? c.name : "?") +
                  '</div><div class="svc">' +
                  (s ? s.name : b.serviceId) +
                  '</div><div class="price">' +
                  money(b.price) +
                  "</div></div>"
                );
              })
              .join("")
          : '<div class="empty-slot">No bookings</div>';
        return (
          '<div class="day-col' +
          (isToday ? " today" : "") +
          '"><div class="day-head"><span class="dow">' +
          dowShort(dt) +
          '</span><span class="dom">' +
          monthDay(dt) +
          "</span></div><div class=\"day-body\">" +
          appts +
          "</div></div>"
        );
      })
      .join("");
  }

  // —— Clients ——
  function renderClients() {
    $("#clientGrid").innerHTML = DATA.clients
      .map((c) => {
        const tags = (c.tags || [])
          .map((t) => '<span class="tag-chip">' + escapeHtml(t) + "</span>")
          .join("");
        return (
          '<article class="client-card">' +
          '<div class="row-top"><div><h3>' +
          escapeHtml(c.name) +
          ' <span class="demo-badge">DEMO</span></h3>' +
          '<div class="since">Client since ' +
          escapeHtml(c.since) +
          "</div></div>" +
          '<div class="tags">' +
          tags +
          "</div></div>" +
          '<div class="formula-box"><div class="brand">' +
          escapeHtml(c.formula.brand) +
          '</div><div class="mix">' +
          escapeHtml(c.formula.mix) +
          '</div><div class="fnotes">' +
          escapeHtml(c.formula.notes) +
          "</div></div>" +
          '<div class="client-notes">' +
          escapeHtml(c.notes) +
          "</div>" +
          '<div class="client-meta"><span>Last visit: ' +
          escapeHtml(c.lastVisit) +
          "</span><span>" +
          escapeHtml(c.phone) +
          " · " +
          escapeHtml(c.email) +
          "</span></div></article>"
        );
      })
      .join("");
  }

  // —— Inventory ——
  function renderInventory() {
    const tbody = $("#invTable tbody");
    tbody.innerHTML = DATA.inventory
      .map((p) => {
        const low = p.qty <= p.reorderAt;
        return (
          '<tr class="' +
          (low ? "low" : "") +
          '"><td><strong>' +
          escapeHtml(p.name) +
          "</strong></td><td class=\"mono\">" +
          escapeHtml(p.sku) +
          "</td><td>" +
          p.qty +
          " " +
          escapeHtml(p.unit) +
          "</td><td>" +
          p.reorderAt +
          "</td><td>" +
          money2(p.cost) +
          '</td><td><span class="status-pill ' +
          (low ? "low" : "ok") +
          '">' +
          (low ? "Reorder" : "OK") +
          "</span></td></tr>"
        );
      })
      .join("");
  }

  // —— Revenue chart ——
  function renderRevenue() {
    const weeks = DATA.revenueByWeek;
    const total = weeks.reduce((s, w) => s + w.revenue, 0);
    const avg = Math.round(total / weeks.length);
    const best = weeks.reduce((a, b) => (b.revenue > a.revenue ? b : a));
    const thisWeek = weeks[weeks.length - 1];

    $("#revSummary").innerHTML = [
      '<div class="stat-card"><div class="label">8-week total</div><div class="value">' +
        money(total) +
        '</div><div class="sub">DEMO</div></div>',
      '<div class="stat-card"><div class="label">Weekly avg</div><div class="value">' +
        money(avg) +
        '</div><div class="sub">across sample</div></div>',
      '<div class="stat-card"><div class="label">Best week</div><div class="value">' +
        money(best.revenue) +
        '</div><div class="sub">' +
        escapeHtml(best.label) +
        "</div></div>",
      '<div class="stat-card"><div class="label">This week</div><div class="value">' +
        money(thisWeek.revenue) +
        '</div><div class="sub">' +
        thisWeek.appts +
        " appts</div></div>",
    ].join("");

    const svg = $("#revChart");
    const W = 720,
      H = 280;
    const pad = { t: 24, r: 16, b: 40, l: 48 };
    const maxR = Math.max(...weeks.map((w) => w.revenue)) * 1.12;
    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;
    const gap = 10;
    const barW = (innerW - gap * (weeks.length - 1)) / weeks.length;

    let grid = "";
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (innerH * i) / 4;
      const val = Math.round(maxR * (1 - i / 4));
      grid +=
        '<line class="grid-line" x1="' +
        pad.l +
        '" y1="' +
        y +
        '" x2="' +
        (W - pad.r) +
        '" y2="' +
        y +
        '"/>' +
        '<text class="axis-label" x="' +
        (pad.l - 8) +
        '" y="' +
        (y + 4) +
        '" text-anchor="end">' +
        money(val) +
        "</text>";
    }

    let bars = "";
    weeks.forEach((w, i) => {
      const h = (w.revenue / maxR) * innerH;
      const x = pad.l + i * (barW + gap);
      const y = pad.t + innerH - h;
      bars +=
        '<rect class="bar" x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        barW +
        '" height="' +
        Math.max(h, 2) +
        '" rx="6"/>' +
        '<text class="val-label" x="' +
        (x + barW / 2) +
        '" y="' +
        (y - 6) +
        '" text-anchor="middle">' +
        money(w.revenue) +
        "</text>" +
        '<text class="axis-label" x="' +
        (x + barW / 2) +
        '" y="' +
        (H - 14) +
        '" text-anchor="middle">' +
        escapeHtml(w.label) +
        "</text>";
    });

    svg.innerHTML =
      '<defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#c4785a"/>' +
      '<stop offset="100%" stop-color="#8b4a35"/>' +
      "</linearGradient></defs>" +
      grid +
      bars;

    $("#revLegend").innerHTML =
      "<span>Bars = weekly service revenue (DEMO)</span>" +
      "<span>· Tips shown on individual receipts</span>";
  }

  // —— Receipts drawer ——
  function renderReceipts() {
    const list = $("#receiptList");
    list.innerHTML = DATA.receipts
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((r) => {
        return (
          '<button type="button" class="receipt-row" data-id="' +
          r.id +
          '"><div class="r-top"><span>' +
          escapeHtml(r.clientName) +
          "</span><span>" +
          money(r.total) +
          '</span></div><div class="r-sub">' +
          escapeHtml(r.date) +
          " · " +
          escapeHtml(r.method) +
          " · " +
          escapeHtml(r.status) +
          " · DEMO</div></button>"
        );
      })
      .join("");

    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".receipt-row");
      if (!btn) return;
      $$(".receipt-row", list).forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      showReceiptDetail(btn.dataset.id);
    });
  }

  function showReceiptDetail(id) {
    const r = DATA.receipts.find((x) => x.id === id);
    if (!r) return;
    const detail = $("#receiptDetail");
    detail.hidden = false;
    const lines = r.lines
      .map(
        (l) =>
          "<tr><td>" +
          escapeHtml(l.desc) +
          '</td><td class="amt">' +
          money2(l.amount) +
          "</td></tr>"
      )
      .join("");
    detail.innerHTML =
      "<h3>Receipt " +
      escapeHtml(r.id.toUpperCase()) +
      ' · <span class="demo-badge">DEMO</span></h3>' +
      "<p class=\"hint\">" +
      escapeHtml(r.clientName) +
      " · " +
      escapeHtml(r.date) +
      " · " +
      escapeHtml(r.method) +
      "</p>" +
      "<table>" +
      lines +
      '<tr><td>Total</td><td class="amt">' +
      money2(r.total) +
      "</td></tr></table>";
  }

  function openDrawer() {
    const d = $("#receiptDrawer");
    d.classList.add("open");
    d.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    const d = $("#receiptDrawer");
    d.classList.remove("open");
    d.setAttribute("aria-hidden", "true");
  }

  $("#btnReceipts").addEventListener("click", openDrawer);
  $("#btnCloseDrawer").addEventListener("click", closeDrawer);
  $("#drawerBackdrop").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // —— Routing ——
  const SCREENS = ["week", "clients", "inventory", "revenue", "about"];

  function showScreen(name) {
    if (!SCREENS.includes(name)) name = "week";
    $$(".screen").forEach((el) => {
      el.hidden = el.id !== "screen-" + name;
    });
    $$(".tab").forEach((a) => {
      a.classList.toggle("active", a.dataset.screen === name);
    });
  }

  function route() {
    const hash = (location.hash || "#week").replace(/^#/, "").split("?")[0];
    showScreen(hash || "week");
  }

  window.addEventListener("hashchange", route);

  // Init
  renderWeek();
  renderClients();
  renderInventory();
  renderRevenue();
  renderReceipts();
  route();

  // shot mode: keep drawer closed, ensure week visible
  if (/[?&]shot=1/.test(location.search)) {
    closeDrawer();
  }
})();
