/* ============================================================
   LeseAbenteuer – Inhalte & Internationalisierung
   ------------------------------------------------------------
   Alles Inhaltliche liegt hier, getrennt von der Logik (app.js).

   I18N: UI[lang] = Oberflaechen-Texte.
   CONTENT: Welten -> Geschichten -> Abschnitte -> Aufgaben.
   Mehrsprachig: { de:..., en:... }; fehlt eine Sprache, faellt
   loc() automatisch auf Deutsch zurueck.

   ADAPTIVE TEXTVARIANTEN:
     Jeder Abschnitt kann ein "easy" (kuerzer, einfacher) Feld haben.
     Bei Schwierigkeiten zeigt die App automatisch die leichte
     Variante; das Kind kann auch manuell umschalten.

   AUFGABENTYPEN (alle als Multiple-Choice mit 4–6 Optionen):
     quiz, predict, vocab, missing, syllable, wordimage,
     sentence, spellfix, retell, detector (Metalldetektor-Suche).
   Aufgabe: { type, q, options[], answer, hint?, fact?, word? }

   WIEDERKEHRENDE FIGUREN (dosiert eingewoben):
     Mira, Coco, Lina, Noa, Karim (Held:innen je Welt) +
     Freunde: Gusti, Dana, Hannah, Luki, Marie, Anton, Vincent, Lotti
     Wali – der Kuschelwal · Metalldetektor „Pieper“
   ============================================================ */

const SUPPORTED_LANGS = [
  { code: "de", flag: "\uD83C\uDDE9\uD83C\uDDEA", name: "Deutsch" },
  { code: "en", flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "English" },
];

/* ---------- UI-Texte (vollstaendig internationalisiert) ---------- */
const UI = {
  de: {
    appName: "LeseAbenteuer", tagline: "Lesen, verstehen, gewinnen!",
    chooseLang: "Welche Sprache m\u00f6chtest du?", start: "Los geht\u0027s!",
    hello: "Hallo", level: "Level", map: "Abenteuerkarte",
    chooseWorld: "W\u00e4hle deine Welt", locked: "Noch gesperrt",
    unlockAt: "Frei ab {n} \u2b50", stories: "Geschichten",
    chooseStory: "W\u00e4hle eine Geschichte", minutes: "Min", readTime: "Lesezeit",
    pickMode: "Wie m\u00f6chtest du spielen?", helper: "Helfer-Modus",
    helperDesc: "Mehr Zeit, mehr Hilfen, Vorlesen erlaubt.",
    challenge: "Challenge-Modus", challengeDesc: "Weniger Zeit, mehr Bonus-Sterne!",
    begin: "Geschichte starten", next: "Weiter", check: "Pr\u00fcfen",
    timeJoker: "Zeitjoker", jokerLeft: "{n} \u00fcbrig", jokerUsed: "+30 Sekunden! \u23f1\ufe0f",
    noJoker: "Keine Zeitjoker mehr \u2013 du schaffst das!",
    readAloud: "Vorlesen", easierText: "Leichter lesen", normalText: "Normaler Text",
    easyOn: "\uD83E\uDEB6 Leichtere Version", timeUp: "Zeit fast um! Lies noch den Rest und tippe weiter.",
    correct: ["Super gemacht! \uD83C\uDF1F", "Genau richtig! \uD83D\uDE80", "Klasse gelesen! \uD83C\uDF89", "Stark! \u2b50"],
    wrong: "Fast! Schau noch mal genau hin.", showAnswer: "Die richtige Antwort ist markiert.",
    sessionDone: "Abenteuer geschafft!", earned: "Das hast du verdient",
    coins: "M\u00fcnzen", stars: "Sterne", streak: "Tage-Serie", backMap: "Zur\u00fcck zur Karte",
    againSoon: "Komm morgen wieder f\u00fcr deine Serie!", settings: "Einstellungen",
    theme: "Anzeige", light: "Hell", dark: "Dunkel", textSize: "Schriftgr\u00f6\u00dfe",
    small: "Klein", normal: "Normal", large: "Gro\u00df", readFont: "Leseschrift",
    standard: "Standard", easyRead: "Leseleicht", sound: "Ton", on: "An", off: "Aus",
    language: "Sprache", parent: "Eltern-Bereich", parentInfo: "Fortschritt & Einstellungen f\u00fcr Begleitpersonen.",
    totalStars: "Sterne gesamt", totalCoins: "M\u00fcnzen gesamt", sessions: "Abenteuer gespielt",
    accuracy: "Richtige Antworten", wordsRead: "Gelesene W\u00f6rter", resetProfile: "Fortschritt zur\u00fccksetzen",
    resetConfirm: "Wirklich allen Fortschritt l\u00f6schen?", collection: "Schatzbuch",
    collectionEmpty: "Sammle Abenteuermarken, indem du Geschichten beendest!",
    missions: "Tagesmission", weekGoal: "Wochenziel", discover: "Entdecken",
    discoverDesc: "Echtes Wissen f\u00fcr clevere Entdecker", didYouKnow: "Wusstest du schon?",
    vocabTitle: "Wortschatz-K\u00e4rtchen", gotIt: "Verstanden!", close: "Schlie\u00dfen",
    surprise: "\u00dcberraschung!", bonusStar: "Bonus-Stern gefunden! \u2b50",
    newLevel: "Neues Level erreicht!", worldUnlocked: "Neue Welt freigeschaltet!",
    predictIntro: "Was glaubst du, passiert als N\u00e4chstes?",
    yourGuess: "Deine Vermutung z\u00e4hlt immer \u2013 lies weiter und finde es heraus!",
    missionRead: "Lies einen Abschnitt zu Ende", missionCorrect: "Beantworte 3 Fragen richtig",
    missionFinish: "Beende eine Geschichte", progress: "Dein Fortschritt", continue: "Weiterlesen",
    /* Metalldetektor */
    detectorSweep: "Such mit dem Metalldetektor! Tippe die Stellen an.",
    sigCold: "\uD83D\uDD07 Ganz leise \u2026 hier ist nichts.", sigWarm: "\uD83D\uDD09 Es piept leiser \u2013 w\u00e4rmer!",
    sigHot: "\uD83D\uDD0A Es piept lauter \u2013 hei\u00df!", sigFound: "\uD83D\uDD14 PIEP PIEP! Gefunden! \uD83C\uDF89",
    /* Eltern-Report */
    report: "Lern-Report", bySkill: "St\u00e4rken nach Bereich", comprehension: "Leseverst\u00e4ndnis",
    spelling: "Rechtschreibung", vocabulary: "Wortschatz", worldProgress: "Welten-Fortschritt",
    recent: "Letzte Abenteuer", readingTime: "Lesezeit gesamt", focusTip: "Empfehlung",
    minShort: "Min", noData: "Noch keine Daten \u2013 spielt erst ein Abenteuer!",
    focusReading: "\u00dcbt mehr Verstehens-Fragen \u2013 gemeinsam nacherz\u00e4hlen hilft.",
    focusSpelling: "\u00dcbt Rechtschreibung \u2013 W\u00f6rter in Silben klatschen hilft.",
    focusVocab: "Sprecht \u00fcber neue W\u00f6rter \u2013 die Wortschatz-K\u00e4rtchen nutzen.",
    focusGreat: "Tolle, ausgewogene Leistung \u2013 einfach dranbleiben!",
    abc: "A B C",
  },
  en: {
    appName: "ReadingQuest", tagline: "Read, understand, win!",
    chooseLang: "Which language would you like?", start: "Let\u0027s go!",
    hello: "Hi", level: "Level", map: "Adventure map",
    chooseWorld: "Choose your world", locked: "Still locked",
    unlockAt: "Unlocks at {n} \u2b50", stories: "Stories",
    chooseStory: "Choose a story", minutes: "min", readTime: "Reading time",
    pickMode: "How would you like to play?", helper: "Helper mode",
    helperDesc: "More time, more hints, read-aloud allowed.",
    challenge: "Challenge mode", challengeDesc: "Less time, more bonus stars!",
    begin: "Start story", next: "Next", check: "Check",
    timeJoker: "Time joker", jokerLeft: "{n} left", jokerUsed: "+30 seconds! \u23f1\ufe0f",
    noJoker: "No time jokers left \u2013 you can do it!",
    readAloud: "Read aloud", easierText: "Easier text", normalText: "Normal text",
    easyOn: "\uD83E\uDEB6 Easier version", timeUp: "Almost out of time! Finish reading and tap on.",
    correct: ["Great job! \uD83C\uDF1F", "Exactly right! \uD83D\uDE80", "Nicely read! \uD83C\uDF89", "Strong! \u2b50"],
    wrong: "Almost! Take another close look.", showAnswer: "The correct answer is highlighted.",
    sessionDone: "Adventure complete!", earned: "You earned this",
    coins: "Coins", stars: "Stars", streak: "Day streak", backMap: "Back to map",
    againSoon: "Come back tomorrow for your streak!", settings: "Settings",
    theme: "Display", light: "Light", dark: "Dark", textSize: "Text size",
    small: "Small", normal: "Normal", large: "Large", readFont: "Reading font",
    standard: "Standard", easyRead: "Easy-read", sound: "Sound", on: "On", off: "Off",
    language: "Language", parent: "Parent area", parentInfo: "Progress & settings for grown-ups.",
    totalStars: "Total stars", totalCoins: "Total coins", sessions: "Adventures played",
    accuracy: "Correct answers", wordsRead: "Words read", resetProfile: "Reset progress",
    resetConfirm: "Really delete all progress?", collection: "Treasure book",
    collectionEmpty: "Collect adventure badges by finishing stories!",
    missions: "Daily mission", weekGoal: "Weekly goal", discover: "Discover",
    discoverDesc: "Real knowledge for clever explorers", didYouKnow: "Did you know?",
    vocabTitle: "Vocabulary cards", gotIt: "Got it!", close: "Close",
    surprise: "Surprise!", bonusStar: "Found a bonus star! \u2b50",
    newLevel: "New level reached!", worldUnlocked: "New world unlocked!",
    predictIntro: "What do you think happens next?",
    yourGuess: "Your guess always counts \u2013 read on to find out!",
    missionRead: "Finish reading one section", missionCorrect: "Answer 3 questions correctly",
    missionFinish: "Finish one story", progress: "Your progress", continue: "Keep reading",
    detectorSweep: "Search with the metal detector! Tap the spots.",
    sigCold: "\uD83D\uDD07 Very quiet \u2026 nothing here.", sigWarm: "\uD83D\uDD09 Beeping softly \u2013 warmer!",
    sigHot: "\uD83D\uDD0A Beeping louder \u2013 hot!", sigFound: "\uD83D\uDD14 BEEP BEEP! Found it! \uD83C\uDF89",
    report: "Learning report", bySkill: "Strengths by area", comprehension: "Comprehension",
    spelling: "Spelling", vocabulary: "Vocabulary", worldProgress: "World progress",
    recent: "Recent adventures", readingTime: "Total reading time", focusTip: "Recommendation",
    minShort: "min", noData: "No data yet \u2013 play an adventure first!",
    focusReading: "Practise more comprehension \u2013 retelling together helps.",
    focusSpelling: "Practise spelling \u2013 clapping words into syllables helps.",
    focusVocab: "Talk about new words \u2013 use the vocabulary cards.",
    focusGreat: "Great, balanced performance \u2013 keep it up!",
    abc: "A B C",
  },
};

