import "./style.css";

/* =========================================================
   FIGHTER APP
   AUDIO SYSTEM + SETTINGS
   ========================================================= */

/* =========================================================
   STATE
   ========================================================= */

const state = {
  screen: "home",

  trainingRunning: false,
  trainingPaused: false,

  duration: 60,
  remaining: 60,

  level: "beginner",
  intensity: "normal",

  currentCombination: [],
  lastCombinationKey: "",

  timer: null,
  commandTimer: null,
  countdownTimer: null,

  warnedTenSeconds: false
};const learningState = {
  currentLesson: 0,

  completedLessons: [],

  levelCompleted: false
};


const LEARNING_PATH = [

  {
    id: "fundamentals",
    number: "01",
    title: "FUNDAMENTALS",
    subtitle: "Start here.",
    description:
      "Learn the foundation of boxing before you start throwing combinations.",
    visual: "🥊"
  },

  {
    id: "stance",
    number: "02",
    title: "STANCE",
    subtitle: "Build your base.",
    description:
      "Stand balanced. Keep your feet stable, your knees relaxed and your body ready to move.",
    visual: "STANCE"
  },

  {
    id: "guard",
    number: "03",
    title: "GUARD",
    subtitle: "Protect yourself.",
    description:
      "Keep your hands high, elbows controlled and chin protected.",
    visual: "GUARD"
  },

  {
    id: "jab",
    number: "04",
    title: "JAB",
    subtitle: "Your first weapon.",
    description:
      "The jab controls distance, creates openings and starts your combinations.",
    visual: "1"
  },

  {
    id: "cross",
    number: "05",
    title: "CROSS",
    subtitle: "Power from the rear hand.",
    description:
      "Rotate through your hips and shoulders while keeping your balance.",
    visual: "2"
  },

  {
    id: "hook",
    number: "06",
    title: "HOOK",
    subtitle: "Attack the side.",
    description:
      "Keep your elbow bent and rotate your body through the punch.",
    visual: "3"
  },

  {
    id: "uppercut",
    number: "07",
    title: "UPPERCUT",
    subtitle: "Attack from below.",
    description:
      "Drive upward from the legs and hips while keeping your guard controlled.",
    visual: "5"
  }

];


/* =========================================================
   AUDIO SETTINGS
   ========================================================= */

const defaultAudioSettings = {
  coachEnabled: true,
  coachVolume: 1,
  coachSpeed: 1.05,

  musicEnabled: false,
  musicVolume: 0.35
};


let audioSettings = {
  ...defaultAudioSettings
};


/* =========================================================
   LOAD SETTINGS
   ========================================================= */

function loadAudioSettings() {

  try {

    const saved =
      localStorage.getItem(
        "fighterAudioSettings"
      );

    if (saved) {

      audioSettings = {
        ...defaultAudioSettings,
        ...JSON.parse(saved)
      };

    }

  } catch (error) {

    console.warn(
      "Could not load audio settings.",
      error
    );

  }

}


/* =========================================================
   SAVE SETTINGS
   ========================================================= */

function saveAudioSettings() {

  try {

    localStorage.setItem(
      "fighterAudioSettings",
      JSON.stringify(audioSettings)
    );

  } catch (error) {

    console.warn(
      "Could not save audio settings.",
      error
    );

  }

}


/* =========================================================
   AUDIO ENGINE
   ========================================================= */

let audioContext = null;

let musicAudio = null;

let musicObjectUrl = null;


function getAudioContext() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }

  return audioContext;

}


/* =========================================================
   RESUME AUDIO CONTEXT
   ========================================================= */

async function resumeAudioContext() {

  const ctx =
    getAudioContext();

  if (
    ctx.state === "suspended"
  ) {

    try {

      await ctx.resume();

    } catch (error) {

      console.warn(
        "Could not resume audio context.",
        error
      );

    }

  }

}


/* =========================================================
   VOICE COACH
   ========================================================= */

const speechSupported =
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;


function getCoachVoice() {

  if (!speechSupported) {
    return null;
  }

  const voices =
    window.speechSynthesis.getVoices();

  return (
    voices.find(
      voice =>
        voice.lang &&
        voice.lang
          .toLowerCase()
          .startsWith("en-us")
    ) ||

    voices.find(
      voice =>
        voice.lang &&
        voice.lang
          .toLowerCase()
          .startsWith("en")
    ) ||

    voices[0] ||

    null
  );

}


function speak(text) {

  if (!audioSettings.coachEnabled) {
    return;
  }

  if (!speechSupported) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  const voice =
    getCoachVoice();

  if (voice) {
    utterance.voice = voice;
  }

  utterance.lang =
    "en-US";

  utterance.rate =
    audioSettings.coachSpeed;

  utterance.pitch =
    0.85;

  utterance.volume =
    audioSettings.coachVolume;

  window.speechSynthesis.speak(
    utterance
  );

}


