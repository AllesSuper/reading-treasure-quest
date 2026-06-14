/* ============================================================
   LeseAbenteuer – App-Logik
   ------------------------------------------------------------
   Architektur (bewusst rahmenfrei, ein State-Objekt):
     state        – persistenter Spielstand (localStorage)
     session      – fluechtiger Zustand der laufenden Geschichte
     render*()    – zeichnen die Screens neu (datengetrieben)
     t() / loc()  – i18n-Helfer
   Erweiterbar: neue Welten/Geschichten -> content.js,
   neue Sprache -> UI[code] + flag in SUPPORTED_LANGS.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Konstanten / Balancing ---------- */
  var SAVE_KEY = "leseabenteuer.save.v1";
  var WPM = { 1: 55, 2: 70, 3: 85 };      // realistische Lesegeschw. Klasse 2
  var TASK_SECONDS = 18;                    // Zeitpuffer je Aufgabe
  var JOKER_PER_SESSION = 3;
  var JOKER_SECONDS = 30;
  var COINS_CORRECT = 5, COINS_SECTION = 10;
  var WEEK_GOAL = 5;                        // Geschichten pro Woche

  /* ---------- Persistenter Spielstand ---------- */
  var DEFAULT_STATE = {
    lang: null, theme: "light", readScale: "normal", readFont: "standard",
    sound: true, name: "",
    coins: 0, stars: 0, level: 1, xp: 0,
    streak: 0, lastPlayed: null,
    badges: {}, finished: {},
    stats: { sessions: 0, correct: 0, answered: 0, words: 0, seconds: 0,
      byType: { comprehension: { c: 0, n: 0 }, spelling: { c: 0, n: 0 }, vocab: { c: 0, n: 0 } } },
    history: [],
    mission: { day: null, read: false, correct: 0, finished: false },
    week: { id: null, count: 0 }
  };
  var state = load();
  var session = null;

  /* ---------- DOM-Helfer ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  var app = $("#app");

  /* ---------- i18n ---------- */
  function t(key) {
    var lang = state.lang || "de";
    var v = (UI[lang] && UI[lang][key]);
    if (v == null) v = UI.de[key];
    return v;
  }
  function loc(obj) {                       // mehrsprachiger Inhalt mit DE-Fallback
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    var lang = state.lang || "de";
    return obj[lang] != null ? obj[lang] : obj.de;
  }
  function fmt(str, n) { return String(str).replace("{n}", n); }

  /* ---------- Skill-Kategorie je Aufgabentyp (fuer Eltern-Report) ---------- */
  function taskCategory(type) {
    if (["missing", "syllable", "sentence", "spellfix"].indexOf(type) >= 0) return "spelling";
    if (["vocab", "wordimage"].indexOf(type) >= 0) return "vocab";
    return "comprehension";
  }
  function ensureStats() {
    if (!state.stats) state.stats = {};
    var s = state.stats;
    if (s.sessions == null) s.sessions = 0;
    if (s.correct == null) s.correct = 0;
    if (s.answered == null) s.answered = 0;
    if (s.words == null) s.words = 0;
    if (s.seconds == null) s.seconds = 0;
    if (!s.byType) s.byType = { comprehension: { c: 0, n: 0 }, spelling: { c: 0, n: 0 }, vocab: { c: 0, n: 0 } };
    if (!state.history) state.history = [];
  }

  /* ---------- Speichern / Laden ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      var s = JSON.parse(raw);
      // sanftes Merge, falls neue Felder dazukommen (Vorwärtskompatibilität)
      return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), s);
    } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
  }
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- Theme / Lesbarkeit anwenden ---------- */
  function applyPrefs() {
    var root = document.documentElement;
    root.setAttribute("data-theme", state.theme);
    root.setAttribute("data-readfont", state.readFont);
    var scale = state.readScale === "small" ? 0.9 : state.readScale === "large" ? 1.25 : 1.05;
    root.style.setProperty("--read-scale", scale);
  }

  /* ---------- Datum / Missionen / Streak ---------- */
  function todayKey() { var d = new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
  function weekKey() {
    var d = new Date(); var onejan = new Date(d.getFullYear(),0,1);
    var week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
    return d.getFullYear()+"-W"+week;
  }
  function ensureDailyState() {
    var day = todayKey();
    if (state.mission.day !== day) {
      // Streak-Pflege: nur fortführen, wenn gestern gespielt
      if (state.lastPlayed) {
        var diff = (new Date(day) - new Date(state.lastPlayed)) / 86400000;
        if (diff > 1.5) state.streak = 0;
      }
      state.mission = { day: day, read: false, correct: 0, finished: false };
    }
    if (state.week.id !== weekKey()) state.week = { id: weekKey(), count: 0 };
  }

  /* ---------- Belohnungen / Level ---------- */
  function addCoins(n) { state.coins += n; }
  function addStars(n) { state.stars += n; checkLevel(); checkWorldUnlock(); }
  function checkLevel() {
    var need = state.level * 5;            // einfache, sichtbare Kurve
    while (state.stars >= levelThreshold(state.level)) state.level++;
    void need;
  }
  function levelThreshold(lvl) {           // Sterne, die fuer das *naechste* Level noetig sind
    var sum = 0; for (var i = 1; i <= lvl; i++) sum += 4 + i; return sum;
  }
  function checkWorldUnlock() {
    CONTENT.worlds.forEach(function (w) {
      if (state.stars >= w.unlockStars && !state._announced) { /* announce handled elsewhere */ }
    });
  }

  /* ============================================================
     SCREEN-ROUTING
     ============================================================ */
  function show(id) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove("active");
    var target = document.getElementById(id);
    if (target) target.classList.add("active");
    window.scrollTo(0, 0);
  }

  /* ---------- HUD ---------- */
  function hudHtml() {
    return '<div class="hud">' +
      '<div class="avatar">\uD83E\uDDD2</div>' +
      '<div class="who">' + (state.name || t("hello")) +
        '<small>' + t("level") + " " + state.level + '</small></div>' +
      '<span class="chip gold"><span class="ic">\u2b50</span>' + state.stars + '</span>' +
      '<span class="chip"><span class="ic">\uD83E\uDE99</span>' + state.coins + '</span>' +
      '<span class="chip" title="' + t("streak") + '"><span class="ic">\uD83D\uDD25</span>' + state.streak + '</span>' +
      '<button class="icon-btn" data-act="settings" aria-label="' + t("settings") + '">\u2699\ufe0f</button>' +
      '</div>';
  }

  /* ============================================================
     1) SPRACHWAHL
     ============================================================ */
  function renderLanguage() {
    var html = '<div class="center-col" style="padding-top:6vh">' +
      '<div style="text-align:center">' +
      '<div style="font-size:5rem">\uD83D\uDCDA\u2728</div>' +
      '<h1>' + UI.de.appName + ' / ' + UI.en.appName + '</h1>' +
      '<p class="muted" style="font-size:1.1rem">' + UI.de.chooseLang + '<br>' + UI.en.chooseLang + '</p>' +
      '</div><div class="grid lang-grid spacer">';
    SUPPORTED_LANGS.forEach(function (l) {
      html += '<button class="card lang-tile" data-lang="' + l.code + '">' +
        '<span class="flag">' + l.flag + '</span><span>' + l.name + '</span></button>';
    });
    html += '</div></div>';
    $("#screen-language").innerHTML = html;
  }

  /* ============================================================
     2) HOME / ABENTEUERKARTE
     ============================================================ */
  function renderHome() {
    ensureDailyState();
    var w = $("#screen-home");
    var html = hudHtml() + '<div class="spacer"></div>';

    // Missions-Box
    html += '<section><h2>' + t("missions") + ' \uD83C\uDFAF</h2>';
    html += mission("\uD83D\uDCD6", t("missionRead"), state.mission.read ? 1 : 0, 1);
    html += mission("\u2705", t("missionCorrect"), Math.min(state.mission.correct,3), 3);
    html += mission("\uD83C\uDFC6", t("missionFinish"), state.mission.finished ? 1 : 0, 1);
    var wk = Math.min(state.week.count, WEEK_GOAL);
    html += '<div class="mission"><span class="big-ic">\uD83D\uDCC5</span><div style="flex:1">' +
      '<strong>' + t("weekGoal") + '</strong> <span class="muted">' + wk + '/' + WEEK_GOAL + '</span>' +
      '<div class="bar"><span style="width:' + (wk/WEEK_GOAL*100) + '%"></span></div></div></div>';
    html += '</section><div class="spacer"></div>';

    // Welten-Karte
    html += '<section><div class="sec-head"><h2 style="margin:0">' + t("map") + ' \uD83D\uDDFA\ufe0f</h2>' +
      '<button class="btn ghost" data-act="discover">\uD83D\uDD2D ' + t("discover") + '</button>' +
      '<button class="btn ghost" data-act="collection">\uD83D\uDCD5 ' + t("collection") + '</button></div>';
    html += '<div class="map grid cards">';
    CONTENT.worlds.forEach(function (world) {
      var unlocked = state.stars >= world.unlockStars;
      var done = world.stories.filter(function (s) { return state.finished[s.id]; }).length;
      html += '<button class="card' + (unlocked ? "" : " locked") + '" ' +
        (unlocked ? 'data-world="' + world.id + '"' : 'data-locked="1"') + '>' +
        (unlocked ? "" : '<span class="lock">\uD83D\uDD12</span>') +
        '<span class="emoji">' + world.emoji + '</span>' +
        '<h3>' + loc(world.name) + '</h3>' +
        '<p class="meta">' + loc(world.desc) + '</p>' +
        '<p class="meta">' + (unlocked
          ? ('\u2b50 ' + done + '/' + world.stories.length + ' \u00b7 ' + world.stories.length + ' ' + t("stories"))
          : fmt(t("unlockAt"), world.unlockStars)) + '</p>' +
        '</button>';
    });
    html += '</div></section>';
    w.innerHTML = html;
  }
  function mission(ic, label, val, max) {
    var done = val >= max;
    return '<div class="mission' + (done ? " done" : "") + '"><span class="big-ic">' + (done ? "\u2705" : ic) + '</span>' +
      '<div style="flex:1"><strong>' + label + '</strong>' +
      '<div class="bar"><span style="width:' + (val/max*100) + '%"></span></div></div></div>';
  }

  /* ============================================================
     3) GESCHICHTEN-AUSWAHL
     ============================================================ */
  function renderWorld(worldId) {
    var world = findWorld(worldId);
    var w = $("#screen-world");
    var html = hudHtml() +
      '<div class="btn-row spacer"><button class="btn ghost" data-act="home">\u2190 ' + t("map") + '</button></div>' +
      '<section><h1>' + world.emoji + ' ' + loc(world.name) + '</h1>' +
      '<p class="muted">' + t("chooseStory") + '</p><div class="grid cards">';
    world.stories.forEach(function (story) {
      var mins = estimateStoryMinutes(story);
      var fin = state.finished[story.id];
      html += '<button class="card" data-story="' + story.id + '">' +
        '<span class="emoji">' + world.emoji + '</span>' +
        '<h3>' + loc(story.title) + (fin ? ' \u2b50' : '') + '</h3>' +
        '<p class="meta">' + loc(story.intro) + '</p>' +
        '<p class="meta">\u23f1\ufe0f ' + t("readTime") + ': ~' + mins + ' ' + t("minutes") +
        ' \u00b7 ' + difficultyDots(story.level) + '</p></button>';
    });
    html += '</div></section>';
    w.innerHTML = html;
  }
  function difficultyDots(lvl) { var s=""; for (var i=1;i<=3;i++) s += i<=lvl ? "\u25cf" : "\u25cb"; return s; }

  /* ---------- Lesezeit realistisch schaetzen ---------- */
  function countWords(str) { return (str.trim().match(/\S+/g) || []).length; }
  function sectionSeconds(section, level) {
    var words = countWords(loc(section.text));
    var read = words / WPM[level] * 60;
    var tasks = (section.tasks ? section.tasks.length : 0) * TASK_SECONDS;
    return Math.max(25, Math.round(read + tasks));
  }
  function estimateStoryMinutes(story) {
    var total = 0;
    story.sections.forEach(function (s) { total += sectionSeconds(s, story.level); });
    return Math.max(1, Math.round(total / 60));
  }

  /* (Modus-Wahl entfernt: Geschichten starten direkt in einem einzigen Standard-Modus.) */

  /* ============================================================
     5) SESSION (Lesen + Aufgaben)
     ============================================================ */
  function startSession(storyId, mode) {
    var info = findStory(storyId);
    var totalSecs = 0;
    info.story.sections.forEach(function (s) { totalSecs += sectionSeconds(s, info.story.level); });
    totalSecs = Math.round(totalSecs * 1.15);   // ein einziger, kindgerechter Standard-Modus

    session = {
      world: info.world, story: info.story, mode: mode,
      si: 0, phase: "read",        // phase: read -> tasks
      ti: 0,                        // aktuelle Aufgabe
      timeLeft: totalSecs, jokers: JOKER_PER_SESSION,
      correct: 0, answered: 0, coins: 0, stars: 0, words: 0,
      adapt: 0,                     // adaptiver Schwierigkeits-Drift (-2..+2)
      easyText: null,               // null=auto (folgt adapt), true/false = manuell gewaehlt
      elapsed: 0,                   // verbrachte Sekunden (fuer Eltern-Report)
      surpriseUsed: false, timer: null
    };
    startTimer();
    renderSection();
    show("screen-session");
  }

  function startTimer() {
    stopTimer();
    session.timer = setInterval(function () {
      session.timeLeft--;
      session.elapsed++;
      updateTimer();
      if (session.timeLeft === 20) toast(t("timeUp"));
      if (session.timeLeft <= 0) { session.timeLeft = 0; updateTimer(); }
    }, 1000);
  }
  function stopTimer() { if (session && session.timer) { clearInterval(session.timer); session.timer = null; } }
  function updateTimer() {
    var elx = $("#timer"); if (!elx) return;
    var m = Math.floor(session.timeLeft / 60), s = session.timeLeft % 60;
    elx.querySelector(".ring").textContent = m + ":" + (s < 10 ? "0" : "") + s;
    elx.classList.toggle("low", session.timeLeft <= 30);
  }

  /* ---------- Adaptive Textvariante: leicht vs. normal ---------- */
  // Auto: bei Schwierigkeiten (adapt<0) wird automatisch die kuerzere,
  // einfachere Variante gezeigt. Das Kind kann jederzeit manuell umschalten.
  function useEasy(sec) {
    if (!sec || !sec.easy) return false;
    if (session.easyText === true) return true;
    if (session.easyText === false) return false;
    return session.adapt < 0;
  }
  function sectionDisplayText(sec) { return useEasy(sec) ? loc(sec.easy) : loc(sec.text); }

  function renderSection() {
    var sec = session.story.sections[session.si];
    var total = session.story.sections.length;
    var w = $("#screen-session");
    var progress = (session.si / total) * 100;
    var jokerLabel = session.jokers > 0 ? fmt(t("jokerLeft"), session.jokers) : "";

    var html = '<div class="sec-head">' +
      '<button class="icon-btn" data-act="quit">\u2715</button>' +
      '<div class="bar" title="' + t("progress") + '"><span style="width:' + progress + '%"></span></div>' +
      '<div class="timer" id="timer"><span>\u23f1\ufe0f</span><span class="ring">0:00</span></div>' +
      '</div>';

    // Lese-Karte mit anklickbaren Vokabeln
    html += '<div class="read-card"><p class="eyebrow">' + session.world.emoji + ' ' + loc(session.story.title) +
      ' \u00b7 ' + (session.si + 1) + '/' + total + '</p>' +
      (useEasy(sec) ? '<div class="btn-row" style="margin-bottom:8px"><span class="chip">' + t("easyOn") + '</span></div>' : '') +
      '<div class="story-text">' + markVocab(sectionDisplayText(sec), sec) + '</div>';

    // Aktionsleiste: Vorlesen (nur Helfer-Modus dauerhaft sichtbar), Zeitjoker, Weiter
    html += '<div class="btn-row" style="margin-top:18px">';
    html += '<button class="btn ghost" data-act="speak">\uD83D\uDD0A ' + t("readAloud") + '</button>';
    if (sec.easy)
      html += '<button class="btn ghost" data-act="toggleEasy">\uD83E\uDEB6 ' + (useEasy(sec) ? t("normalText") : t("easierText")) + '</button>';
    html += '<button class="btn ghost" data-act="joker">\u23f3 ' + t("timeJoker") +
      (jokerLabel ? ' (' + jokerLabel + ')' : '') + '</button>';
    html += '<button class="btn primary" style="margin-left:auto" data-act="toTasks">' + t("next") + ' \u2192</button>';
    html += '</div></div>';

    w.innerHTML = html;
    updateTimer();
  }

  // Vokabeln im Text anklickbar machen (Wortschatz-Impuls)
  function markVocab(text, sec) {
    var vocabTask = (sec.tasks || []).filter(function (x) { return x.type === "vocab"; });
    vocabTask.forEach(function (vt) {
      var word = loc(vt.word);
      if (!word) return;
      var re = new RegExp("(" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "i");
      text = text.replace(re, '<span class="vocab" data-vocab="' + encodeURIComponent(word) +
        '" data-def="' + encodeURIComponent(loc(vt.options)[vt.answer]) + '">$1</span>');
    });
    return text;
  }

  /* ---------- Aufgaben rendern (Multiple Choice 4–6) ---------- */
  function renderTask() {
    var sec = session.story.sections[session.si];
    var tasks = sec.tasks || [];
    if (session.ti >= tasks.length) { nextSection(); return; }
    var task = tasks[session.ti];
    if (task.type === "detector") { renderDetector(task, tasks); return; }
    var w = $("#screen-session");
    var total = session.story.sections.length;

    // adaptiver Hinweis: bei Schwierigkeiten (adapt<0) Hilfe direkt zeigen
    var showHintNow = session.adapt < 0 && task.hint;
    var intro = task.type === "predict" ? ('<p class="muted">' + t("predictIntro") + '</p>') : "";

    var html = '<div class="sec-head">' +
      '<button class="icon-btn" data-act="quit">\u2715</button>' +
      '<div class="bar"><span style="width:' + (((session.si + (session.ti+1)/(tasks.length+1)) / total) * 100) + '%"></span></div>' +
      '<div class="timer" id="timer"><span>\u23f1\ufe0f</span><span class="ring">0:00</span></div>' +
      '</div>';

    html += '<div class="read-card"><p class="eyebrow">' + taskBadge(task.type) + '</p>' +
      intro + '<h2>' + loc(task.q) + '</h2>';
    if (showHintNow) html += '<p class="muted">\uD83D\uDCA1 ' + loc(task.hint) + '</p>';

    var opts = loc(task.options);
    var two = opts.every(function (o) { return String(o).length <= 14; }) && opts.length >= 4;
    html += '<div class="mc-list' + (two ? " two" : "") + '">';
    var keys = "ABCDEF";
    opts.forEach(function (o, i) {
      html += '<button class="mc" data-opt="' + i + '"><span class="key">' + keys[i] + '</span><span>' + o + '</span></button>';
    });
    html += '</div>';
    html += '<div class="feedback" id="fb"></div>';
    html += '<div class="btn-row" style="margin-top:14px"><button class="btn primary hidden" id="nextBtn" style="margin-left:auto">' + t("next") + ' \u2192</button></div>';
    html += '</div>';
    w.innerHTML = html;
    updateTimer();
  }

  function taskBadge(type) {
    var map = {
      quiz: "\u2753 " + (state.lang==="en"?"Understand":"Verstehen"),
      predict: "\uD83D\uDD2E " + (state.lang==="en"?"Predict":"Vermuten"),
      vocab: "\uD83D\uDCAC " + (state.lang==="en"?"Word":"Wortschatz"),
      missing: "\uD83D\uDD24 " + (state.lang==="en"?"Missing letter":"Buchstabe"),
      syllable: "\uD83E\uDDE9 " + (state.lang==="en"?"Syllables":"Silben"),
      wordimage: "\uD83D\uDDBC\ufe0f " + (state.lang==="en"?"Word & picture":"Wort & Bild"),
      sentence: "\uD83D\uDD17 " + (state.lang==="en"?"Sentence":"Satz ordnen"),
      spellfix: "\uD83D\uDD0E " + (state.lang==="en"?"Find mistake":"Fehler finden"),
      retell: "\uD83D\uDDE3\ufe0f " + (state.lang==="en"?"Retell":"Nacherz\u00e4hlen"),
      detector: "\uD83D\uDD0D " + (state.lang==="en"?"Metal detector":"Metalldetektor")
    };
    return map[type] || "\u2753";
  }

  /* ---------- Metalldetektor-Suche (Touch, mit Signal-Feedback) ---------- */
  // Exploratives Mini-Game: je naeher an der Fundstelle, desto lauter das Piepen.
  // Bewusst NICHT in die Trefferquote gerechnet – es ist ein Entdecker-Moment.
  function renderDetector(task, tasks) {
    var w = $("#screen-session");
    var total = session.story.sections.length;
    var html = '<div class="sec-head">' +
      '<button class="icon-btn" data-act="quit">\u2715</button>' +
      '<div class="bar"><span style="width:' + (((session.si + (session.ti + 1) / (tasks.length + 1)) / total) * 100) + '%"></span></div>' +
      '<div class="timer" id="timer"><span>\u23f1\ufe0f</span><span class="ring">0:00</span></div>' +
      '</div>';
    html += '<div class="read-card"><p class="eyebrow">' + taskBadge("detector") + '</p>' +
      '<h2>' + loc(task.q) + '</h2><p class="muted">' + t("detectorSweep") + '</p>';
    var opts = loc(task.options);
    html += '<div class="mc-list detector">';
    opts.forEach(function (o, i) {
      html += '<button class="mc" data-spot="' + i + '"><span>' + o + '</span></button>';
    });
    html += '</div><div class="feedback" id="fb"></div>';
    html += '<div class="btn-row" style="margin-top:14px"><button class="btn primary hidden" id="nextBtn" style="margin-left:auto">' + t("next") + ' \u2192</button></div>';
    html += '</div>';
    w.innerHTML = html;
    updateTimer();
  }
  function detectorTap(i) {
    var sec = session.story.sections[session.si];
    var task = sec.tasks[session.ti];
    var btns = document.querySelectorAll(".mc[data-spot]");
    var dist = Math.abs(i - task.answer);
    var fb = $("#fb");
    var btn = btns[i];
    if (dist === 0) {
      for (var k = 0; k < btns.length; k++) btns[k].disabled = true;
      btn.classList.remove("warm", "hot"); btn.classList.add("correct");
      session.coins += COINS_CORRECT;
      fb.className = "feedback ok show";
      fb.innerHTML = t("sigFound") + (task.fact ? '<br><span class="muted">\u2728 ' + t("didYouKnow") + ' ' + loc(task.fact) + '</span>' : '');
      ding(true); maybeSurprise();
      var nb = $("#nextBtn"); nb.classList.remove("hidden");
      nb.onclick = function () { session.ti++; renderTask(); };
    } else {
      btn.classList.remove("warm", "hot");
      btn.classList.add(dist === 1 ? "hot" : "warm");
      fb.className = "feedback show";
      fb.textContent = dist === 1 ? t("sigHot") : dist === 2 ? t("sigWarm") : t("sigCold");
      beep(1 / (dist + 1));
    }
  }
  function beep(strength) {
    if (!state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.type = "square";
      o.frequency.value = 240 + strength * 520;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.08 + strength * 0.1, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
      o.start(); o.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  }

  /* ---------- Antwort auswerten ---------- */
  function answer(optIndex) {
    var sec = session.story.sections[session.si];
    var task = sec.tasks[session.ti];
    var buttons = document.querySelectorAll(".mc");
    for (var i = 0; i < buttons.length; i++) buttons[i].disabled = true;

    // "predict" hat answer:-1 => jede Antwort ist gültig (Vermutung zählt immer)
    var isOpen = task.answer < 0;
    var correct = isOpen || optIndex === task.answer;
    session.answered++;
    var cat = taskCategory(task.type);
    if (state.stats.byType && state.stats.byType[cat]) { state.stats.byType[cat].n++; if (correct) state.stats.byType[cat].c++; }

    var fb = $("#fb");
    if (correct) {
      buttons[optIndex].classList.add("correct");
      session.correct++;
      session.coins += COINS_CORRECT;
      session.adapt = Math.min(2, session.adapt + 1);   // adaptiv: schwerer
      state.mission.correct++;
      var praise = isOpen ? t("yourGuess") : t("correct")[Math.floor(Math.random()*t("correct").length)];
      fb.className = "feedback ok show"; fb.textContent = praise;
      ding(true);
      maybeSurprise();
    } else {
      buttons[optIndex].classList.add("wrong");
      if (buttons[task.answer]) buttons[task.answer].classList.add("correct");
      session.adapt = Math.max(-2, session.adapt - 1);  // adaptiv: leichter + Hilfe
      fb.className = "feedback no show";
      fb.innerHTML = t("wrong") + (task.hint ? "<br>\uD83D\uDCA1 " + loc(task.hint) : "") + "<br>" + t("showAnswer");
      ding(false);
    }
    // Sachwissen-Einschub
    if (task.fact) fb.innerHTML += '<br><span class="muted">\u2728 ' + t("didYouKnow") + " " + loc(task.fact) + '</span>';

    var nb = $("#nextBtn"); nb.classList.remove("hidden");
    nb.onclick = function () { session.ti++; renderTask(); };
    updateHudLive();
  }

  // kleine, sparsame Ueberraschung (max 1 pro Session)
  function maybeSurprise() {
    if (session.surpriseUsed) return;
    if (Math.random() < 0.18) {
      session.surpriseUsed = true;
      session.stars += 1; session.coins += 10;
      toast(t("surprise") + " " + t("bonusStar"));
      confetti();
    }
  }

  function nextSection() {
    // Abschnitt geschafft -> Belohnung
    session.coins += COINS_SECTION;
    session.words += countWords(loc(session.story.sections[session.si].text));
    state.mission.read = true;
    session.si++;
    if (session.si >= session.story.sections.length) { finishSession(); return; }
    session.ti = 0; session.phase = "read";
    renderSection();
  }

  /* ---------- Session-Abschluss ---------- */
  function finishSession() {
    stopTimer();
    // Sterne aus Trefferquote (0–3) + evtl. Bonus
    var rate = session.answered ? session.correct / session.answered : 0;
    var earnedStars = rate >= 0.9 ? 3 : rate >= 0.6 ? 2 : 1;
    earnedStars += session.stars; // Bonussterne aus Ueberraschung

    // Spielstand aktualisieren
    var firstTime = !state.finished[session.story.id];
    state.finished[session.story.id] = true;
    addCoins(session.coins);
    state.stats.sessions++; state.stats.correct += session.correct;
    state.stats.answered += session.answered; state.stats.words += session.words;
    state.stats.seconds = (state.stats.seconds || 0) + (session.elapsed || 0);
    if (!state.history) state.history = [];
    state.history.unshift({ date: todayKey(), world: session.world.id, title: loc(session.story.title),
      correct: session.correct, answered: session.answered, stars: earnedStars, seconds: session.elapsed, mode: session.mode });
    state.history = state.history.slice(0, 12);
    state.mission.finished = true;
    state.badges[session.world.id] = true;

    // Streak / Woche
    if (state.lastPlayed !== todayKey()) { state.streak++; }
    state.lastPlayed = todayKey();
    state.week.count++;

    var beforeLevel = state.level;
    var unlockedBefore = unlockedWorldIds();
    addStars(earnedStars);
    var leveledUp = state.level > beforeLevel;
    var newWorlds = unlockedWorldIds().filter(function (id) { return unlockedBefore.indexOf(id) < 0; });
    save();

    // Ergebnis-Screen
    var w = $("#screen-result");
    var starRow = ""; for (var i=1;i<=3;i++) starRow += i <= (rate>=0.9?3:rate>=0.6?2:1) ? "\u2b50" : "\u2606";
    var html = '<div class="center-col" style="text-align:center;padding-top:4vh">' +
      '<div style="font-size:4.5rem">' + session.world.emoji + '</div>' +
      '<h1>' + t("sessionDone") + '</h1>' +
      '<div class="stars">' + starRow + '</div>' +
      '<p class="muted">' + t("earned") + ':</p>' +
      '<div class="btn-row" style="justify-content:center">' +
        '<span class="chip gold">\u2b50 +' + earnedStars + '</span>' +
        '<span class="chip">\uD83E\uDE99 +' + session.coins + '</span>' +
        '<span class="chip">\u2705 ' + session.correct + '/' + session.answered + '</span>' +
      '</div>';
    if (firstTime) html += '<div class="collect-item" style="max-width:160px;margin:18px auto"><div class="emoji">' +
      BADGES[session.world.id].emoji + '</div><small>' + loc(BADGES[session.world.id]) + '</small></div>';
    if (leveledUp) html += '<p class="eyebrow pulse">\uD83C\uDF89 ' + t("newLevel") + ' \u2013 ' + t("level") + ' ' + state.level + '</p>';
    newWorlds.forEach(function (id) {
      var nw = findWorld(id);
      html += '<p class="eyebrow pulse">\uD83D\uDDFA\ufe0f ' + t("worldUnlocked") + ' ' + nw.emoji + ' ' + loc(nw.name) + '</p>';
    });
    html += '<div class="spacer"></div><button class="btn primary big" data-act="home">' + t("backMap") + '</button>';
    html += '<p class="muted" style="margin-top:14px">\uD83D\uDD25 ' + t("streak") + ': ' + state.streak + '</p>';
    html += '</div>';
    w.innerHTML = html;
    show("screen-result");
    confetti();
  }

  function unlockedWorldIds() {
    return CONTENT.worlds.filter(function (w) { return state.stars >= w.unlockStars; }).map(function (w) { return w.id; });
  }

  function updateHudLive() {
    // Live-Anzeige von gesammelten Münzen/Sternen in der Session (nicht persistent)
    var who = document.querySelector(".hud");
    if (!who) return; // HUD ist im Session-Screen nicht vorhanden – bewusst reduziert
  }

  /* ============================================================
     SHEETS: Einstellungen, Wortschatz, Sammlung, Eltern, Entdecken
     ============================================================ */
  var overlay = $("#overlay"), sheet = $("#sheet");
  function openSheet(html) { sheet.innerHTML = html; overlay.classList.add("show"); }
  function closeSheet() { overlay.classList.remove("show"); }

  function settingsSheet() {
    function seg(act, opts, cur) {
      return '<div class="seg">' + opts.map(function (o) {
        return '<button data-set="' + act + '" data-val="' + o.v + '" class="' + (cur===o.v?"on":"") + '">' + o.l + '</button>';
      }).join("") + '</div>';
    }
    var html = '<button class="btn ghost close" data-act="close">' + t("close") + '</button>' +
      '<h2>\u2699\ufe0f ' + t("settings") + '</h2>' +
      '<div class="row"><span>' + t("theme") + '</span>' + seg("theme", [{v:"light",l:t("light")},{v:"dark",l:t("dark")}], state.theme) + '</div>' +
      '<div class="row"><span>' + t("textSize") + '</span>' + seg("readScale", [{v:"small",l:t("small")},{v:"normal",l:t("normal")},{v:"large",l:t("large")}], state.readScale) + '</div>' +
      '<div class="row"><span>' + t("readFont") + '</span>' + seg("readFont", [{v:"standard",l:t("standard")},{v:"dyslexia",l:t("easyRead")},{v:"serif",l:"Serif"}], state.readFont) + '</div>' +
      '<div class="row"><span>' + t("sound") + '</span>' + seg("sound", [{v:"on",l:t("on")},{v:"off",l:t("off")}], state.sound?"on":"off") + '</div>' +
      '<div class="row"><span>' + t("language") + '</span>' + seg("lang", SUPPORTED_LANGS.map(function(l){return {v:l.code,l:l.flag+" "+l.name};}), state.lang) + '</div>' +
      '<div class="spacer"></div>' +
      '<button class="btn ghost" data-act="parent">\uD83D\uDC6A ' + t("parent") + '</button>';
    openSheet(html);
  }

  function parentSheet() {
    ensureStats();
    var st = state.stats;
    var acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
    var mins = Math.round((st.seconds || 0) / 60);
    var bt = st.byType;

    function skillBar(label, o) {
      var pct = o.n ? Math.round(o.c / o.n * 100) : 0;
      return '<div class="mission"><div style="flex:1">' +
        '<strong>' + label + '</strong> <span class="muted">' + (o.n ? pct + "% \u00b7 " + o.c + "/" + o.n : t("noData")) + '</span>' +
        '<div class="bar"><span style="width:' + pct + '%"></span></div></div></div>';
    }

    // Schwaechsten Bereich finden (nur mit genug Daten) -> konkrete Empfehlung
    var tip = t("focusGreat"), worst = null;
    [["comprehension", bt.comprehension, "focusReading"], ["spelling", bt.spelling, "focusSpelling"], ["vocab", bt.vocab, "focusVocab"]].forEach(function (c) {
      if (c[1].n >= 3) { var p = c[1].c / c[1].n; if (worst === null || p < worst.p) worst = { p: p, key: c[2] }; }
    });
    if (worst && worst.p < 0.8) tip = t(worst.key);

    var html = '<button class="btn ghost close" data-act="close">' + t("close") + '</button>' +
      '<h2>\uD83D\uDC6A ' + t("report") + '</h2><p class="muted">' + t("parentInfo") + '</p>' +
      '<div class="btn-row">' +
        '<span class="chip gold">\u2b50 ' + state.stars + '</span>' +
        '<span class="chip">\uD83E\uDE99 ' + state.coins + '</span>' +
        '<span class="chip">\uD83D\uDD25 ' + state.streak + '</span>' +
        '<span class="chip">' + t("level") + ' ' + state.level + '</span>' +
      '</div>' +
      '<div class="row"><span>' + t("sessions") + '</span><strong>' + st.sessions + '</strong></div>' +
      '<div class="row"><span>' + t("accuracy") + '</span><strong>' + acc + '%</strong></div>' +
      '<div class="row"><span>' + t("wordsRead") + '</span><strong>' + st.words + '</strong></div>' +
      '<div class="row"><span>' + t("readingTime") + '</span><strong>' + mins + ' ' + t("minShort") + '</strong></div>' +
      '<div class="spacer"></div><h3>' + t("bySkill") + '</h3>' +
      skillBar(t("comprehension"), bt.comprehension) +
      skillBar(t("spelling"), bt.spelling) +
      skillBar(t("vocabulary"), bt.vocab) +
      '<div class="mission done"><span class="big-ic">\uD83D\uDCA1</span><div style="flex:1"><strong>' + t("focusTip") + '</strong><br><span class="muted">' + tip + '</span></div></div>';

    html += '<div class="spacer"></div><h3>' + t("worldProgress") + '</h3>';
    CONTENT.worlds.forEach(function (wld) {
      var done = wld.stories.filter(function (s) { return state.finished[s.id]; }).length;
      var pct = Math.round(done / wld.stories.length * 100);
      html += '<div class="mission"><span class="big-ic">' + wld.emoji + '</span><div style="flex:1">' +
        '<strong>' + loc(wld.name) + '</strong> <span class="muted">' + done + '/' + wld.stories.length + '</span>' +
        '<div class="bar"><span style="width:' + pct + '%"></span></div></div></div>';
    });

    if (state.history && state.history.length) {
      html += '<div class="spacer"></div><h3>' + t("recent") + '</h3>';
      state.history.slice(0, 6).forEach(function (h) {
        html += '<div class="row"><span>' + h.title + ' <span class="muted">(' + h.date + ')</span></span>' +
          '<strong>\u2b50' + h.stars + ' \u00b7 ' + h.correct + '/' + h.answered + '</strong></div>';
      });
    }

    html += '<div class="spacer"></div>' +
      '<button class="btn ghost" data-act="reset" style="color:var(--c-red)">\uD83D\uDDD1\ufe0f ' + t("resetProfile") + '</button>';
    openSheet(html);
  }

  function collectionSheet() {
    var html = '<button class="btn ghost close" data-act="close">' + t("close") + '</button>' +
      '<h2>\uD83D\uDCD5 ' + t("collection") + '</h2>';
    var any = Object.keys(state.badges).length > 0;
    if (!any) html += '<p class="muted">' + t("collectionEmpty") + '</p>';
    html += '<div class="collection">';
    CONTENT.worlds.forEach(function (w) {
      var b = BADGES[w.id]; var got = state.badges[w.id];
      html += '<div class="collect-item' + (got ? "" : " locked") + '"><div class="emoji">' + b.emoji + '</div><small>' + loc(b) + '</small></div>';
    });
    html += '</div>';
    openSheet(html);
  }

  function discoverSheet() {
    var d = CONTENT.discover[Math.floor(Math.random() * CONTENT.discover.length)];
    openSheet('<button class="btn ghost close" data-act="close">' + t("close") + '</button>' +
      '<h2>\uD83D\uDD2D ' + t("discover") + '</h2><p class="muted">' + t("discoverDesc") + '</p>' +
      '<div class="read-card" style="text-align:center"><div style="font-size:4rem">' + d.emoji + '</div>' +
      '<p class="story-text">' + loc(d) + '</p></div>' +
      '<div class="spacer"></div><button class="btn primary big" data-act="discover">\uD83D\uDD04 ' + t("discover") + '</button>');
  }

  function vocabSheet(word, def) {
    openSheet('<button class="btn ghost close" data-act="close">' + t("close") + '</button>' +
      '<h2>\uD83D\uDCAC ' + t("vocabTitle") + '</h2>' +
      '<div class="read-card" style="text-align:center"><div style="font-size:2.4rem">\uD83D\uDCDD</div>' +
      '<h2>' + word + '</h2><p class="story-text">' + def + '</p>' +
      (session ? '<button class="btn ghost" data-act="speakword" data-w="' + encodeURIComponent(word) + '">\uD83D\uDD0A ' + t("readAloud") + '</button>' : '') +
      '</div><div class="spacer"></div><button class="btn primary big" data-act="close">' + t("gotIt") + '</button>');
  }

  /* ============================================================
     EFFEKTE: Ton (WebAudio), Vorlesen (SpeechSynthesis), Konfetti
     ============================================================ */
  var audioCtx = null;
  function ding(ok) {
    if (!state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.type = "sine";
      o.frequency.value = ok ? 660 : 200;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      o.start(); if (ok) { o.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); }
      o.stop(audioCtx.currentTime + 0.32);
    } catch (e) {}
  }
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = state.lang === "en" ? "en-GB" : "de-DE";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
  function confetti() {
    if (state.theme === undefined) return;
    var emojis = ["\u2b50","\uD83C\uDF89","\u2728","\uD83E\uDE99","\uD83C\uDF8A"];
    for (var i = 0; i < 16; i++) {
      (function (i) {
        var c = el("div", "confetti"); c.textContent = emojis[i % emojis.length];
        c.style.left = Math.random() * 100 + "vw";
        c.style.animationDelay = (Math.random() * 0.5) + "s";
        document.body.appendChild(c);
        setTimeout(function () { c.remove(); }, 2600);
      })(i);
    }
  }
  var toastTimer = null;
  function toast(msg) {
    var tEl = $("#toast"); tEl.textContent = msg; tEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { tEl.classList.remove("show"); }, 2600);
  }

  /* ============================================================
     EVENT-DELEGATION (ein Listener fuer Touch/Click)
     ============================================================ */
  document.addEventListener("click", function (e) {
    var tg = e.target.closest("[data-lang],[data-world],[data-locked],[data-story],[data-mode],[data-act],[data-opt],[data-spot],[data-set],[data-vocab]");
    if (!tg) return;

    // Sprachwahl
    if (tg.dataset.lang && !tg.dataset.set) {
      state.lang = tg.dataset.lang; save(); applyPrefs();
      renderHome(); show("screen-home"); return;
    }
    // Einstellungs-Schalter
    if (tg.dataset.set) {
      var k = tg.dataset.set, v = tg.dataset.val;
      if (k === "sound") state.sound = (v === "on");
      else if (k === "lang") state.lang = v;
      else state[k] = v;
      save(); applyPrefs(); settingsSheet();
      // Hintergrund-Screen aktualisieren
      if ($("#screen-home").classList.contains("active")) renderHome();
      return;
    }
    // Vokabel angeklickt
    if (tg.dataset.vocab) {
      vocabSheet(decodeURIComponent(tg.dataset.vocab), decodeURIComponent(tg.dataset.def));
      return;
    }
    // Welt / Geschichte / Modus
    if (tg.dataset.locked) { toast("\uD83D\uDD12 " + t("locked")); return; }
    if (tg.dataset.world && !tg.dataset.act) { renderWorld(tg.dataset.world); show("screen-world"); return; }
    if (tg.dataset.story) { closeSheet(); startSession(tg.dataset.story, "standard"); return; }
    // Antwort-Option
    if (tg.dataset.opt != null) { if (!tg.disabled) answer(parseInt(tg.dataset.opt, 10)); return; }
    // Metalldetektor-Stelle
    if (tg.dataset.spot != null) { if (!tg.disabled) detectorTap(parseInt(tg.dataset.spot, 10)); return; }

    // Aktionen
    var act = tg.dataset.act;
    switch (act) {
      case "settings": settingsSheet(); break;
      case "close": closeSheet(); break;
      case "parent": parentSheet(); break;
      case "collection": collectionSheet(); break;
      case "discover": discoverSheet(); break;
      case "home": closeSheet(); renderHome(); show("screen-home"); break;
      case "world": renderWorld(tg.dataset.world); show("screen-world"); break;
      case "toTasks":
        session.phase = "tasks"; session.ti = 0;
        if (!(session.story.sections[session.si].tasks || []).length) nextSection();
        else renderTask();
        break;
      case "speak": speak(sectionDisplayText(session.story.sections[session.si])); break;
      case "toggleEasy": {
        var s0 = session.story.sections[session.si];
        session.easyText = useEasy(s0) ? false : true;
        renderSection();
        break;
      }
      case "speakword": speak(decodeURIComponent(tg.dataset.w)); break;
      case "joker":
        if (session.jokers > 0) { session.jokers--; session.timeLeft += JOKER_SECONDS; updateTimer(); toast(t("jokerUsed"));
          if (session.phase === "read") renderSection(); else renderTask(); }
        else toast(t("noJoker"));
        break;
      case "quit": stopTimer(); if (window.speechSynthesis) window.speechSynthesis.cancel(); renderHome(); show("screen-home"); break;
      case "reset":
        if (confirm(t("resetConfirm"))) { var lang = state.lang; state = JSON.parse(JSON.stringify(DEFAULT_STATE)); state.lang = lang; save(); applyPrefs(); closeSheet(); renderHome(); show("screen-home"); }
        break;
    }
  });
  // Overlay-Hintergrund schliesst Sheet
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeSheet(); });

  /* ---------- Lookups ---------- */
  function findWorld(id) { return CONTENT.worlds.filter(function (w) { return w.id === id; })[0]; }
  function findStory(id) {
    for (var i = 0; i < CONTENT.worlds.length; i++) {
      var w = CONTENT.worlds[i];
      for (var j = 0; j < w.stories.length; j++) if (w.stories[j].id === id) return { world: w, story: w.stories[j] };
    }
    return null;
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    ensureStats();
    applyPrefs();
    if (state.lang) { renderHome(); show("screen-home"); }
    else { renderLanguage(); show("screen-language"); }
  }
  init();

  // Fuer Tests / Konsole zugaenglich machen
  window.LeseAbenteuer = { state: function () { return state; }, CONTENT: CONTENT, estimateStoryMinutes: estimateStoryMinutes, sectionSeconds: sectionSeconds };
})();