/* ---------- Sammelobjekte (Abenteuermarken) ---------- */
const BADGES = {
  island: { emoji: "\uD83C\uDFF4\u200D\u2620\ufe0f", de: "Schatzkarte", en: "Treasure map" },
  jungle: { emoji: "\uD83D\uDC12", de: "Dschungel-Orden", en: "Jungle medal" },
  space:  { emoji: "\uD83D\uDE80", de: "Sternenpilot", en: "Star pilot" },
  ocean:  { emoji: "\uD83D\uDC0B", de: "Wal-Freund", en: "Whale friend" },
  desert: { emoji: "\uD83D\uDC2A", de: "W\u00fcstenstern", en: "Desert star" },
};

/* ============================================================
   WELTEN & GESCHICHTEN  (level 1–3 steuert die Lesezeit)
   ============================================================ */
const CONTENT = {
  worlds: [
    /* ============== WELT 1: SCHATZINSEL ============== */
    {
      id: "island", emoji: "\uD83C\uDFDD\ufe0f", color: "#3aa0ff",
      name: { de: "Schatzinsel", en: "Treasure Island" },
      desc: { de: "Piraten, Karten und versteckte Geheimnisse.", en: "Pirates, maps and hidden secrets." },
      unlockStars: 0,
      stories: [
        {
          id: "island-1", level: 1,
          title: { de: "Die Flaschenpost", en: "The Message in a Bottle" },
          intro: { de: "Mira und ihr Kuschelwal Wali finden eine alte Flasche.", en: "Mira and her plush whale Wali find an old bottle." },
          sections: [
            {
              text: { de: "Mira l\u00e4uft am Strand entlang. Unter dem Arm tr\u00e4gt sie Wali, ihren weichen Kuschelwal. Pl\u00f6tzlich glitzert etwas im Sand. Es ist eine alte Flasche. In der Flasche steckt ein Zettel. Mira zieht ihn vorsichtig heraus.",
                       en: "Mira walks along the beach. Under her arm she carries Wali, her soft plush whale. Suddenly something glitters in the sand. It is an old bottle. Inside there is a note. Mira carefully pulls it out." },
              easy: { de: "Mira geht am Strand. Sie tr\u00e4gt ihren Kuschelwal Wali. Im Sand glitzert eine Flasche. In der Flasche ist ein Zettel.",
                      en: "Mira walks on the beach. She carries her plush whale Wali. A bottle glitters in the sand. Inside is a note." },
              tasks: [
                { type: "quiz", q: { de: "Was findet Mira im Sand?", en: "What does Mira find in the sand?" },
                  options: { de: ["Eine alte Flasche", "Einen Fisch", "Eine Muschel", "Einen Ball"], en: ["An old bottle", "A fish", "A shell", "A ball"] }, answer: 0 },
                { type: "vocab", word: { de: "Flaschenpost", en: "message in a bottle" },
                  q: { de: "Was ist eine Flaschenpost?", en: "What is a message in a bottle?" },
                  options: { de: ["Eine Nachricht in einer Flasche", "Ein Getr\u00e4nk", "Ein Brief vom Brieftr\u00e4ger", "Ein Spielzeug"], en: ["A note inside a bottle", "A drink", "A letter from the mailman", "A toy"] }, answer: 0,
                  fact: { de: "Fr\u00fcher schickten Seeleute echte Flaschenpost \u00fcbers Meer!", en: "Long ago sailors really sent messages in bottles across the sea!" } }
              ]
            },
            {
              text: { de: "Auf dem Zettel ist eine Karte gemalt. Ein roter Pfeil zeigt zu einem gro\u00dfen Felsen. Daneben steht: \u201eGeh zwanzig Schritte nach Osten.\u201c Mira l\u00e4chelt und dr\u00fcckt Wali fest. Das ist der Beginn einer Schatzsuche.",
                       en: "On the note a map is drawn. A red arrow points to a big rock. Next to it it says: \u0027Walk twenty steps east.\u0027 Mira smiles and hugs Wali tight. This is the start of a treasure hunt." },
              easy: { de: "Auf dem Zettel ist eine Karte. Ein Pfeil zeigt zu einem Felsen. Mira soll zwanzig Schritte gehen. Es ist eine Schatzsuche!",
                      en: "The note has a map. An arrow points to a rock. Mira must walk twenty steps. It is a treasure hunt!" },
              tasks: [
                { type: "predict", q: { de: "Was glaubst du, findet Mira beim Felsen?", en: "What do you think Mira finds at the rock?" },
                  options: { de: ["Vielleicht eine Truhe", "Bestimmt einen Schatz", "Eine weitere Spur", "Einen schlafenden Papagei"], en: ["Maybe a chest", "Surely a treasure", "Another clue", "A sleeping parrot"] }, answer: -1 },
                { type: "missing", q: { de: "Welcher Buchstabe fehlt? K_RTE", en: "Which letter is missing? M_P" },
                  options: { de: ["A", "E", "O", "U"], en: ["A", "E", "O", "U"] }, answer: 0,
                  hint: { de: "Sprich das Wort langsam: Kaaarte.", en: "Say the word slowly: maaap." } }
              ]
            },
            {
              text: { de: "Mira z\u00e4hlt ihre Schritte: eins, zwei, drei \u2026 zwanzig! Vor ihr liegt eine kleine H\u00f6hle. Tief drinnen funkelt etwas. Es ist eine Holztruhe mit goldenen M\u00fcnzen. Mira hat den Schatz gefunden! Wali h\u00e4tte vor Freude gequietscht.",
                       en: "Mira counts her steps: one, two, three \u2026 twenty! In front of her is a small cave. Deep inside something sparkles. It is a wooden chest with golden coins. Mira has found the treasure! Wali would have squeaked with joy." },
              easy: { de: "Mira z\u00e4hlt zwanzig Schritte. Da ist eine H\u00f6hle. Drinnen funkelt eine Truhe mit Gold. Mira hat den Schatz gefunden!",
                      en: "Mira counts twenty steps. There is a cave. Inside a chest with gold sparkles. Mira found the treasure!" },
              tasks: [
                { type: "quiz", q: { de: "Wo ist der Schatz versteckt?", en: "Where is the treasure hidden?" },
                  options: { de: ["In einer H\u00f6hle", "Im Wasser", "Auf einem Baum", "Im Boot"], en: ["In a cave", "In the water", "On a tree", "In the boat"] }, answer: 0 },
                { type: "sentence", q: { de: "Bring den Satz in die richtige Reihenfolge.", en: "Put the sentence in the right order." },
                  options: { de: ["Mira hat den Schatz gefunden.", "Schatz Mira gefunden den hat.", "Den Mira Schatz hat gefunden.", "Gefunden Schatz hat Mira den."], en: ["Mira has found the treasure.", "Treasure Mira found the has.", "The Mira treasure has found.", "Found treasure has Mira the."] }, answer: 0 }
              ]
            }
          ]
        },
        {
          id: "island-2", level: 2,
          title: { de: "Kapit\u00e4n Knopfs Geheimnis", en: "Captain Button\u0027s Secret" },
          intro: { de: "Ein alter Kapit\u00e4n braucht Miras Hilfe.", en: "An old captain needs Mira\u0027s help." },
          sections: [
            {
              text: { de: "Am Hafen sitzt Kapit\u00e4n Knopf auf einer Kiste. Sein Bart ist grau wie Nebel. \u201eMein Schiff ist verschwunden\u201c, seufzt er. \u201eIch brauche jemanden, der mutig ist und gut lesen kann.\u201c Mira nickt sofort.",
                       en: "At the harbour Captain Button sits on a crate. His beard is grey like fog. \u0027My ship has vanished,\u0027 he sighs. \u0027I need someone brave who can read well.\u0027 Mira nods at once." },
              easy: { de: "Kapit\u00e4n Knopf ist traurig. Sein Schiff ist weg. Er braucht Hilfe. Mira will ihm helfen.",
                      en: "Captain Button is sad. His ship is gone. He needs help. Mira wants to help him." },
              tasks: [
                { type: "quiz", q: { de: "Warum ist der Kapit\u00e4n traurig?", en: "Why is the captain sad?" },
                  options: { de: ["Sein Schiff ist weg", "Er hat Hunger", "Es regnet", "Er ist m\u00fcde"], en: ["His ship is gone", "He is hungry", "It is raining", "He is tired"] }, answer: 0 },
                { type: "wordimage", q: { de: "Welches Bild passt zu \u201eSchiff\u201c?", en: "Which picture matches \u0027ship\u0027?" },
                  options: { de: ["\u26f5", "\uD83D\uDE97", "\uD83C\uDFE0", "\uD83C\uDF33"], en: ["\u26f5", "\uD83D\uDE97", "\uD83C\uDFE0", "\uD83C\uDF33"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Der Kapit\u00e4n gibt Mira einen alten Brief. Viele W\u00f6rter sind verwischt. \u201eLies langsam\u201c, sagt er. Im Brief steht, dass das Schiff hinter der Nebelbucht liegt. Dort ist das Wasser ganz ruhig.",
                       en: "The captain gives Mira an old letter. Many words are smudged. \u0027Read slowly,\u0027 he says. The letter says the ship lies behind Foggy Bay. There the water is very calm." },
              easy: { de: "Der Kapit\u00e4n gibt Mira einen Brief. Mira liest langsam. Das Schiff liegt in der Nebelbucht.",
                      en: "The captain gives Mira a letter. Mira reads slowly. The ship is in Foggy Bay." },
              tasks: [
                { type: "syllable", q: { de: "Setze die Silben richtig zusammen.", en: "Put the syllables together correctly." },
                  options: { de: ["Ne-bel-bucht", "Bucht-ne-bel", "Bel-ne-bucht", "Ne-bucht-bel"], en: ["Fog-gy-bay", "Bay-fog-gy", "Gy-fog-bay", "Fog-bay-gy"] }, answer: 0 },
                { type: "spellfix", q: { de: "Welches Wort ist falsch geschrieben?", en: "Which word is spelled wrong?" },
                  options: { de: ["Schif", "Wasser", "Brief", "Bucht"], en: ["Shipp", "Water", "Letter", "Bay"] }, answer: 0,
                  hint: { de: "Schiff schreibt man mit zwei f.", en: "Ship has just one p." } }
              ]
            },
            {
              text: { de: "Mira rudert zur Nebelbucht. Langsam teilt sich der Nebel. Da ist das Schiff! Es h\u00e4ngt an einem Felsen fest. Mira zieht am Seil, und das Schiff wird frei. Kapit\u00e4n Knopf jubelt vor Freude.",
                       en: "Mira rows to Foggy Bay. Slowly the fog parts. There is the ship! It is stuck on a rock. Mira pulls the rope and the ship comes free. Captain Button cheers with joy." },
              tasks: [
                { type: "quiz", q: { de: "Wie befreit Mira das Schiff?", en: "How does Mira free the ship?" },
                  options: { de: ["Sie zieht am Seil", "Sie ruft laut", "Sie wartet", "Sie springt ins Wasser"], en: ["She pulls the rope", "She shouts loudly", "She waits", "She jumps in the water"] }, answer: 0 },
                { type: "retell", q: { de: "Wie endet die Geschichte?", en: "How does the story end?" },
                  options: { de: ["Der Kapit\u00e4n freut sich", "Mira geht schlafen", "Das Schiff sinkt", "Es f\u00e4ngt an zu schneien"], en: ["The captain is happy", "Mira goes to sleep", "The ship sinks", "It starts to snow"] }, answer: 0 }
              ]
            }
          ]
        },
        {
          id: "island-3", level: 2,
          title: { de: "Anton und der Metalldetektor", en: "Anton and the Metal Detector" },
          intro: { de: "Antons Detektor \u201ePieper\u201c piept \u00fcber etwas Verborgenem.", en: "Anton\u0027s detector \u0027Pieper\u0027 beeps over something hidden." },
          sections: [
            {
              text: { de: "Antons neuer Metalldetektor hei\u00dft Pieper. Er piept, wenn Metall im Sand liegt. \u201eKomm, Mira!\u201c ruft Anton. Gemeinsam laufen sie \u00fcber den Strand. Wali, der Kuschelwal, wackelt in Miras Rucksack mit. Pl\u00f6tzlich piept Pieper ganz aufgeregt.",
                       en: "Anton\u0027s new metal detector is called Pieper. It beeps when metal lies in the sand. \u0027Come, Mira!\u0027 calls Anton. Together they run across the beach. Wali the plush whale bounces in Mira\u0027s backpack. Suddenly Pieper beeps excitedly." },
              easy: { de: "Anton hat einen Metalldetektor. Er hei\u00dft Pieper. Pieper piept bei Metall. Mira und Wali sind dabei.",
                      en: "Anton has a metal detector. It is called Pieper. Pieper beeps at metal. Mira and Wali come along." },
              tasks: [
                { type: "vocab", word: { de: "Metalldetektor", en: "metal detector" },
                  q: { de: "Was macht ein Metalldetektor?", en: "What does a metal detector do?" },
                  options: { de: ["Er piept bei Metall im Boden", "Er macht Musik", "Er kocht Essen", "Er f\u00e4hrt Auto"], en: ["It beeps at metal in the ground", "It plays music", "It cooks food", "It drives a car"] }, answer: 0,
                  fact: { de: "Echte Metalldetektoren finden M\u00fcnzen, N\u00e4gel und sogar alte Schwerter!", en: "Real metal detectors find coins, nails and even old swords!" } },
                { type: "missing", q: { de: "Welcher Buchstabe fehlt? ME_ALL", en: "Which letter is missing? ME_AL" },
                  options: { de: ["T", "D", "K", "P"], en: ["T", "D", "K", "P"] }, answer: 0 }
              ]
            },
            {
              text: { de: "\u201eHier piept es am lautesten!\u201c, sagt Anton. Aber wo genau liegt der Schatz? Pieper piept mal leise, mal laut. Such die richtige Stelle: Je lauter es piept, desto n\u00e4her bist du dran.",
                       en: "\u0027It beeps loudest here!\u0027 says Anton. But where exactly is the treasure? Pieper beeps soft, then loud. Find the right spot: the louder it beeps, the closer you are." },
              tasks: [
                { type: "detector", q: { de: "Wo piept Pieper am lautesten? Tippe und suche!", en: "Where does Pieper beep loudest? Tap and search!" },
                  options: { de: ["\uD83C\uDF34 Palme", "\uD83E\uDEA8 Stein", "\uD83D\uDD7d Sandburg", "\u2693 Anker", "\uD83D\uDC1A Muschel"], en: ["\uD83C\uDF34 Palm", "\uD83E\uDEA8 Rock", "\uD83D\uDD7d Sandcastle", "\u2693 Anchor", "\uD83D\uDC1A Shell"] }, answer: 3,
                  fact: { de: "Unter dem alten Anker lag eine Schatzkiste aus Messing!", en: "Under the old anchor lay a brass treasure box!" } }
              ]
            },
            {
              text: { de: "In der Kiste liegen alte M\u00fcnzen und ein kleiner Kompass. Anton strahlt. \u201eDen Kompass schenke ich dir, Mira!\u201c Mira freut sich riesig. Mit einem Kompass findet man immer den Weg nach Hause.",
                       en: "In the box are old coins and a small compass. Anton beams. \u0027The compass is a gift for you, Mira!\u0027 Mira is overjoyed. With a compass you can always find the way home." },
              easy: { de: "In der Kiste sind M\u00fcnzen und ein Kompass. Anton schenkt Mira den Kompass. Mira freut sich.",
                      en: "In the box are coins and a compass. Anton gives Mira the compass. Mira is happy." },
              tasks: [
                { type: "quiz", q: { de: "Wof\u00fcr braucht man einen Kompass?", en: "What is a compass for?" },
                  options: { de: ["Um den Weg zu finden", "Um zu kochen", "Um zu schlafen", "Um zu malen"], en: ["To find the way", "To cook", "To sleep", "To draw"] }, answer: 0,
                  fact: { de: "Eine Kompassnadel zeigt immer nach Norden.", en: "A compass needle always points north." } },
                { type: "retell", q: { de: "Was fanden Anton und Mira?", en: "What did Anton and Mira find?" },
                  options: { de: ["Eine Kiste mit M\u00fcnzen und Kompass", "Ein Auto", "Einen Drachen", "Ein Eis"], en: ["A box with coins and a compass", "A car", "A kite", "An ice cream"] }, answer: 0 }
              ]
            }
          ]
        }
      ]
    },

    /* ============== WELT 2: DSCHUNGELPFAD ============== */
    {
      id: "jungle", emoji: "\uD83C\uDF34", color: "#36b37e",
      name: { de: "Dschungelpfad", en: "Jungle Trail" },
      desc: { de: "Tiere, Pflanzen und spannendes Naturwissen.", en: "Animals, plants and exciting nature facts." },
      unlockStars: 6,
      stories: [
        {
          id: "jungle-1", level: 2,
          title: { de: "Der freche Affe", en: "The Cheeky Monkey" },
          intro: { de: "Im Dschungel verschwindet eine Banane \u2013 wer war es?", en: "In the jungle a banana disappears \u2013 who did it?" },
          sections: [
            {
              text: { de: "Tief im Dschungel lebt der Affe Coco. Er liebt Bananen \u00fcber alles. Heute Morgen ist seine letzte Banane verschwunden. Coco sucht \u00fcberall. Wer war der Dieb?",
                       en: "Deep in the jungle lives Coco the monkey. He loves bananas more than anything. This morning his last banana has disappeared. Coco searches everywhere. Who was the thief?" },
              easy: { de: "Affe Coco liebt Bananen. Seine Banane ist weg. Coco sucht sie \u00fcberall.",
                      en: "Coco the monkey loves bananas. His banana is gone. Coco looks everywhere." },
              tasks: [
                { type: "quiz", q: { de: "Was ist verschwunden?", en: "What has disappeared?" },
                  options: { de: ["Cocos Banane", "Cocos Hut", "Ein Baum", "Der Fluss"], en: ["Coco\u0027s banana", "Coco\u0027s hat", "A tree", "The river"] }, answer: 0 },
                { type: "wordimage", q: { de: "Welches Bild zeigt einen Affen?", en: "Which picture shows a monkey?" },
                  options: { de: ["\uD83D\uDC12", "\uD83D\uDC18", "\uD83E\uDD9C", "\uD83D\uDC0D"], en: ["\uD83D\uDC12", "\uD83D\uDC18", "\uD83E\uDD9C", "\uD83D\uDC0D"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Coco folgt einer Spur aus Schalen. Sie f\u00fchrt zu einem Papagei. Doch der Papagei sch\u00fcttelt den Kopf. \u201eIch war es nicht!\u201c, ruft er. \u201eSchau mal nach oben.\u201c Hoch im Baum sitzt ein kleines Faultier und kaut zufrieden.",
                       en: "Coco follows a trail of peels. It leads to a parrot. But the parrot shakes its head. \u0027It wasn\u0027t me!\u0027 it cries. \u0027Look up.\u0027 High in the tree sits a little sloth, chewing happily." },
              easy: { de: "Coco folgt den Schalen. Der Papagei war es nicht. Oben im Baum sitzt ein Faultier und kaut.",
                      en: "Coco follows the peels. The parrot did not do it. Up in the tree a sloth is chewing." },
              tasks: [
                { type: "predict", q: { de: "Wer hat wohl die Banane gegessen?", en: "Who probably ate the banana?" },
                  options: { de: ["Das Faultier", "Der Papagei", "Coco selbst", "Eine Schlange"], en: ["The sloth", "The parrot", "Coco himself", "A snake"] }, answer: -1 },
                { type: "missing", q: { de: "Welcher Buchstabe fehlt? BANA_E", en: "Which letter is missing? BANA_A" },
                  options: { de: ["N", "M", "L", "R"], en: ["N", "M", "L", "R"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Das Faultier l\u00e4chelt verlegen. \u201eTut mir leid, ich hatte so gro\u00dfen Hunger.\u201c Coco muss lachen. Gemeinsam pfl\u00fccken sie neue Bananen. Jetzt haben alle genug. So macht Teilen Spa\u00df.",
                       en: "The sloth smiles shyly. \u0027I\u0027m sorry, I was so hungry.\u0027 Coco has to laugh. Together they pick new bananas. Now everyone has enough. Sharing is fun like this." },
              tasks: [
                { type: "quiz", q: { de: "Was lernen die Tiere am Ende?", en: "What do the animals learn in the end?" },
                  options: { de: ["Teilen macht Spa\u00df", "Bananen sind gef\u00e4hrlich", "Man soll streiten", "Schlafen ist wichtig"], en: ["Sharing is fun", "Bananas are dangerous", "You should argue", "Sleeping is important"] }, answer: 0 },
                { type: "spellfix", q: { de: "Welches Wort ist falsch geschrieben?", en: "Which word is spelled wrong?" },
                  options: { de: ["Dschungl", "Affe", "Baum", "Spur"], en: ["Jungel", "Monkey", "Tree", "Trail"] }, answer: 0,
                  hint: { de: "Dschungel hat ein e: Dschun-gel.", en: "Jungle ends with -gle." } }
              ]
            }
          ]
        },
        {
          id: "jungle-2", level: 2,
          title: { de: "Maries Schmetterlingsgarten", en: "Marie\u0027s Butterfly Garden" },
          intro: { de: "Marie entdeckt, wie aus Raupen Schmetterlinge werden.", en: "Marie discovers how caterpillars become butterflies." },
          sections: [
            {
              text: { de: "Marie liebt es, im Garten am Dschungelrand zu sitzen. Auf einem Blatt entdeckt sie eine kleine, gr\u00fcne Raupe. Die Raupe frisst und frisst. \u201eDu hast aber Hunger\u201c, lacht Marie. Bald wird die Raupe etwas Wunderbares.",
                       en: "Marie loves sitting in the garden at the jungle\u0027s edge. On a leaf she spots a small green caterpillar. The caterpillar eats and eats. \u0027You really are hungry,\u0027 Marie laughs. Soon the caterpillar will become something wonderful." },
              easy: { de: "Marie sitzt im Garten. Auf einem Blatt ist eine gr\u00fcne Raupe. Die Raupe frisst viel.",
                      en: "Marie sits in the garden. On a leaf is a green caterpillar. The caterpillar eats a lot." },
              tasks: [
                { type: "vocab", word: { de: "Raupe", en: "caterpillar" },
                  q: { de: "Was ist eine Raupe?", en: "What is a caterpillar?" },
                  options: { de: ["Ein junges Tier, das ein Schmetterling wird", "Ein Vogel", "Ein Stein", "Eine Blume"], en: ["A young animal that becomes a butterfly", "A bird", "A stone", "A flower"] }, answer: 0,
                  fact: { de: "Eine Raupe kann an einem Tag mehr fressen, als sie selbst wiegt!", en: "A caterpillar can eat more than its own weight in a single day!" } },
                { type: "wordimage", q: { de: "Welches Bild zeigt einen Schmetterling?", en: "Which picture shows a butterfly?" },
                  options: { de: ["\uD83E\uDD8B", "\uD83D\uDC1B", "\uD83D\uDC1D", "\uD83D\uDC1E"], en: ["\uD83E\uDD8B", "\uD83D\uDC1B", "\uD83D\uDC1D", "\uD83D\uDC1E"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Die Raupe spinnt sich in eine feste H\u00fclle ein. Das nennt man Puppe. Marie wartet geduldig viele Tage. Dann passiert es: Die H\u00fclle \u00f6ffnet sich, und ein bunter Schmetterling kriecht heraus. Langsam trocknet er seine Fl\u00fcgel.",
                       en: "The caterpillar wraps itself in a firm shell. This is called a chrysalis. Marie waits patiently for many days. Then it happens: the shell opens and a colourful butterfly crawls out. Slowly it dries its wings." },
              easy: { de: "Die Raupe wird zur Puppe. Marie wartet viele Tage. Dann kommt ein bunter Schmetterling heraus.",
                      en: "The caterpillar becomes a chrysalis. Marie waits many days. Then a colourful butterfly comes out." },
              tasks: [
                { type: "syllable", q: { de: "Setze die Silben zusammen.", en: "Put the syllables together." },
                  options: { de: ["Schmet-ter-ling", "Ling-schmet-ter", "Ter-ling-schmet", "Schmet-ling-ter"], en: ["But-ter-fly", "Fly-but-ter", "Ter-fly-but", "But-fly-ter"] }, answer: 0 },
                { type: "retell", q: { de: "Wie wird ein Schmetterling gro\u00df? Was kommt zuerst?", en: "How does a butterfly grow? What comes first?" },
                  options: { de: ["Erst Raupe, dann Puppe, dann Schmetterling", "Erst Schmetterling, dann Raupe", "Erst Puppe, dann Raupe", "Nur Schmetterling"], en: ["First caterpillar, then chrysalis, then butterfly", "First butterfly, then caterpillar", "First chrysalis, then caterpillar", "Only butterfly"] }, answer: 0,
                  fact: { de: "Die Verwandlung von Raupe zu Schmetterling hei\u00dft Metamorphose.", en: "The change from caterpillar to butterfly is called metamorphosis." } }
              ]
            }
          ]
        },
        {
          id: "jungle-3", level: 3,
          title: { de: "Luki und das langsame Faultier", en: "Luki and the Slow Sloth" },
          intro: { de: "Luki lernt, warum Langsamsein clever sein kann.", en: "Luki learns why being slow can be clever." },
          sections: [
            {
              text: { de: "Luki wandert mit einem Fernglas durch den Dschungel. Er m\u00f6chte das langsamste Tier der Welt sehen: das Faultier. Endlich entdeckt er eines, das kopf\u00fcber an einem Ast h\u00e4ngt. Es bewegt sich so langsam, dass man kaum etwas merkt.",
                       en: "Luki hikes through the jungle with binoculars. He wants to see the slowest animal in the world: the sloth. At last he spots one hanging upside down from a branch. It moves so slowly you can barely tell." },
              easy: { de: "Luki sucht ein Faultier. Er hat ein Fernglas. Da h\u00e4ngt eins am Ast. Es ist sehr langsam.",
                      en: "Luki looks for a sloth. He has binoculars. There one hangs on a branch. It is very slow." },
              tasks: [
                { type: "quiz", q: { de: "Welches Tier sucht Luki?", en: "Which animal is Luki looking for?" },
                  options: { de: ["Das Faultier", "Einen L\u00f6wen", "Einen Hai", "Einen Adler"], en: ["The sloth", "A lion", "A shark", "An eagle"] }, answer: 0,
                  fact: { de: "Faultiere schlafen bis zu 15 Stunden am Tag!", en: "Sloths sleep up to 15 hours a day!" } },
                { type: "vocab", word: { de: "Fernglas", en: "binoculars" },
                  q: { de: "Wof\u00fcr braucht man ein Fernglas?", en: "What are binoculars for?" },
                  options: { de: ["Um weit entfernte Dinge gro\u00df zu sehen", "Um zu h\u00f6ren", "Um zu rennen", "Um zu essen"], en: ["To see faraway things up close", "To hear", "To run", "To eat"] }, answer: 0 }
              ]
            },
            {
              text: { de: "\u201eWarum bist du so langsam?\u201c fragt Luki leise. Das Faultier g\u00e4hnt. Weil es sich kaum bewegt, k\u00f6nnen Feinde es im Bl\u00e4tterdach kaum entdecken. So bleibt das Faultier sicher. Manchmal ist langsam eben schlau.",
                       en: "\u0027Why are you so slow?\u0027 Luki asks quietly. The sloth yawns. Because it hardly moves, enemies can barely spot it in the leaves. So the sloth stays safe. Sometimes slow is simply clever." },
              easy: { de: "Das Faultier ist langsam. So sehen Feinde es kaum. Langsam ist hier schlau.",
                      en: "The sloth is slow. So enemies hardly see it. Slow is clever here." },
              tasks: [
                { type: "quiz", q: { de: "Warum ist Langsamsein f\u00fcr das Faultier gut?", en: "Why is being slow good for the sloth?" },
                  options: { de: ["Feinde entdecken es kaum", "Es kann schneller rennen", "Es wird ber\u00fchmt", "Es kann fliegen"], en: ["Enemies barely spot it", "It can run faster", "It becomes famous", "It can fly"] }, answer: 0 },
                { type: "spellfix", q: { de: "Welches Wort ist falsch geschrieben?", en: "Which word is spelled wrong?" },
                  options: { de: ["Faultir", "Dschungel", "Langsam", "Sicher"], en: ["Slooth", "Jungle", "Slow", "Safe"] }, answer: 0,
                  hint: { de: "Faultier endet auf -tier, mit ie.", en: "Sloth has one o: s-l-o-t-h." } }
              ]
            }
          ]
        }
      ]
    },

    /* ============== WELT 3: WELTALL ============== */
    {
      id: "space", emoji: "\uD83D\uDE80", color: "#8b6cf0",
      name: { de: "Weltall", en: "Outer Space" },
      desc: { de: "Reise zu Planeten, Sternen und Kometen.", en: "Travel to planets, stars and comets." },
      unlockStars: 14,
      stories: [
        {
          id: "space-1", level: 2,
          title: { de: "Lina fliegt zum Mond", en: "Lina Flies to the Moon" },
          intro: { de: "Eine kleine Astronautin startet ins All.", en: "A little astronaut launches into space." },
          sections: [
            {
              text: { de: "Lina sitzt in ihrer Rakete. Der Countdown beginnt: drei, zwei, eins, Start! Mit einem lauten Rauschen hebt die Rakete ab. Bald sieht Lina die Erde als blaue Kugel unter sich.",
                       en: "Lina sits in her rocket. The countdown begins: three, two, one, lift-off! With a loud roar the rocket rises. Soon Lina sees the Earth as a blue ball below her." },
              easy: { de: "Lina sitzt in der Rakete. Drei, zwei, eins, Start! Die Rakete fliegt hoch. Die Erde ist blau.",
                      en: "Lina sits in the rocket. Three, two, one, go! The rocket flies up. The Earth is blue." },
              tasks: [
                { type: "quiz", q: { de: "Wie sieht die Erde aus dem All aus?", en: "What does Earth look like from space?" },
                  options: { de: ["Wie eine blaue Kugel", "Wie ein W\u00fcrfel", "Wie ein Stern", "Wie ein Dreieck"], en: ["Like a blue ball", "Like a cube", "Like a star", "Like a triangle"] }, answer: 0,
                  fact: { de: "Die Erde sieht blau aus, weil so viel Wasser auf ihr ist.", en: "Earth looks blue because it has so much water." } },
                { type: "syllable", q: { de: "Setze die Silben zusammen.", en: "Put the syllables together." },
                  options: { de: ["Ra-ke-te", "Te-ra-ke", "Ke-ra-te", "Ra-te-ke"], en: ["Rock-et", "Et-rock", "Ro-cket", "Ck-roet"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Im Weltall ist alles ganz leicht. Linas Stift schwebt durch die Luft. Sogar Lina selbst schwebt! Das nennt man Schwerelosigkeit. Lina lacht und macht einen Purzelbaum im Sitzen.",
                       en: "In space everything is very light. Lina\u0027s pen floats through the air. Even Lina herself floats! This is called weightlessness. Lina laughs and does a somersault while sitting." },
              easy: { de: "Im All ist alles leicht. Der Stift schwebt. Lina schwebt auch. Das macht Spa\u00df!",
                      en: "In space everything is light. The pen floats. Lina floats too. What fun!" },
              tasks: [
                { type: "vocab", word: { de: "Schwerelosigkeit", en: "weightlessness" },
                  q: { de: "Was bedeutet Schwerelosigkeit?", en: "What does weightlessness mean?" },
                  options: { de: ["Alles schwebt", "Alles ist schwer", "Es ist dunkel", "Es ist warm"], en: ["Everything floats", "Everything is heavy", "It is dark", "It is warm"] }, answer: 0 },
                { type: "missing", q: { de: "Welcher Buchstabe fehlt? M_ND", en: "Which letter is missing? M_ON" },
                  options: { de: ["O", "A", "I", "U"], en: ["O", "A", "I", "U"] }, answer: 0 }
              ]
            }
          ]
        },
        {
          id: "space-2", level: 2,
          title: { de: "Vincent und die Sternschnuppe", en: "Vincent and the Shooting Star" },
          intro: { de: "Vincent w\u00fcnscht sich etwas \u2013 und lernt, was eine Sternschnuppe wirklich ist.", en: "Vincent makes a wish \u2013 and learns what a shooting star really is." },
          sections: [
            {
              text: { de: "Nachts liegt Vincent mit Lina auf einer Decke und schaut zum Himmel. Pl\u00f6tzlich zieht ein heller Streifen \u00fcber die Sterne. \u201eEine Sternschnuppe!\u201c ruft Vincent. \u201eSchnell, w\u00fcnsch dir was!\u201c Beide schlie\u00dfen die Augen.",
                       en: "At night Vincent lies on a blanket with Lina, looking at the sky. Suddenly a bright streak shoots across the stars. \u0027A shooting star!\u0027 Vincent cries. \u0027Quick, make a wish!\u0027 They both close their eyes." },
              easy: { de: "Vincent und Lina schauen nachts zum Himmel. Da ist ein heller Streifen. \u201eEine Sternschnuppe!\u201c sagt Vincent.",
                      en: "Vincent and Lina watch the night sky. A bright streak appears. \u0027A shooting star!\u0027 says Vincent." },
              tasks: [
                { type: "predict", q: { de: "Was glaubst du, ist eine Sternschnuppe wirklich?", en: "What do you think a shooting star really is?" },
                  options: { de: ["Ein gl\u00fchendes Steinchen aus dem All", "Ein echter Stern, der f\u00e4llt", "Ein Flugzeug", "Eine Lampe"], en: ["A glowing little rock from space", "A real star falling", "An airplane", "A lamp"] }, answer: -1 },
                { type: "wordimage", q: { de: "Welches Bild passt zu \u201eStern\u201c?", en: "Which picture matches \u0027star\u0027?" },
                  options: { de: ["\u2b50", "\uD83C\uDF19", "\u2600\ufe0f", "\u2601\ufe0f"], en: ["\u2b50", "\uD83C\uDF19", "\u2600\ufe0f", "\u2601\ufe0f"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Lina erkl\u00e4rt: \u201eEine Sternschnuppe ist gar kein Stern. Es ist ein winziges Steinchen, das in die Luft der Erde rast und dabei hell aufgl\u00fcht.\u201c Vincent staunt. Wissen ist fast so sch\u00f6n wie ein Wunsch.",
                       en: "Lina explains: \u0027A shooting star is not a star at all. It is a tiny rock racing into the Earth\u0027s air, glowing brightly.\u0027 Vincent marvels. Knowing is almost as nice as a wish." },
              easy: { de: "Lina sagt: Eine Sternschnuppe ist ein kleines Steinchen. Es gl\u00fcht in der Luft. Vincent staunt.",
                      en: "Lina says: a shooting star is a tiny rock. It glows in the air. Vincent marvels." },
              tasks: [
                { type: "quiz", q: { de: "Was ist eine Sternschnuppe wirklich?", en: "What is a shooting star really?" },
                  options: { de: ["Ein gl\u00fchendes Steinchen aus dem All", "Ein gro\u00dfer Planet", "Ein Vogel", "Eine Wolke"], en: ["A glowing rock from space", "A big planet", "A bird", "A cloud"] }, answer: 0,
                  fact: { de: "Solche Steinchen sind oft nur so gro\u00df wie ein Sandkorn!", en: "Such little rocks are often only the size of a grain of sand!" } },
                { type: "spellfix", q: { de: "Welches Wort ist falsch geschrieben?", en: "Which word is spelled wrong?" },
                  options: { de: ["Stern-schnupe", "Himmel", "Nacht", "Wunsch"], en: ["Shuting star", "Sky", "Night", "Wish"] }, answer: 0,
                  hint: { de: "Schnuppe schreibt man mit zwei p.", en: "Shooting has two o\u0027s." } }
              ]
            }
          ]
        },
        {
          id: "space-3", level: 3,
          title: { de: "Der rote Planet", en: "The Red Planet" },
          intro: { de: "Lina und Vincent funken zu einem Roboter auf dem Mars.", en: "Lina and Vincent radio a robot on Mars." },
          sections: [
            {
              text: { de: "Auf dem Bildschirm leuchtet ein rostroter Planet: der Mars. Dort f\u00e4hrt ein kleiner Roboter \u00fcber den staubigen Boden. Lina funkt ihm ein Hallo. Der Roboter schickt ein Foto zur\u00fcck: rote Steine, so weit man sehen kann.",
                       en: "On the screen a rust-red planet glows: Mars. A small robot drives over the dusty ground there. Lina radios it a hello. The robot sends back a photo: red rocks as far as you can see." },
              easy: { de: "Auf dem Mars f\u00e4hrt ein Roboter. Der Mars ist rot. Lina funkt Hallo. Der Roboter schickt ein Foto.",
                      en: "A robot drives on Mars. Mars is red. Lina radios hello. The robot sends a photo." },
              tasks: [
                { type: "quiz", q: { de: "Welche Farbe hat der Mars?", en: "What colour is Mars?" },
                  options: { de: ["Rot", "Gr\u00fcn", "Blau", "Gelb"], en: ["Red", "Green", "Blue", "Yellow"] }, answer: 0,
                  fact: { de: "Der Mars hei\u00dft \u201eroter Planet\u201c, weil sein Boden rostigen Sand hat.", en: "Mars is called the \u0027red planet\u0027 because its soil has rusty sand." } },
                { type: "vocab", word: { de: "Roboter", en: "robot" },
                  q: { de: "Was ist ein Roboter?", en: "What is a robot?" },
                  options: { de: ["Eine Maschine, die Aufgaben erledigt", "Ein Tier", "Ein Stern", "Ein Baum"], en: ["A machine that does tasks", "An animal", "A star", "A tree"] }, answer: 0 }
              ]
            },
            {
              text: { de: "\u201eGibt es dort Wasser?\u201c fragt Vincent. Lina nickt: \u201eFr\u00fcher floss auf dem Mars Wasser. Heute ist es gefroren unter dem Boden.\u201c Vielleicht reisen Menschen eines Tages selbst dorthin. Lina und Vincent tr\u00e4umen schon davon.",
                       en: "\u0027Is there water there?\u0027 Vincent asks. Lina nods: \u0027Long ago water flowed on Mars. Today it is frozen under the ground.\u0027 Maybe people will travel there one day. Lina and Vincent are already dreaming of it." },
              easy: { de: "Vincent fragt nach Wasser. Lina sagt: Fr\u00fcher gab es Wasser auf dem Mars. Jetzt ist es gefroren.",
                      en: "Vincent asks about water. Lina says: long ago Mars had water. Now it is frozen." },
              tasks: [
                { type: "quiz", q: { de: "Wo ist das Wasser auf dem Mars heute?", en: "Where is the water on Mars today?" },
                  options: { de: ["Gefroren unter dem Boden", "In gro\u00dfen Meeren", "In Wolken", "Es gab nie Wasser"], en: ["Frozen under the ground", "In big oceans", "In clouds", "There never was water"] }, answer: 0 },
                { type: "retell", q: { de: "Wovon tr\u00e4umen Lina und Vincent am Ende?", en: "What do Lina and Vincent dream of at the end?" },
                  options: { de: ["Selbst zum Mars zu reisen", "Schlafen zu gehen", "Eis zu essen", "Nach Hause zu rennen"], en: ["Travelling to Mars themselves", "Going to sleep", "Eating ice cream", "Running home"] }, answer: 0 }
              ]
            }
          ]
        }
      ]
    },

    /* ============== WELT 4: TIEFSEE-U-BOOT ============== */
    {
      id: "ocean", emoji: "\uD83D\uDC0B", color: "#1fb6c9",
      name: { de: "Tiefsee-U-Boot", en: "Deep-Sea Submarine" },
      desc: { de: "Tauche ab zu Fischen, Korallen und Walen.", en: "Dive down to fish, corals and whales." },
      unlockStars: 22,
      stories: [
        {
          id: "ocean-1", level: 3,
          title: { de: "Das leuchtende Riff", en: "The Glowing Reef" },
          intro: { de: "Ein U-Boot entdeckt ein Geheimnis in der Tiefe.", en: "A submarine discovers a secret in the deep." },
          sections: [
            {
              text: { de: "Das kleine U-Boot taucht immer tiefer. Drau\u00dfen wird es dunkel. Pl\u00f6tzlich leuchten \u00fcberall winzige Lichter. Es sind Quallen, die im Dunkeln strahlen. Kapit\u00e4nin Noa staunt durch das runde Fenster.",
                       en: "The little submarine dives deeper and deeper. Outside it grows dark. Suddenly tiny lights glow everywhere. They are jellyfish that shine in the dark. Captain Noa marvels through the round window." },
              easy: { de: "Das U-Boot taucht tief. Es wird dunkel. \u00dcberall leuchten Quallen. Noa staunt.",
                      en: "The submarine dives deep. It gets dark. Jellyfish glow everywhere. Noa marvels." },
              tasks: [
                { type: "quiz", q: { de: "Was leuchtet im dunklen Wasser?", en: "What glows in the dark water?" },
                  options: { de: ["Quallen", "Steine", "Boote", "Sterne"], en: ["Jellyfish", "Stones", "Boats", "Stars"] }, answer: 0,
                  fact: { de: "Manche Meerestiere k\u00f6nnen wirklich selbst leuchten!", en: "Some sea animals really can make their own light!" } },
                { type: "sentence", q: { de: "Welcher Satz ist richtig geordnet?", en: "Which sentence is in the right order?" },
                  options: { de: ["Das U-Boot taucht tief.", "Tief taucht U-Boot das.", "Taucht das tief U-Boot.", "U-Boot das taucht tief."], en: ["The submarine dives deep.", "Deep dives submarine the.", "Dives the deep submarine.", "Submarine the dives deep."] }, answer: 0 }
              ]
            },
            {
              text: { de: "Noa entdeckt ein Korallenriff in vielen Farben. Bunte Fische schwimmen hindurch. Eine Schildkr\u00f6te gleitet ruhig vorbei. Noa macht ein Foto. Sie will allen zeigen, wie sch\u00f6n die Tiefsee ist.",
                       en: "Noa discovers a coral reef in many colours. Colourful fish swim through it. A turtle glides calmly past. Noa takes a photo. She wants to show everyone how beautiful the deep sea is." },
              easy: { de: "Noa sieht ein buntes Riff. Fische schwimmen. Eine Schildkr\u00f6te gleitet vorbei. Noa macht ein Foto.",
                      en: "Noa sees a colourful reef. Fish swim. A turtle glides past. Noa takes a photo." },
              tasks: [
                { type: "wordimage", q: { de: "Welches Bild zeigt eine Schildkr\u00f6te?", en: "Which picture shows a turtle?" },
                  options: { de: ["\uD83D\uDC22", "\uD83D\uDC1F", "\uD83E\uDD91", "\uD83E\uDD80"], en: ["\uD83D\uDC22", "\uD83D\uDC1F", "\uD83E\uDD91", "\uD83E\uDD80"] }, answer: 0 },
                { type: "spellfix", q: { de: "Welches Wort ist falsch geschrieben?", en: "Which word is spelled wrong?" },
                  options: { de: ["Korale", "Fisch", "Wasser", "Farbe"], en: ["Corel", "Fish", "Water", "Colour"] }, answer: 0,
                  hint: { de: "Koralle schreibt man mit zwei l.", en: "Coral: c-o-r-a-l." } }
              ]
            }
          ]
        },
        {
          id: "ocean-2", level: 2,
          title: { de: "Dana und der schlaue Tintenfisch", en: "Dana and the Clever Octopus" },
          intro: { de: "Dana nimmt Kuschelwal Wali mit ins U-Boot.", en: "Dana brings plush whale Wali into the submarine." },
          sections: [
            {
              text: { de: "Dana sitzt neben Noa im U-Boot. Auf ihrem Scho\u00df sitzt Wali, der Kuschelwal. Da klopft es leise am Fenster. Ein Tintenfisch streckt seine acht Arme aus und wechselt seine Farbe von Rot zu Blau. Dana traut ihren Augen kaum.",
                       en: "Dana sits next to Noa in the submarine. On her lap sits Wali, the plush whale. Then something taps softly on the window. An octopus stretches out its eight arms and changes colour from red to blue. Dana can hardly believe her eyes." },
              easy: { de: "Dana sitzt im U-Boot. Wali, der Kuschelwal, ist dabei. Am Fenster ist ein Tintenfisch. Er wechselt die Farbe.",
                      en: "Dana sits in the submarine. Wali the plush whale is there. An octopus is at the window. It changes colour." },
              tasks: [
                { type: "quiz", q: { de: "Wie viele Arme hat ein Tintenfisch?", en: "How many arms does an octopus have?" },
                  options: { de: ["Acht", "Zwei", "Vier", "Zehn"], en: ["Eight", "Two", "Four", "Ten"] }, answer: 0,
                  fact: { de: "Ein Krake kann seine Farbe wechseln, um sich zu verstecken!", en: "An octopus can change colour to hide!" } },
                { type: "vocab", word: { de: "Tintenfisch", en: "octopus" },
                  q: { de: "Was kann ein Tintenfisch besonders gut?", en: "What is an octopus especially good at?" },
                  options: { de: ["Die Farbe wechseln", "Schnell rennen", "Hoch fliegen", "Laut singen"], en: ["Changing colour", "Running fast", "Flying high", "Singing loudly"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Der Tintenfisch spielt mit Dana Verstecken. Mal ist er rot wie eine Koralle, mal grau wie ein Stein. Dana lacht und h\u00e4lt Wali ans Fenster. Dann winkt der Tintenfisch mit einem Arm und verschwindet in einer Felsspalte.",
                       en: "The octopus plays hide-and-seek with Dana. Sometimes it is red like coral, sometimes grey like a stone. Dana laughs and holds Wali to the window. Then the octopus waves with one arm and vanishes into a crack in the rock." },
              easy: { de: "Der Tintenfisch spielt Verstecken. Mal ist er rot, mal grau. Dana lacht. Dann ist er weg.",
                      en: "The octopus plays hide-and-seek. Sometimes red, sometimes grey. Dana laughs. Then it is gone." },
              tasks: [
                { type: "syllable", q: { de: "Setze die Silben zusammen.", en: "Put the syllables together." },
                  options: { de: ["Tin-ten-fisch", "Fisch-tin-ten", "Ten-fisch-tin", "Tin-fisch-ten"], en: ["Oc-to-pus", "Pus-oc-to", "To-pus-oc", "Oc-pus-to"] }, answer: 0 },
                { type: "retell", q: { de: "Was spielte der Tintenfisch mit Dana?", en: "What did the octopus play with Dana?" },
                  options: { de: ["Verstecken", "Fu\u00dfball", "Karten", "Fangen an Land"], en: ["Hide-and-seek", "Football", "Cards", "Tag on land"] }, answer: 0 }
              ]
            }
          ]
        },
        {
          id: "ocean-3", level: 3,
          title: { de: "Hannah und der echte Wal", en: "Hannah and the Real Whale" },
          intro: { de: "Ein riesiger Wal singt \u2013 und Wali bekommt Gesellschaft.", en: "A giant whale sings \u2013 and Wali gets company." },
          sections: [
            {
              text: { de: "Ein tiefes Lied f\u00fcllt das Wasser. Hannah dr\u00fcckt die Nase ans Fenster. Da kommt er: ein riesiger Blauwal, gr\u00f6\u00dfer als das U-Boot. Hannah h\u00e4lt Wali hoch. \u201eSchau, ein gro\u00dfer Bruder f\u00fcr dich!\u201c Der Wal singt weiter, tief und sanft.",
                       en: "A deep song fills the water. Hannah presses her nose to the window. There he comes: a huge blue whale, bigger than the submarine. Hannah holds Wali up. \u0027Look, a big brother for you!\u0027 The whale keeps singing, deep and gentle." },
              easy: { de: "Hannah h\u00f6rt ein Lied. Ein gro\u00dfer Wal kommt. Er ist gr\u00f6\u00dfer als das U-Boot. Hannah zeigt ihm Wali.",
                      en: "Hannah hears a song. A big whale comes. He is bigger than the submarine. Hannah shows him Wali." },
              tasks: [
                { type: "quiz", q: { de: "Wie macht der Wal das Lied?", en: "How does the whale make the song?" },
                  options: { de: ["Er singt durch T\u00f6ne", "Er klatscht", "Er pfeift mit dem Mund", "Er trommelt"], en: ["He sings with sounds", "He claps", "He whistles", "He drums"] }, answer: 0,
                  fact: { de: "Der Blauwal ist das gr\u00f6\u00dfte Tier, das je gelebt hat \u2013 gr\u00f6\u00dfer als jeder Dino!", en: "The blue whale is the largest animal ever \u2013 bigger than any dinosaur!" } },
                { type: "wordimage", q: { de: "Welches Bild zeigt einen Wal?", en: "Which picture shows a whale?" },
                  options: { de: ["\uD83D\uDC0B", "\uD83D\uDC1F", "\uD83E\uDD88", "\uD83D\uDC1A"], en: ["\uD83D\uDC0B", "\uD83D\uDC1F", "\uD83E\uDD88", "\uD83D\uDC1A"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Der Wal taucht ganz nah heran und schaut mit einem gro\u00dfen, freundlichen Auge herein. Dann holt er an der Oberfl\u00e4che Luft und blubbert eine Wasserfontaene in die H\u00f6he. Hannah klatscht. \u201eDanke f\u00fcr dein Lied!\u201c, ruft sie leise.",
                       en: "The whale dives in close and looks inside with one big, friendly eye. Then he takes a breath at the surface and blows a fountain of water into the air. Hannah claps. \u0027Thank you for your song!\u0027 she calls softly." },
              easy: { de: "Der Wal kommt ganz nah. Er schaut Hannah an. Oben blubbert er Wasser hoch. Hannah klatscht.",
                      en: "The whale comes close. He looks at Hannah. He blows water up high. Hannah claps." },
              tasks: [
                { type: "quiz", q: { de: "Warum muss der Wal an die Oberfl\u00e4che?", en: "Why must the whale go to the surface?" },
                  options: { de: ["Um Luft zu holen", "Um zu schlafen", "Um zu essen", "Um zu spielen"], en: ["To breathe air", "To sleep", "To eat", "To play"] }, answer: 0,
                  fact: { de: "Wale sind keine Fische \u2013 sie atmen Luft wie wir!", en: "Whales are not fish \u2013 they breathe air like we do!" } },
                { type: "spellfix", q: { de: "Welches Wort ist falsch geschrieben?", en: "Which word is spelled wrong?" },
                  options: { de: ["Wahl", "Lied", "Wasser", "Auge"], en: ["Wale", "Song", "Water", "Eye"] }, answer: 0,
                  hint: { de: "Das Tier schreibt man Wal \u2013 ohne h. \u201eWahl\u201c ist etwas anderes.", en: "The animal is whale, not wale." } }
              ]
            }
          ]
        }
      ]
    },

    /* ============== WELT 5: WUESTENPFAD ============== */
    {
      id: "desert", emoji: "\uD83C\uDFDC\ufe0f", color: "#e2a23b",
      name: { de: "W\u00fcstenpfad", en: "Desert Path" },
      desc: { de: "Hitze, Sand und kluge W\u00fcstentiere.", en: "Heat, sand and clever desert animals." },
      unlockStars: 30,
      stories: [
        {
          id: "desert-1", level: 3,
          title: { de: "Das Kamel und die Oase", en: "The Camel and the Oasis" },
          intro: { de: "Ein Kamel sucht Wasser in der hei\u00dfen W\u00fcste.", en: "A camel searches for water in the hot desert." },
          sections: [
            {
              text: { de: "Das Kamel Karim wandert durch die hei\u00dfe W\u00fcste. Die Sonne brennt. Sand liegt bis zum Horizont. Karim hat Durst, doch er bleibt ruhig. Kamele k\u00f6nnen lange ohne Wasser auskommen.",
                       en: "Karim the camel walks through the hot desert. The sun is burning. Sand stretches to the horizon. Karim is thirsty, but he stays calm. Camels can go a long time without water." },
              easy: { de: "Kamel Karim geht durch die W\u00fcste. Es ist hei\u00df. Karim hat Durst. Aber er bleibt ruhig.",
                      en: "Karim the camel walks through the desert. It is hot. Karim is thirsty. But he stays calm." },
              tasks: [
                { type: "vocab", word: { de: "Oase", en: "oasis" },
                  q: { de: "Was ist eine Oase?", en: "What is an oasis?" },
                  options: { de: ["Ein gr\u00fcner Ort mit Wasser in der W\u00fcste", "Ein gro\u00dfer Berg", "Ein kaltes Land", "Ein Tier"], en: ["A green place with water in the desert", "A big mountain", "A cold land", "An animal"] }, answer: 0,
                  fact: { de: "In einer Oase wachsen Palmen, weil dort Wasser aus der Erde kommt.", en: "Palm trees grow in an oasis because water comes up from the ground." } },
                { type: "quiz", q: { de: "Warum bleibt Karim ruhig?", en: "Why does Karim stay calm?" },
                  options: { de: ["Kamele halten lange ohne Wasser aus", "Er hat Angst", "Er ist m\u00fcde", "Es ist kalt"], en: ["Camels last long without water", "He is afraid", "He is tired", "It is cold"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Am Abend sieht Karim etwas Gr\u00fcnes. Es sind Palmen! Dazwischen glitzert ein kleiner See. Karim hat die Oase gefunden. Er trinkt in gro\u00dfen Schlucken und ruht im Schatten der B\u00e4ume.",
                       en: "In the evening Karim sees something green. They are palm trees! Between them a small lake glitters. Karim has found the oasis. He drinks in big gulps and rests in the shade of the trees." },
              easy: { de: "Am Abend sieht Karim Palmen. Dort ist Wasser. Karim trinkt viel. Er ruht im Schatten.",
                      en: "In the evening Karim sees palm trees. There is water. Karim drinks a lot. He rests in the shade." },
              tasks: [
                { type: "syllable", q: { de: "Setze die Silben zusammen.", en: "Put the syllables together." },
                  options: { de: ["Ka-mel", "Mel-ka", "Kam-le", "Ka-lem"], en: ["Ca-mel", "Mel-ca", "Cam-le", "Ca-lem"] }, answer: 0 },
                { type: "retell", q: { de: "Was passiert am Ende?", en: "What happens at the end?" },
                  options: { de: ["Karim findet Wasser in der Oase", "Karim verl\u00e4uft sich", "Es schneit", "Karim fliegt davon"], en: ["Karim finds water at the oasis", "Karim gets lost", "It snows", "Karim flies away"] }, answer: 0 }
              ]
            }
          ]
        },
        {
          id: "desert-2", level: 2,
          title: { de: "Gusti und der W\u00fcstenschatz", en: "Gusti and the Desert Treasure" },
          intro: { de: "Mit dem Metalldetektor sucht Gusti im Sand.", en: "Gusti searches the sand with the metal detector." },
          sections: [
            {
              text: { de: "Gusti hat sich Antons Metalldetektor Pieper ausgeliehen. In der W\u00fcste piept er anders als am Strand. \u201eHier liegt bestimmt etwas Altes\u201c, sagt Gusti. Karim, das Kamel, trottet neugierig hinterher. Der Sand ist warm und weich.",
                       en: "Gusti has borrowed Anton\u0027s metal detector Pieper. In the desert it beeps differently than on the beach. \u0027Something old must be here,\u0027 says Gusti. Karim the camel trots curiously behind. The sand is warm and soft." },
              easy: { de: "Gusti hat den Metalldetektor Pieper. Er sucht im Sand. Karim, das Kamel, geht mit.",
                      en: "Gusti has the metal detector Pieper. He searches in the sand. Karim the camel comes along." },
              tasks: [
                { type: "missing", q: { de: "Welcher Buchstabe fehlt? W_STE", en: "Which letter is missing? DES_RT" },
                  options: { de: ["\u00dc", "A", "O", "I"], en: ["E", "A", "O", "I"] }, answer: 0,
                  hint: { de: "W\u00fcste hat einen Umlaut: \u00fc.", en: "Des-e-rt." } },
                { type: "quiz", q: { de: "Wessen Metalldetektor hat Gusti?", en: "Whose metal detector does Gusti have?" },
                  options: { de: ["Antons", "Lottis", "Danas", "Hannahs"], en: ["Anton\u0027s", "Lotti\u0027s", "Dana\u0027s", "Hannah\u0027s"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Pieper piept mal leise, mal lauter. Such die Stelle, wo es am lautesten piept \u2013 dort liegt der Schatz im Sand vergraben.",
                       en: "Pieper beeps soft, then louder. Find the spot where it beeps loudest \u2013 that is where the treasure is buried in the sand." },
              tasks: [
                { type: "detector", q: { de: "Wo piept Pieper am lautesten? Tippe und suche!", en: "Where does Pieper beep loudest? Tap and search!" },
                  options: { de: ["\uD83C\uDF35 Kaktus", "\uD83D\uDC0A Echse", "\u26f0\ufe0f D\u00fcne", "\uD83E\uDED9 Tonkrug", "\uD83E\uDEA8 Felsen", "\uD83C\uDF34 Palme"], en: ["\uD83C\uDF35 Cactus", "\uD83D\uDC0A Lizard", "\u26f0\ufe0f Dune", "\uD83E\uDED9 Clay jar", "\uD83E\uDEA8 Rock", "\uD83C\uDF34 Palm"] }, answer: 3,
                  fact: { de: "Im Tonkrug lagen uralte M\u00fcnzen \u2013 mehr als tausend Jahre alt!", en: "The clay jar held ancient coins \u2013 over a thousand years old!" } }
              ]
            },
            {
              text: { de: "Im Tonkrug glitzern uralte M\u00fcnzen. \u201eWow, die sind bestimmt sehr alt!\u201c, fl\u00fcstert Gusti. Vorsichtig legt er sie wieder zur\u00fcck und merkt sich den Ort. Solche Funde geh\u00f6ren ins Museum, damit alle sie bestaunen k\u00f6nnen.",
                       en: "Ancient coins glitter in the clay jar. \u0027Wow, these must be very old!\u0027 Gusti whispers. Carefully he puts them back and remembers the spot. Finds like these belong in a museum, so everyone can admire them." },
              easy: { de: "Im Krug sind alte M\u00fcnzen. Gusti staunt. Solche Funde geh\u00f6ren ins Museum.",
                      en: "In the jar are old coins. Gusti marvels. Such finds belong in a museum." },
              tasks: [
                { type: "quiz", q: { de: "Wohin geh\u00f6ren sehr alte Funde?", en: "Where do very old finds belong?" },
                  options: { de: ["Ins Museum", "In den M\u00fcll", "Ins Wasser", "In die Tasche f\u00fcr immer"], en: ["In a museum", "In the bin", "In the water", "In your pocket forever"] }, answer: 0,
                  fact: { de: "Forscher, die alte Dinge ausgraben, hei\u00dfen Arch\u00e4ologen.", en: "People who dig up old things are called archaeologists." } },
                { type: "retell", q: { de: "Was hat Gusti mit den M\u00fcnzen gemacht?", en: "What did Gusti do with the coins?" },
                  options: { de: ["Vorsichtig zur\u00fcckgelegt und den Ort gemerkt", "Alle mitgenommen", "Ins Wasser geworfen", "Verschenkt"], en: ["Put them back and remembered the spot", "Took them all", "Threw them in water", "Gave them away"] }, answer: 0 }
              ]
            }
          ]
        },
        {
          id: "desert-3", level: 3,
          title: { de: "Lottis kleiner W\u00fcstenfuchs", en: "Lotti\u0027s Little Desert Fox" },
          intro: { de: "Lotti trifft einen Fennek mit riesigen Ohren.", en: "Lotti meets a fennec fox with huge ears." },
          sections: [
            {
              text: { de: "In der D\u00e4mmerung entdeckt Lotti ein winziges Tier mit riesigen Ohren. Es ist ein Fennek, ein W\u00fcstenfuchs. Seine Ohren sind fast so gro\u00df wie sein Kopf. Lotti bleibt ganz still, um ihn nicht zu erschrecken.",
                       en: "At dusk Lotti spots a tiny animal with huge ears. It is a fennec, a desert fox. Its ears are almost as big as its head. Lotti stays very still so as not to scare it." },
              easy: { de: "Lotti sieht ein kleines Tier. Es hat riesige Ohren. Es ist ein W\u00fcstenfuchs. Lotti ist ganz still.",
                      en: "Lotti sees a small animal. It has huge ears. It is a desert fox. Lotti stays very still." },
              tasks: [
                { type: "vocab", word: { de: "Fennek", en: "fennec" },
                  q: { de: "Was ist ein Fennek?", en: "What is a fennec?" },
                  options: { de: ["Ein kleiner W\u00fcstenfuchs", "Ein gro\u00dfer B\u00e4r", "Ein Vogel", "Ein Fisch"], en: ["A small desert fox", "A big bear", "A bird", "A fish"] }, answer: 0,
                  fact: { de: "Die gro\u00dfen Ohren helfen dem Fennek, sich abzuk\u00fchlen.", en: "The big ears help the fennec cool down." } },
                { type: "wordimage", q: { de: "Welches Bild zeigt einen Fuchs?", en: "Which picture shows a fox?" },
                  options: { de: ["\uD83E\uDD8A", "\uD83D\uDC2A", "\uD83E\uDD85", "\uD83D\uDC0D"], en: ["\uD83E\uDD8A", "\uD83D\uDC2A", "\uD83E\uDD85", "\uD83D\uDC0D"] }, answer: 0 }
              ]
            },
            {
              text: { de: "Warum jagt der Fennek erst nachts? Tags\u00fcber ist die W\u00fcste zu hei\u00df. In der k\u00fchlen Nacht sucht er nach K\u00e4fern und Samen. Mit seinen gro\u00dfen Ohren h\u00f6rt er sogar Tiere unter dem Sand. Lotti winkt ihm leise zum Abschied.",
                       en: "Why does the fennec hunt only at night? In the daytime the desert is too hot. In the cool night it looks for beetles and seeds. With its big ears it can even hear animals under the sand. Lotti waves it a quiet goodbye." },
              easy: { de: "Der Fennek jagt nachts. Tags\u00fcber ist es zu hei\u00df. Mit den Ohren h\u00f6rt er Tiere im Sand. Lotti winkt.",
                      en: "The fennec hunts at night. By day it is too hot. With its ears it hears animals in the sand. Lotti waves." },
              tasks: [
                { type: "quiz", q: { de: "Warum jagt der Fennek nachts?", en: "Why does the fennec hunt at night?" },
                  options: { de: ["Tags\u00fcber ist es zu hei\u00df", "Nachts ist es heller", "Er kann nicht schlafen", "Er mag den Mond"], en: ["By day it is too hot", "At night it is brighter", "He cannot sleep", "He likes the moon"] }, answer: 0 },
                { type: "spellfix", q: { de: "Welches Wort ist falsch geschrieben?", en: "Which word is spelled wrong?" },
                  options: { de: ["Wuesten