/* =========================================================
   TEST VOICE
   ========================================================= */

function testCoachVoice() {

  speak(
    "Fighter coach ready."
  );

}


/* =========================================================
   BEEP
   ========================================================= */

function playBeep(
  frequency = 880,
  duration = 0.12
) {

  if (
    audioSettings.coachVolume <= 0
  ) {
    return;
  }

  resumeAudioContext();

  const ctx =
    getAudioContext();

  const oscillator =
    ctx.createOscillator();

  const gain =
    ctx.createGain();

  oscillator.type =
    "sine";

  oscillator.frequency.value =
    frequency;

  const volume =
    0.22 *
    audioSettings.coachVolume;

  gain.gain.setValueAtTime(
    0.001,
    ctx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    volume,
    ctx.currentTime + 0.01
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + duration
  );

  oscillator.connect(gain);

  gain.connect(
    ctx.destination
  );

  oscillator.start();

  oscillator.stop(
    ctx.currentTime + duration
  );

}


/* =========================================================
   FIGHT BELL
   ========================================================= */

function playFightBell() {

  playBeep(
    520,
    0.35
  );

  setTimeout(
    () => {

      playBeep(
        720,
        0.35
      );

    },
    180
  );

}


/* =========================================================
   ROUND FINISHED
   ========================================================= */

function playRoundFinishedSound() {

  playBeep(
    420,
    0.45
  );

  setTimeout(
    () => {

      playBeep(
        320,
        0.55
      );

    },
    250
  );

}


/* =========================================================
   MUSIC
   ========================================================= */

function ensureMusicElement() {

  if (musicAudio) {
    return musicAudio;
  }

  musicAudio =
    new Audio();

  musicAudio.loop =
    true;

  musicAudio.volume =
    audioSettings.musicVolume;

  return musicAudio;

}


/* =========================================================
   MUSIC FILE
   ========================================================= */

function loadMusicFile(file) {

  if (!file) {
    return;
  }

  if (
    !file.type.startsWith("audio/")
  ) {

    alert(
      "Please select an audio file."
    );

    return;

  }


  if (musicObjectUrl) {

    URL.revokeObjectURL(
      musicObjectUrl
    );

  }


  musicObjectUrl =
    URL.createObjectURL(
      file
    );


  const audio =
    ensureMusicElement();

  audio.src =
    musicObjectUrl;

  audio.volume =
    audioSettings.musicVolume;

  audioSettings.musicEnabled =
    true;

  saveAudioSettings();

}


/* =========================================================
   START MUSIC
   ========================================================= */

async function startMusic() {

  if (
    !audioSettings.musicEnabled
  ) {
    return;
  }

  if (!musicAudio) {
    return;
  }

  musicAudio.volume =
    audioSettings.musicVolume;

  try {

    await musicAudio.play();

  } catch (error) {

    console.warn(
      "Music playback was blocked.",
      error
    );

  }

}


/* =========================================================
   STOP MUSIC
   ========================================================= */

function stopMusic() {

  if (!musicAudio) {
    return;
  }

  musicAudio.pause();

  musicAudio.currentTime = 0;

}


/* =========================================================
   MUSIC VOLUME
   ========================================================= */

function updateMusicVolume() {

  if (!musicAudio) {
    return;
  }

  musicAudio.volume =
    audioSettings.musicVolume;

}


/* =========================================================
   BOXING DATA
   ========================================================= */

const BEGINNER_COMBINATIONS = [

  ["jab"],

  ["cross"],

  ["jab", "cross"],

  ["jab", "jab"],

  ["cross", "cross"],

  ["jab", "cross", "jab"],

  ["jab", "cross", "cross"],

  ["jab", "leadHook"],

  ["jab", "cross", "leadHook"],

  ["cross", "leadHook"],

  ["jab", "duck"]

];


const ADVANCED_COMBINATIONS = [

  ["jab", "cross", "leadHook"],

  ["jab", "cross", "leadHook", "cross"],

  ["jab", "cross", "rearHook"],

  ["jab", "leadHook", "cross"],

  ["jab", "cross", "duck", "cross"],

  ["jab", "cross", "slipLeft", "cross"],

  ["jab", "cross", "slipRight", "leadHook"],

  ["jab", "leadHook", "roll", "cross"],

  ["cross", "leadHook", "cross"],

  ["jab", "rearHook", "leadHook"],

  ["jab", "cross", "leadUppercut", "leadHook"],

  ["jab", "cross", "rearUppercut", "leadHook"]

];


const FIGHTER_COMBINATIONS = [

  ["jab", "cross", "leadHook", "cross"],

  ["jab", "cross", "leadHook", "rearHook"],

  ["jab", "cross", "duck", "leadHook", "cross"],

  ["jab", "cross", "slipLeft", "cross", "leadHook"],

  ["jab", "cross", "slipRight", "rearHook", "cross"],

  ["jab", "leadHook", "cross", "roll", "cross"],

  ["jab", "cross", "leadUppercut", "leadHook", "cross"],

  ["jab", "cross", "rearUppercut", "leadHook", "cross"],

  ["jab", "cross", "duck", "cross", "leadHook"],

  ["jab", "slipLeft", "cross", "leadHook", "roll", "cross"],

  ["jab", "slipRight", "cross", "rearHook", "duck", "cross"]

];


const LEVEL_CONFIG = {

  beginner: {
    name: "Beginner",
    label: "BEGINNER",
    combinations:
      BEGINNER_COMBINATIONS,
    interval: 1800
  },

  advanced: {
    name: "Advanced",
    label: "ADVANCED",
    combinations:
      ADVANCED_COMBINATIONS,
    interval: 1300
  },

  fighter: {
    name: "Fighter",
    label: "FIGHTER",
    combinations:
      FIGHTER_COMBINATIONS,
    interval: 900
  }

};


const INTENSITY_CONFIG = {

  low: {
    label: "LOW",
    multiplier: 1.25
  },

  normal: {
    label: "NORMAL",
    multiplier: 1
  },

  high: {
    label: "HARDCORE",
    multiplier: 0.78
  }

};


/* =========================================================
   COMBINATION HELPERS
   ========================================================= */

function expandCombination(
  combination
) {

  const result = [];

  combination.forEach(
    move => {

      if (
        move === "doubleJab"
      ) {

        result.push("jab");
        result.push("jab");

      } else {

        result.push(move);

      }

    }
  );

  return result;

}


function getRandomCombination() {

  const combinations =
    LEVEL_CONFIG[state.level]
      .combinations;

  let combination;

  let attempts = 0;

  do {

    combination =
      combinations[
        Math.floor(
          Math.random() *
          combinations.length
        )
      ];

    attempts++;

  } while (

    combination.join("-") ===
    state.lastCombinationKey &&

    attempts < 20

  );


  const expanded =
    expandCombination(
      combination
    );


  state.lastCombinationKey =
    expanded.join("-");


  return expanded;

}


/* =========================================================
   COMMAND NAMES
   ========================================================= */

function getMoveName(move) {

  const names = {

    jab: "Jab",

    cross: "Cross",

    leadHook: "Hook",

    rearHook: "Rear Hook",

    leadUppercut:
      "Uppercut",

    rearUppercut:
      "Rear Uppercut",

    duck: "Duck",

    slipLeft:
      "Slip Left",

    slipRight:
      "Slip Right",

    roll: "Roll"

  };

  return (
    names[move] ||
    move
  );

}


function combinationToSpeech(
  combination
) {

  return combination
    .map(getMoveName)
    .join(" ");

}


function combinationToDisplay(
  combination
) {

  return combination
    .map(
      move =>
        getMoveName(move)
          .toUpperCase()
    )
    .join("  ·  ");

}


/* =========================================================
   TIMER
   ========================================================= */

function formatTime(
  seconds
) {

  const minutes =
    Math.floor(
      seconds / 60
    );

  const secs =
    seconds % 60;

  return (
    String(minutes)
      .padStart(2, "0") +
    ":" +
    String(secs)
      .padStart(2, "0")
  );

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

  app.innerHTML = `

    <main class="fighter-app">

      <header class="fighter-header">

        <div class="brand">
          FIGHTER
        </div>

        <div class="brand-subtitle">
          TRAIN · LEARN · FIGHT
        </div>

        <button
          class="settings-button"
          id="settingsButton"
          aria-label="Settings"
        >
          ⚙
        </button>

      </header>


      <section class="hero">

        <div class="hero-eyebrow">
          COMBAT TRAINING SYSTEM
        </div>

        <h1>
          BECOME<br>
          THE FIGHTER.
        </h1>

        <p>
          Train your technique.
          Build your combinations.
          Become harder to stop.
        </p>

      </section>


      <section class="section">

        <div class="section-label">
          CHOOSE YOUR SPORT
        </div>


        <button
          class="sport-card sport-card-primary"
          id="boxingButton"
        >

          <span class="sport-number">
            01
          </span>

          <span class="sport-content">

            <strong>
              BOXING
            </strong>

            <small>
              STRIKES · COMBINATIONS · TRAINING
            </small>

          </span>

          <span class="sport-arrow">
            →
          </span>

        </button>


        <button
          class="sport-card disabled"
        >

          <span class="sport-number">
            02
          </span>

          <span class="sport-content">

            <strong>
              KICKBOXING
            </strong>

            <small>
              COMING SOON
            </small>

          </span>

        </button>


        <button
          class="sport-card disabled"
        >

          <span class="sport-number">
            03
          </span>

          <span class="sport-content">

            <strong>
              MUAY THAI
            </strong>

            <small>
              COMING SOON
            </small>

          </span>

        </button>


        <button
          class="sport-card disabled"
        >

          <span class="sport-number">
            04
          </span>

          <span class="sport-content">

            <strong>
              MMA
            </strong>

            <small>
              COMING SOON
            </small>

          </span>

        </button>

      </section>


      <section class="quick-start">

        <button
          class="primary-button"
          id="quickStartButton"
        >
          QUICK START
        </button>

      </section>

    </main>

  `;


  document
    .querySelector(
      "#boxingButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "boxing";

        render();

      }
    );


  document
    .querySelector(
      "#quickStartButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "combinationSetup";

        render();

      }
    );


  document
    .querySelector(
      "#settingsButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "settings";

        render();

      }
    );

}


/* =========================================================
   SETTINGS SCREEN
   ========================================================= */

function renderSettings() {

  app.innerHTML = `

    <main class="fighter-app settings-page">

      <button
        class="back-button"
        id="backButton"
      >
        ← BACK
      </button>


      <header class="page-header">

        <div class="page-eyebrow">
          FIGHTER SYSTEM
        </div>

        <h1>
          AUDIO
        </h1>

        <p>
          Configure your fight audio.
        </p>

      </header>


      <section class="settings-card">


        <!-- COACH -->

        <div class="settings-section">

          <div class="settings-section-title">
            VOICE COACH
          </div>


          <div class="settings-row">

            <div>

              <strong>
                Coach
              </strong>

              <small>
                Spoken fight commands
              </small>

            </div>


            <button
              class="toggle-button ${
                audioSettings.coachEnabled
                  ? "active"
                  : ""
              }"
              id="coachEnabled"
            >

              ${
                audioSettings.coachEnabled
                  ? "ON"
                  : "OFF"
              }

            </button>

          </div>


          <div class="settings-row slider-row">

            <div class="slider-label">

              <strong>
                Voice Volume
              </strong>

              <span
                id="coachVolumeValue"
              >
                ${Math.round(
                  audioSettings.coachVolume *
                  100
                )}%
              </span>

            </div>


            <input
              type="range"
              id="coachVolume"
              min="0"
              max="1"
              step="0.01"
              value="${
                audioSettings.coachVolume
              }"
            />

          </div>


          <div class="settings-row slider-row">

            <div class="slider-label">

              <strong>
                Voice Speed
              </strong>

              <span
                id="coachSpeedValue"
              >
                ${audioSettings.coachSpeed.toFixed(
                  2
                )}x
              </span>

            </div>


            <input
              type="range"
              id="coachSpeed"
              min="0.70"
              max="1.40"
              step="0.05"
              value="${
                audioSettings.coachSpeed
              }"
            />

          </div>


          <button
            class="secondary-button"
            id="testVoiceButton"
          >
            TEST COACH VOICE
          </button>

        </div>


        <!-- MUSIC -->

        <div class="settings-section">

          <div class="settings-section-title">
            MUSIC
          </div>


          <div class="settings-row">

            <div>

              <strong>
                Training Music
              </strong>

              <small>
                Play music during training
              </small>

            </div>


            <button
              class="toggle-button ${
                audioSettings.musicEnabled
                  ? "active"
                  : ""
              }"
              id="musicEnabled"
            >

              ${
                audioSettings.musicEnabled
                  ? "ON"
                  : "OFF"
              }

            </button>

          </div>


          <div class="settings-row slider-row">

            <div class="slider-label">

              <strong>
                Music Volume
              </strong>

              <span
                id="musicVolumeValue"
              >
                ${Math.round(
                  audioSettings.musicVolume *
                  100
                )}%
              </span>

            </div>


            <input
              type="range"
              id="musicVolume"
              min="0"
              max="1"
              step="0.01"
              value="${
                audioSettings.musicVolume
              }"
            />

          </div>


          <label
            class="music-file-button"
          >

            <span>
              🎵
            </span>

            <strong>
              SELECT MUSIC
            </strong>

            <small>
              MP3, WAV, M4A
            </small>

            <input
              type="file"
              id="musicFile"
              accept="audio/*"
              hidden
            />

          </label>


          <button
            class="secondary-button"
            id="testMusicButton"
          >
            TEST MUSIC
          </button>

        </div>


        <!-- RESET -->

        <div class="settings-section">

          <div class="settings-section-title">
            SYSTEM
          </div>


          <button
            class="danger-button"
            id="resetAudioButton"
          >
            RESET AUDIO SETTINGS
          </button>

        </div>


      </section>

    </main>

  `;


  /* =====================================================
     BACK
     ===================================================== */

  document
    .querySelector(
      "#backButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "home";

        render();

      }
    );


  /* =====================================================
     COACH ON / OFF
     ===================================================== */

  document
    .querySelector(
      "#coachEnabled"
    )
    .addEventListener(
      "click",
      () => {

        audioSettings.coachEnabled =
          !audioSettings.coachEnabled;

        saveAudioSettings();

        render();

      }
    );


  /* =====================================================
     COACH VOLUME
     ===================================================== */

  document
    .querySelector(
      "#coachVolume"
    )
    .addEventListener(
      "input",
      event => {

        audioSettings.coachVolume =
          Number(
            event.target.value
          );

        document
          .querySelector(
            "#coachVolumeValue"
          )
          .textContent =
          Math.round(
            audioSettings.coachVolume *
            100
          ) + "%";

        saveAudioSettings();

      }
    );


  /* =====================================================
     COACH SPEED
     ===================================================== */

  document
    .querySelector(
      "#coachSpeed"
    )
    .addEventListener(
      "input",
      event => {

        audioSettings.coachSpeed =
          Number(
            event.target.value
          );

        document
          .querySelector(
            "#coachSpeedValue"
          )
          .textContent =
          audioSettings.coachSpeed
            .toFixed(2) + "x";

        saveAudioSettings();

      }
    );


  /* =====================================================
     TEST VOICE
     ===================================================== */

  document
    .querySelector(
      "#testVoiceButton"
    )
    .addEventListener(
      "click",
      async () => {

        await resumeAudioContext();

        testCoachVoice();

      }
    );


  /* =====================================================
     MUSIC ON / OFF
     ===================================================== */

  document
    .querySelector(
      "#musicEnabled"
    )
    .addEventListener(
      "click",
      async () => {

        audioSettings.musicEnabled =
          !audioSettings.musicEnabled;

        saveAudioSettings();

        if (
          audioSettings.musicEnabled
        ) {

          await startMusic();

        } else {

          stopMusic();

        }

        render();

      }
    );


  /* =====================================================
     MUSIC VOLUME
     ===================================================== */

  document
    .querySelector(
      "#musicVolume"
    )
    .addEventListener(
      "input",
      event => {

        audioSettings.musicVolume =
          Number(
            event.target.value
          );

        document
          .querySelector(
            "#musicVolumeValue"
          )
          .textContent =
          Math.round(
            audioSettings.musicVolume *
            100
          ) + "%";

        updateMusicVolume();

        saveAudioSettings();

      }
    );


  /* =====================================================
     MUSIC FILE
     ===================================================== */

  document
    .querySelector(
      "#musicFile"
    )
    .addEventListener(
      "change",
      event => {

        const file =
          event.target.files[0];

        loadMusicFile(file);

      }
    );


  /* =====================================================
     TEST MUSIC
     ===================================================== */

  document
    .querySelector(
      "#testMusicButton"
    )
    .addEventListener(
      "click",
      async () => {

        audioSettings.musicEnabled =
          true;

        saveAudioSettings();

        await startMusic();

      }
    );


  /* =====================================================
     RESET
     ===================================================== */

  document
    .querySelector(
      "#resetAudioButton"
    )
    .addEventListener(
      "click",
      () => {

        audioSettings = {
          ...defaultAudioSettings
        };

        stopMusic();

        saveAudioSettings();

        render();

      }
    );

}


/* =========================================================
   BOXING MENU
   ========================================================= */

function renderBoxing() {

  app.innerHTML = `

    <main class="fighter-app">

      <button
        class="back-button"
        id="backButton"
      >
        ← BACK
      </button>


      <header class="page-header">

        <div class="page-eyebrow">
          FIGHTER / SPORT
        </div>

        <h1>
          BOXING
        </h1>

        <p>
          Choose your training.
        </p>

      </header>


      <section class="menu-stack">

        <button
          class="menu-card menu-card-primary"
          id="combinationButton"
        >

          <span class="menu-number">
            01
          </span>

          <span>

            <strong>
              COMBINATIONS
            </strong>

            <small>
              Intelligent fight combinations.
            </small>

          </span>

          <span>
            →
          </span>

        </button>


        <button
          class="menu-card"
          id="strikesButton"
        >

          <span class="menu-number">
            02
          </span>

          <span>

            <strong>
              STRIKES
            </strong>

            <small>
              Learn every punch.
            </small>

          </span>

          <span>
            →
          </span>

        </button>


        <button
          class="menu-card"
          id="techniqueButton"
        >

          <span class="menu-number">
            03
          </span>

          <span>

            <strong>
              TECHNIQUE
            </strong>

            <small>
              Build your fundamentals.
            </small>

          </span>

          <span>
            →
          </span>

        </button>

      </section>

    </main>

  `;


  document
    .querySelector(
      "#backButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "home";

        render();

      }
    );


  document
    .querySelector(
      "#combinationButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "combinationSetup";

        render();

      }
    );


  document
    .querySelector(
      "#strikesButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "strikes";

        render();

      }
    );


  document
    .querySelector(
      "#techniqueButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "technique";

        render();

      }
    );

}


/* =========================================================
   COMBINATION SETUP
   ========================================================= */

function renderCombinationSetup() {

  app.innerHTML = `

    <main class="fighter-app">

      <button
        class="back-button"
        id="backButton"
      >
        ← BOXING
      </button>


      <header class="page-header">

        <div class="page-eyebrow">
          FIGHTER COACH
        </div>

        <h1>
          COMBINATIONS
        </h1>

        <p>
          Build your fight rhythm.
        </p>

      </header>


      <section class="training-card">


        <div class="training-card-header">

          <span>
            LEVEL
          </span>

        </div>


        <div class="level-buttons">

          <button
            class="level-button ${
              state.level === "beginner"
                ? "active"
                : ""
            }"
            data-level="beginner"
          >
            BEGINNER
          </button>


          <button
            class="level-button ${
              state.level === "advanced"
                ? "active"
                : ""
            }"
            data-level="advanced"
          >
            ADVANCED
          </button>


          <button
            class="level-button ${
              state.level === "fighter"
                ? "active"
                : ""
            }"
            data-level="fighter"
          >
            FIGHTER
          </button>

        </div>


        <div class="training-card-header">

          <span>
            INTENSITY
          </span>

        </div>


        <div class="intensity-buttons">

          <button
            class="intensity-button ${
              state.intensity === "low"
                ? "active"
                : ""
            }"
            data-intensity="low"
          >
            LOW
          </button>


          <button
            class="intensity-button ${
              state.intensity === "normal"
                ? "active"
                : ""
            }"
            data-intensity="normal"
          >
            NORMAL
          </button>


          <button
            class="intensity-button ${
              state.intensity === "high"
                ? "active"
                : ""
            }"
            data-intensity="high"
          >
            HARDCORE
          </button>

        </div>


        <div class="training-card-header">

          <span>
            ROUND
          </span>

        </div>


        <div class="duration-buttons">

          <button
            class="duration-button ${
              state.duration === 30
                ? "active"
                : ""
            }"
            data-duration="30"
          >
            30 SEC
          </button>


          <button
            class="duration-button ${
              state.duration === 60
                ? "active"
                : ""
            }"
            data-duration="60"
          >
            1 MIN
          </button>


          <button
            class="duration-button ${
              state.duration === 180
                ? "active"
                : ""
            }"
            data-duration="180"
          >
            3 MIN
          </button>

        </div>


        <button
          class="primary-button training-start-button"
          id="startButton"
        >
          START FIGHT
        </button>

      </section>

    </main>

  `;


  document
    .querySelector(
      "#backButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "boxing";

        render();

      }
    );


  document
    .querySelectorAll(
      "[data-level]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            state.level =
              button.dataset.level;

            render();

          }
        );

      }
    );


  document
    .querySelectorAll(
      "[data-intensity]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            state.intensity =
              button.dataset.intensity;

            render();

          }
        );

      }
    );


  document
    .querySelectorAll(
      "[data-duration]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            state.duration =
              Number(
                button.dataset.duration
              );

            render();

          }
        );

      }
    );


  document
    .querySelector(
      "#startButton"
    )
    .addEventListener(
      "click",
      startTraining
    );

}


/* =========================================================
   TRAINING
   ========================================================= */

function startTraining() {

  state.trainingRunning =
    true;

  state.trainingPaused =
    false;

  state.remaining =
    state.duration;

  state.warnedTenSeconds =
    false;

  state.lastCombinationKey =
    "";

  renderTraining();

  startCountdown();

}


/* =========================================================
   COUNTDOWN
   ========================================================= */

function startCountdown() {

  const overlay =
    document.querySelector(
      "#countdownOverlay"
    );

  const number =
    document.querySelector(
      "#countdownNumber"
    );

  if (!overlay || !number) {
    return;
  }


  overlay.style.display =
    "flex";


  const sequence = [
    ["3", "Three"],
    ["2", "Two"],
    ["1", "One"],
    ["FIGHT", "Fight"]
  ];


  let index = 0;


  function next() {

    if (
      index >=
      sequence.length
    ) {

      overlay.style.display =
        "none";

      startFight();

      return;

    }


    const [
      display,
      speech
    ] =
      sequence[index];


    number.textContent =
      display;


    if (
      display === "FIGHT"
    ) {

      playFightBell();

    } else {

      playBeep(
        700,
        0.12
      );

    }


    speak(speech);


    index++;


    state.countdownTimer =
      setTimeout(
        next,
        1000
      );

  }


  next();

}


/* =========================================================
   START FIGHT
   ========================================================= */

async function startFight() {

  await resumeAudioContext();

  await startMusic();


  announceCombination();


  const level =
    LEVEL_CONFIG[state.level];

  const intensity =
    INTENSITY_CONFIG[
      state.intensity
    ];


  const interval =
    Math.max(
      500,
      level.interval *
      intensity.multiplier
    );


  state.commandTimer =
    setInterval(
      () => {

        if (
          !state.trainingPaused
        ) {

          announceCombination();

        }

      },
      interval
    );


  state.timer =
    setInterval(
      () => {

        if (
          state.trainingPaused
        ) {
          return;
        }


        state.remaining--;


        updateTrainingTimer();


        if (
          state.remaining === 10 &&
          !state.warnedTenSeconds
        ) {

          state.warnedTenSeconds =
            true;

          playBeep(
            900,
            0.15
          );

          setTimeout(
            () => {

              playBeep(
                900,
                0.15
              );

            },
            200
          );


          speak(
            "Ten seconds"
          );

        }


        if (
          state.remaining <= 0
        ) {

          finishTraining();

        }

      },
      1000
    );

}


/* =========================================================
   COMBINATION ANNOUNCEMENT
   ========================================================= */

function announceCombination() {

  if (
    !state.trainingRunning ||
    state.trainingPaused
  ) {
    return;
  }


  const combination =
    getRandomCombination();


  state.currentCombination =
    combination;


  const display =
    document.querySelector(
      "#currentCombination"
    );


  if (display) {

    display.textContent =
      combinationToDisplay(
        combination
      );

  }


  speak(
    combinationToSpeech(
      combination
    )
  );

}


/* =========================================================
   TRAINING SCREEN
   ========================================================= */

function renderTraining() {

  app.innerHTML = `

    <main class="fighter-app training-page">

      <div class="training-topbar">

        <button
          class="back-button"
          id="exitButton"
        >
          EXIT
        </button>

        <span>
          ${LEVEL_CONFIG[state.level].label}
        </span>

      </div>


      <section class="live-training">

        <div class="live-label">
          CURRENT COMBINATION
        </div>


        <div
          class="current-combination"
          id="currentCombination"
        >
          GET READY
        </div>


        <div
          class="training-timer"
          id="trainingTimer"
        >
          ${formatTime(
            state.remaining
          )}
        </div>


        <div class="training-meta">

          <span>
            ${
              INTENSITY_CONFIG[
                state.intensity
              ].label
            }
          </span>

          <span>
            ${
              audioSettings.musicEnabled
                ? "MUSIC ON"
                : "MUSIC OFF"
            }
          </span>

        </div>


        <div class="training-controls">

          <button
            class="control-button"
            id="pauseButton"
          >
            PAUSE
          </button>


          <button
            class="control-button stop"
            id="stopButton"
          >
            STOP
          </button>

        </div>

      </section>


      <div
        class="countdown-overlay"
        id="countdownOverlay"
        style="display:none;"
      >

        <div
          class="countdown-number"
          id="countdownNumber"
        >
          3
        </div>

      </div>

    </main>

  `;


  document
    .querySelector(
      "#pauseButton"
    )
    .addEventListener(
      "click",
      togglePause
    );


  document
    .querySelector(
      "#stopButton"
    )
    .addEventListener(
      "click",
      stopTraining
    );


  document
    .querySelector(
      "#exitButton"
    )
    .addEventListener(
      "click",
      stopTraining
    );

}


/* =========================================================
   UPDATE TIMER
   ========================================================= */

function updateTrainingTimer() {

  const element =
    document.querySelector(
      "#trainingTimer"
    );

  if (element) {

    element.textContent =
      formatTime(
        state.remaining
      );

  }

}


/* =========================================================
   PAUSE
   ========================================================= */

function togglePause() {

  state.trainingPaused =
    !state.trainingPaused;


  const button =
    document.querySelector(
      "#pauseButton"
    );


  if (state.trainingPaused) {

    if (button) {
      button.textContent =
        "RESUME";
    }

    window.speechSynthesis.cancel();

    if (musicAudio) {
      musicAudio.pause();
    }

  } else {

    if (button) {
      button.textContent =
        "PAUSE";
    }

    speak("Resume");

    if (
      audioSettings.musicEnabled
    ) {

      startMusic();

    }

  }

}


/* =========================================================
   STOP
   ========================================================= */

function stopTraining() {

  clearInterval(
    state.timer
  );

  clearInterval(
    state.commandTimer
  );

  clearTimeout(
    state.countdownTimer
  );


  state.trainingRunning =
    false;

  state.trainingPaused =
    false;


  window.speechSynthesis.cancel();


  stopMusic();


  state.screen =
    "combinationSetup";


  render();

}


/* =========================================================
   FINISH
   ========================================================= */

function finishTraining() {

  clearInterval(
    state.timer
  );

  clearInterval(
    state.commandTimer
  );


  state.trainingRunning =
    false;

  state.remaining =
    0;


  updateTrainingTimer();


  playRoundFinishedSound();

  speak(
    "Round finished"
  );


  stopMusic();


  setTimeout(
    () => {

      state.screen =
        "combinationSetup";

      render();

    },
    2500
  );

}


/* =========================================================
   STRIKES
   ========================================================= */

function renderStrikes() {

  app.innerHTML = `

    <main class="fighter-app">

      <button
        class="back-button"
        id="backButton"
      >
        ← BOXING
      </button>


      <header class="page-header">

        <div class="page-eyebrow">
          BOXING
        </div>

        <h1>
          STRIKES
        </h1>

      </header>


      <div class="strike-list">

        <div class="strike-card">
          <span>1</span>
          <strong>JAB</strong>
        </div>

        <div class="strike-card">
          <span>2</span>
          <strong>CROSS</strong>
        </div>

        <div class="strike-card">
          <span>3</span>
          <strong>HOOK</strong>
        </div>

        <div class="strike-card">
          <span>4</span>
          <strong>REAR HOOK</strong>
        </div>

        <div class="strike-card">
          <span>5</span>
          <strong>UPPERCUT</strong>
        </div>

        <div class="strike-card">
          <span>D</span>
          <strong>DUCK</strong>
        </div>

        <div class="strike-card">
          <span>SL</span>
          <strong>SLIP LEFT</strong>
        </div>

        <div class="strike-card">
          <span>SR</span>
          <strong>SLIP RIGHT</strong>
        </div>

      </div>

    </main>

  `;


  document
    .querySelector(
      "#backButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "boxing";

        render();

      }
    );

}


/* =========================================================
   TECHNIQUE
   ========================================================= */

function renderTechnique() {

  app.innerHTML = `

    <main class="fighter-app">

      <button
        class="back-button"
        id="backButton"
      >
        ← BOXING
      </button>


      <header class="page-header">

        <div class="page-eyebrow">
          BOXING
        </div>

        <h1>
          TECHNIQUE
        </h1>

      </header>


      <div class="technique-list">

        <div class="technique-card">

          <span>01</span>

          <strong>
            STANCE
          </strong>

          <p>
            Stay balanced and ready to move.
          </p>

        </div>


        <div class="technique-card">

          <span>02</span>

          <strong>
            GUARD
          </strong>

          <p>
            Protect yourself while staying ready.
          </p>

        </div>


        <div class="technique-card">

          <span>03</span>

          <strong>
            FOOTWORK
          </strong>

          <p>
            Control distance and position.
          </p>

        </div>

      </div>

    </main>

  `;


  document
    .querySelector(
      "#backButton"
    )
    .addEventListener(
      "click",
      () => {

        state.screen =
          "boxing";

        render();

      }
    );

}


/* =========================================================
   ROUTER
   ========================================================= */

function render() {

  switch (
    state.screen
  ) {

    case "home":

      renderHome();

      break;


    case "settings":

      renderSettings();

      break;


    case "boxing":

      renderBoxing();

      break;


    case "combinationSetup":

      renderCombinationSetup();

      break;


    case "training":

      renderTraining();

      break;


    case "strikes":

      renderStrikes();

      break;


    case "technique":

      renderTechnique();

      break;


    default:

      state.screen =
        "home";

      renderHome();

  }

}


/* =========================================================
   INIT
   ========================================================= */

const app =
  document.querySelector(
    "#app"
  );


loadAudioSettings();


if (speechSupported) {

  window.speechSynthesis
    .getVoices();

}


render();


/* =========================================================
   DEBUG API
   ========================================================= */

window.FighterAudio = {

  speak,

  testCoachVoice,

  startMusic,

  stopMusic,

  loadMusicFile,

  playBeep,

  settings:
    audioSettings

};