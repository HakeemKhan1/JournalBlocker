/**
 * useController — a faithful React-hook port of the DCLogic `Component` class
 * embedded in Journal Blocker.dc.html. Holds the whole prototype's state, the
 * (mocked) interactions — orb launch, voice typewriter, dictation, calendar,
 * onboarding funnel — and derives a flat `vals` object the screens render from.
 */
import { useRef, useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Bridge from '../../native/BlockingBridge';
import {
  ANSWERS, CAT_DESC, RECOMMENDED, PALETTE, SHAPES, THEME_META,
  FEELING_DEFS, JOURNAL_ENTRIES, INSIGHTS_DATA, HABITS,
} from './data';
import { C } from './theme';

const ACC = '#f5a97f';
const TODAY_N = 17;

/* ---------- real blocking: persistence + helpers (BLOCKING-PRD.md §4) ---- */
const K = {
  journaled: 'jb:journaledToday', dayKey: 'jb:dayKey', dayStart: 'jb:dayStartTime',
  blocked: 'jb:blockedCount', configured: 'jb:configured', lockUntil: 'jb:lockInUntil',
  streak: 'jb:streak', longest: 'jb:longest',
};
const MIN_JOURNAL_WORDS = 12;
const pad2 = (n) => String(n).padStart(2, '0');
const HM = (s) => {
  const [h, m] = String(s || '05:00').split(':').map((n) => parseInt(n, 10) || 0);
  return { h, m };
};
const wordCount = (t) => (t && t.trim() ? t.trim().split(/\s+/).length : 0);
function lockInRemainingLabel(active, until) {
  if (!active || !until) return null;
  const secs = Math.floor((new Date(until).getTime() - Date.now()) / 1000);
  if (secs <= 0) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}
/** The date-key of the current "journal day", whose boundary is dayStartTime. */
function gateDayKey(dayStartTime, now = new Date()) {
  const { h, m } = HM(dayStartTime);
  const boundary = new Date(now);
  boundary.setHours(h, m, 0, 0);
  const d = new Date(now);
  if (now < boundary) d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** RN style for a journal's colour/shape glyph at a given pixel size. */
export function iconStyle(color, shape, size = 11) {
  const base = { width: size, height: size };
  switch (shape) {
    case 'ring': return { ...base, borderRadius: size / 2, borderWidth: 2, borderColor: color };
    case 'square': return { ...base, borderRadius: 3, backgroundColor: color };
    case 'diamond': return { ...base, borderRadius: 2, backgroundColor: color, transform: [{ rotate: '45deg' }] };
    default: return { ...base, borderRadius: size / 2, backgroundColor: color };
  }
}

const initial = (startScreen) => ({
  screen: startScreen || 'onboarding',
  onboardStep: 0,
  interrupts: 8, interruptUnknown: false,
  habit: null, usePlan: null, age: 28, commitment: null,
  reportProgress: 0,
  launching: false,
  attention: 'social', desire: 'calm',
  goal: 7, streak: 6, longest: 12, appsBlocked: 3, freePasses: 2,
  // real blocking state (hydrated from AsyncStorage + native sharedState)
  hydrated: false, configured: false, dayStartTime: '05:00', blockedCount: 3,
  lockInActive: false, lockInUntil: null,
  feelings: [],
  openJournal: null, openEntry: null, showIconEditor: false, journalStyles: {},
  calYear: 2026, calMonth: 5, showCalPicker: false,
  composeTitle: '', composeBody: '', composeDictating: false, composeSaved: false,
  vStep: 0, vPhase: 'ready', vTranscript: ['', '', ''],
  sessionSuccess: false, appsUnlocked: false, showCelebration: false, journaledToday: false,
  range: 'week', expandedApp: null,
  cats: { 'Short-form video': true, 'Social media': true, 'Games': true, 'News': false, 'Streaming': false, 'Shopping': false, 'Dating': false, 'Messaging': false },
  questions: [
    { text: "What's pulling at your attention right now?", on: true },
    { text: "What would make today feel a little calmer?", on: true },
    { text: "Name one small thing you're grateful for.", on: true },
    { text: "What's one thing you're quietly avoiding?", on: false },
    { text: "When did you feel most like yourself today?", on: false },
    { text: "What do you want to let go of before tomorrow?", on: false },
  ],
  askCount: 3,
  sessionQs: ["What's pulling at your attention right now?", "What would make today feel a little calmer?", "Name one small thing you're grateful for."],
});

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function useController(props = {}) {
  const [state, setRaw] = useState(() => initial(props.startScreen));
  const T = useRef({}).current;
  // stable random decorations
  const waveBars = useRef(Array.from({ length: 24 }, () => ({ dur: (0.5 + Math.random() * 0.8).toFixed(2), delay: (Math.random() * 0.7).toFixed(2) }))).current;
  const particles = useRef(Array.from({ length: 12 }, () => ({ left: (5 + Math.random() * 90).toFixed(0), delay: (Math.random() * 1.8).toFixed(2), dur: (2.4 + Math.random() * 1.8).toFixed(2), size: (4 + Math.random() * 6).toFixed(0) }))).current;

  const setState = (patch) => setRaw((prev) => {
    const p = typeof patch === 'function' ? patch(prev) : patch;
    return p == null ? prev : { ...prev, ...p };
  });

  // Always-fresh snapshot of state for async callbacks (avoids stale closures).
  const stateRef = useRef(state);
  stateRef.current = state;

  /* ---------- real blocking: hydrate on mount ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const pairs = await AsyncStorage.multiGet(Object.values(K));
        const map = Object.fromEntries(pairs);
        const dayStartTime = map[K.dayStart] || '05:00';
        const todayKey = gateDayKey(dayStartTime);
        const configured = map[K.configured] === 'true';
        const blockedCount = parseInt(map[K.blocked], 10) || 0;
        const streak = parseInt(map[K.streak], 10);
        const longest = parseInt(map[K.longest], 10);

        // New journal-day since last open → the gate owes a journal again.
        let journaledToday = map[K.journaled] === 'true';
        const rolledOver = map[K.dayKey] !== todayKey;
        if (rolledOver) journaledToday = false;

        const lockUntilRaw = map[K.lockUntil];
        const lockInUntil = lockUntilRaw && new Date(lockUntilRaw) > new Date() ? lockUntilRaw : null;

        // Reconcile with native shared state (extension may have run day.reset).
        let native = null;
        try { native = await Bridge.getSharedState(); } catch {}
        if (native && typeof native.journaledToday === 'boolean' && native.dayKey === todayKey) {
          journaledToday = native.journaledToday;
        }

        if (!alive) return;
        setState({
          hydrated: true, dayStartTime, configured, blockedCount, journaledToday,
          lockInActive: !!lockInUntil, lockInUntil,
          ...(Number.isFinite(streak) ? { streak } : {}),
          ...(Number.isFinite(longest) ? { longest } : {}),
          screen: configured ? 'home' : (props.startScreen || 'onboarding'),
        });

        if (rolledOver) {
          await AsyncStorage.multiSet([[K.dayKey, todayKey], [K.journaled, journaledToday ? 'true' : 'false']]);
        }
        if (configured) {
          const { h, m } = HM(dayStartTime);
          Bridge.scheduleDayReset(h, m);
        }
      } catch (e) {
        if (alive) setState({ hydrated: true });
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ---------- real blocking: apply/clear shields on lock-state change (§4) ---------- */
  const shieldTimer = useRef(null);
  const lastLock = useRef(null);
  useEffect(() => {
    if (!state.hydrated || !state.configured) return undefined;

    const now = new Date();
    const gateLocked = !state.journaledToday;
    const lockInLocked = !!(state.lockInActive && state.lockInUntil && new Date(state.lockInUntil) > now);
    const lockActive = gateLocked || lockInLocked;
    const lockPhase = gateLocked ? 'morningGate' : (lockInLocked ? 'lockIn' : null);

    const payload = {
      journaledToday: !!state.journaledToday,
      lockActive,
      lockPhase, // null → native drops the key; shield UI defaults to gate copy
      lockInActive: lockInLocked,
      lockInUntil: lockInLocked ? state.lockInUntil : null,
      dayKey: gateDayKey(state.dayStartTime),
      dayStartTime: state.dayStartTime,
      selectedAppsCount: state.blockedCount,
    };

    if (shieldTimer.current) clearTimeout(shieldTimer.current);

    // Skip redundant shield ops, but still push state to the App Group.
    if (lastLock.current === lockActive) {
      Bridge.syncSharedState(payload);
      return undefined;
    }

    shieldTimer.current = setTimeout(() => {
      lastLock.current = lockActive;
      if (lockActive) {
        Bridge.authorizeScreenTime().finally(() => { Bridge.applyShields(); });
      } else {
        Bridge.clearShields();
      }
      Bridge.syncSharedState(payload);
    }, 300);

    return () => { if (shieldTimer.current) clearTimeout(shieldTimer.current); };
  }, [state.hydrated, state.configured, state.journaledToday, state.lockInActive, state.lockInUntil, state.dayStartTime, state.blockedCount]);

  /* ---------- real blocking: actions ---------- */
  const persistJournaled = (val) => {
    const dayKey = gateDayKey(stateRef.current.dayStartTime);
    AsyncStorage.multiSet([[K.journaled, val ? 'true' : 'false'], [K.dayKey, dayKey]]);
  };
  // Mark the day journaled (unlocks the gate via the effect above) + streak bump.
  const completeJournal = () => {
    setState((s) => {
      if (s.journaledToday) return null;
      const streak = s.streak + 1;
      const longest = Math.max(s.longest, streak);
      const hit = streak >= s.goal;
      AsyncStorage.multiSet([[K.streak, String(streak)], [K.longest, String(longest)]]);
      return { journaledToday: true, streak, longest, showCelebration: hit };
    });
    persistJournaled(true);
  };
  // Authorize Screen Time + present the real system app picker (onboarding/settings).
  const configureBlockedApps = async () => {
    try {
      await Bridge.authorizeScreenTime();
      const r = await Bridge.pickApps();
      const count = r && typeof r.count === 'number' ? r.count : 0;
      const configured = count > 0;
      setState({ blockedCount: count, configured });
      await AsyncStorage.multiSet([[K.blocked, String(count)], [K.configured, configured ? 'true' : 'false']]);
      const { h, m } = HM(stateRef.current.dayStartTime);
      Bridge.scheduleDayReset(h, m);
      return count;
    } catch (e) {
      return 0;
    }
  };
  const setDayStartTime = (hhmm) => {
    setState({ dayStartTime: hhmm });
    AsyncStorage.setItem(K.dayStart, hhmm);
    const { h, m } = HM(hhmm);
    Bridge.scheduleDayReset(h, m);
  };
  const startLockInSession = async (hours) => {
    const secs = Math.max(60, Math.round(hours * 3600));
    let until = null;
    try {
      const r = await Bridge.startLockIn(secs);
      until = r && r.lockInUntil ? r.lockInUntil : null;
    } catch (e) {}
    if (!until) until = new Date(Date.now() + secs * 1000).toISOString();
    setState({ lockInActive: true, lockInUntil: until, screen: 'home' });
    AsyncStorage.setItem(K.lockUntil, until);
    // Foreground expiry: flip state when the session ends while the app is open.
    // (The native lockin.session window handles the background case.)
    clearTimeout(T.lockIn);
    T.lockIn = setTimeout(() => {
      setState({ lockInActive: false, lockInUntil: null });
      AsyncStorage.removeItem(K.lockUntil);
    }, secs * 1000);
  };
  const endLockInSession = async () => {
    try { await Bridge.endLockIn(); } catch (e) {}
    setState({ lockInActive: false, lockInUntil: null });
    AsyncStorage.removeItem(K.lockUntil);
  };

  /* ---------- derived helpers ---------- */
  const enabledCount = (qs) => qs.filter((q) => q.on && q.text.trim()).length;
  const clampAsk = (qs, n) => Math.max(1, Math.min(n, Math.max(1, enabledCount(qs))));
  const styleOf = (name) => { const m = THEME_META.find((t) => t.name === name) || {}; const o = state.journalStyles[name] || {}; return { color: o.color || m.color || ACC, shape: o.shape || m.shape || 'dot' }; };
  const hasEntriesMonth = (y, m) => (y === 2026 ? m <= 5 : (y === 2025));
  const journaledSet = (y, m) => {
    if (!hasEntriesMonth(y, m)) return new Set();
    const days = new Date(y, m + 1, 0).getDate();
    const cap = (y === 2026 && m === 5) ? 17 : days;
    const set = new Set();
    for (let d = 1; d <= cap; d++) if (((d * 31 + m * 7 + (y % 100) * 13) % 10) < 7) set.add(d);
    return set;
  };

  /* ---------- navigation ---------- */
  const go = (s) => setState({ screen: s });

  /* ---------- onboarding ---------- */
  const startReport = () => {
    clearInterval(T.rp);
    setState({ reportProgress: 0 });
    T.rp = setInterval(() => setState((s) => {
      const np = s.reportProgress + 4 + Math.random() * 7;
      if (np >= 100) { clearInterval(T.rp); setTimeout(() => setState((st) => st.onboardStep === 5 ? { onboardStep: 6 } : null), 420); return { reportProgress: 100 }; }
      return { reportProgress: Math.round(np) };
    }), 110);
  };
  const nextOnboard = () => setState((s) => {
    const next = Math.min(s.onboardStep + 1, 8);
    if (next === 5) startReport();
    return { onboardStep: next };
  });
  const prevOnboard = () => setState((s) => ({ onboardStep: Math.max(s.onboardStep - 1, 0) }));
  const finishOnboard = () => {
    clearInterval(T.rp);
    // End onboarding by having the user pick real apps to block via the system picker.
    configureBlockedApps().finally(() => setState({ screen: 'home', onboardStep: 0 }));
  };
  const setPhone = (n) => setState({ interrupts: Math.max(2, Math.min(40, Math.round(n))), interruptUnknown: false });
  const phoneStep = (d) => setState((s) => ({ interrupts: Math.max(2, Math.min(40, s.interrupts + d)), interruptUnknown: false }));
  const dontKnowPhone = () => { setPhone(8); setState((s) => ({ interruptUnknown: true, onboardStep: Math.min(s.onboardStep + 1, 8) })); };

  /* ---------- orb / voice session ---------- */
  const type = (i) => {
    const words = ANSWERS[i % ANSWERS.length].split(' ');
    let n = 0;
    clearInterval(T.ti);
    T.ti = setInterval(() => {
      n++;
      setState((s) => { const t = s.vTranscript.slice(); t[i] = words.slice(0, n).join(' '); return { vTranscript: t }; });
      if (n >= words.length) { clearInterval(T.ti); setState({ vPhase: 'answered' }); }
    }, 120);
  };
  const record = () => {
    const i = state.vStep;
    setState({ vPhase: 'recording' });
    clearTimeout(T.t0); clearInterval(T.ti);
    T.t0 = setTimeout(() => type(i), 800);
  };
  const startVoice = () => {
    const pool = state.questions.filter((q) => q.on && q.text.trim()).map((q) => q.text);
    const n = clampAsk(state.questions, state.askCount);
    let chosen = pool.length > n ? pool.slice().sort(() => Math.random() - 0.5).slice(0, n) : pool.slice(0, n);
    if (chosen.length === 0) chosen = ["What's on your mind right now?"];
    setState({ screen: 'voice', vStep: 0, vPhase: 'ready', vTranscript: chosen.map(() => ''), sessionQs: chosen, sessionSuccess: false, appsUnlocked: false });
    clearTimeout(T.ar); T.ar = setTimeout(() => record(), 300);
  };
  const launchOrb = () => { setState({ launching: true }); clearTimeout(T.lt); T.lt = setTimeout(() => { setState({ launching: false }); startVoice(); }, 460); };
  const stopRecord = () => {
    clearTimeout(T.t0); clearInterval(T.ti);
    const i = state.vStep;
    setState((s) => { const t = s.vTranscript.slice(); t[i] = ANSWERS[i % ANSWERS.length]; return { vTranscript: t, vPhase: 'answered' }; });
  };
  const retake = () => { const i = state.vStep; setState((s) => { const t = s.vTranscript.slice(); t[i] = ''; return { vTranscript: t, vPhase: 'ready' }; }); };
  const nextQuestion = () => setState((s) => ({ vStep: Math.min(s.vStep + 1, s.sessionQs.length - 1), vPhase: 'ready' }));
  const completeAndHome = () => {
    const alreadyDone = stateRef.current.journaledToday;
    if (!alreadyDone) {
      completeJournal(); // sets journaledToday (→ effect clears shields), streak, celebration
      const willHit = (stateRef.current.streak + 1) >= stateRef.current.goal;
      if (willHit) { clearTimeout(T.t2); T.t2 = setTimeout(() => setState({ showCelebration: false }), 5000); }
    }
    setState({ screen: 'home', sessionSuccess: false, appsUnlocked: false, composeSaved: false });
  };
  const finishSession = () => {
    setState({ sessionSuccess: true });
    clearTimeout(T.t1);
    if (state.journaledToday) T.t1 = setTimeout(() => completeAndHome(), 1300);
    else T.t1 = setTimeout(() => setState({ appsUnlocked: true }), 1500);
  };
  const dismissCeleb = () => setState({ showCelebration: false });
  const setAsk = (d) => setState((s) => ({ askCount: clampAsk(s.questions, s.askCount + d) }));

  /* ---------- feelings ---------- */
  const toggleFeeling = (id) => setState((s) => ({ feelings: s.feelings.includes(id) ? s.feelings.filter((x) => x !== id) : [...s.feelings, id] }));
  const goFeelings = () => setState({ screen: 'feelings' });

  /* ---------- blocked apps + questions ---------- */
  const toggleCat = (name) => setState((s) => ({ cats: { ...s.cats, [name]: !s.cats[name] } }));
  const useRecommended = () => setState((s) => { const c = { ...s.cats }; Object.keys(c).forEach((k) => { c[k] = RECOMMENDED.includes(k); }); return { cats: c }; });
  const toggleQ = (i) => setState((s) => { const q = s.questions.slice(); q[i] = { ...q[i], on: !q[i].on }; return { questions: q, askCount: clampAsk(q, s.askCount) }; });
  const editQ = (i, v) => setState((s) => { const q = s.questions.slice(); q[i] = { ...q[i], text: v }; return { questions: q, askCount: clampAsk(q, s.askCount) }; });
  const addQ = () => setState((s) => ({ questions: [...s.questions, { text: '', on: true }] }));

  /* ---------- journals / entries / calendar ---------- */
  const openJournalScreen = (name) => setState({ screen: 'journal', openJournal: name, showIconEditor: false });
  const closeJournalScreen = () => setState({ screen: 'history' });
  const openEntryScreen = (id) => setState({ screen: 'entry', openEntry: id });
  const closeEntryScreen = () => setState({ screen: 'journal' });
  const openIconEditor = () => setState({ showIconEditor: true });
  const closeIconEditor = () => setState({ showIconEditor: false });
  const setJournalStyle = (patch) => setState((s) => ({ journalStyles: { ...s.journalStyles, [s.openJournal]: { ...styleOf(s.openJournal), ...patch } } }));
  const openCalPicker = () => setState({ showCalPicker: true });
  const closeCalPicker = () => setState({ showCalPicker: false });
  const prevMonth = () => setState((s) => { let m = s.calMonth - 1, y = s.calYear; if (m < 0) { m = 11; y--; } return { calMonth: m, calYear: y }; });
  const nextMonth = () => setState((s) => { let m = s.calMonth + 1, y = s.calYear; if (m > 11) { m = 0; y++; } return { calMonth: m, calYear: y }; });
  const jumpToday = () => setState({ calYear: 2026, calMonth: 5, showCalPicker: false });
  const selectMonth = (y, m) => setState({ calYear: y, calMonth: m, showCalPicker: false });

  /* ---------- compose ---------- */
  const startCompose = () => setState({ screen: 'compose', composeTitle: '', composeBody: '', composeDictating: false, composeSaved: false, appsUnlocked: false });
  const composeTitleInput = (v) => setState({ composeTitle: v });
  const composeBodyInput = (v) => setState({ composeBody: v });
  const toggleDictate = () => {
    if (state.composeDictating) { clearInterval(T.dic); setState({ composeDictating: false }); return; }
    const base = state.composeBody ? state.composeBody.replace(/\s+$/, '') + ' ' : '';
    const words = "I keep noticing how often I reach for my phone without thinking, and today I just wanted to sit with that instead.".split(' ');
    let n = 0;
    setState({ composeDictating: true });
    clearInterval(T.dic);
    T.dic = setInterval(() => { n++; setState({ composeBody: base + words.slice(0, n).join(' ') }); if (n >= words.length) { clearInterval(T.dic); setState({ composeDictating: false }); } }, 150);
  };
  const saveCompose = () => {
    clearInterval(T.dic);
    const s = stateRef.current;
    // Completion check (§7): require plausible engagement before the day unlocks.
    if (!s.journaledToday) {
      const words = wordCount(s.composeBody) + wordCount(s.composeTitle);
      if (words < MIN_JOURNAL_WORDS) {
        Alert.alert('A little more?', "Short one today — a few more words and your day opens up. Want to add anything?");
        return;
      }
    }
    setState({ composeSaved: true, composeDictating: false, appsUnlocked: false });
    clearTimeout(T.cs);
    if (s.journaledToday) T.cs = setTimeout(() => completeAndHome(), 1300);
    else T.cs = setTimeout(() => setState({ appsUnlocked: true }), 1200);
  };
  const closeCompose = () => { clearInterval(T.dic); setState({ screen: 'home', composeDictating: false }); };

  const M = {
    go, setState,
    // real blocking
    configureBlockedApps, setDayStartTime, startLockInSession, endLockInSession, completeJournal,
    nextOnboard, prevOnboard, finishOnboard, startReport, setPhone, phoneStep, dontKnowPhone,
    launchOrb, startVoice, record, stopRecord, retake, nextQuestion, finishSession, completeAndHome, dismissCeleb, setAsk,
    toggleFeeling, goFeelings,
    toggleCat, useRecommended, toggleQ, editQ, addQ,
    openJournalScreen, closeJournalScreen, openEntryScreen, closeEntryScreen, openIconEditor, closeIconEditor, setJournalStyle,
    openCalPicker, closeCalPicker, prevMonth, nextMonth, jumpToday, selectMonth,
    startCompose, composeTitleInput, composeBodyInput, toggleDictate, saveCompose, closeCompose,
    setAttention: (v) => setState({ attention: v }), setDesire: (v) => setState({ desire: v }), setGoal: (n) => setState({ goal: n }),
    setRange: (r) => setState({ range: r, expandedApp: null }),
    toggleApp: (i) => setState((s) => ({ expandedApp: s.expandedApp === i ? null : i })),
    setHabit: (h) => setState({ habit: h }), setUsePlan: (v) => setState({ usePlan: v }), setAge: (a) => setState({ age: a }), setCommitment: (v) => setState({ commitment: v }),
  };

  const vals = useMemo(() => derive(state, M, { styleOf, enabledCount, clampAsk, journaledSet, hasEntriesMonth, waveBars, particles, props }), [state]);
  return { state, vals, M };
}

/* ====================================================================== */
/*  derive — semantic, RN-friendly view model                              */
/* ====================================================================== */
function derive(s, M, h) {
  const sel = (active) => ({ active, bg: active ? 'rgba(245,169,127,0.14)' : C.s04, border: active ? ACC : C.b10, color: active ? C.warm : C.soft });
  const obSel = (active) => ({ active, bg: active ? 'rgba(245,169,127,0.14)' : C.s04, border: active ? ACC : C.b10, color: active ? C.warm : C.soft });

  /* onboarding */
  const obStep = s.onboardStep;
  const obStepsArr = [1, 2, 3, 4, 6, 7, 8];
  const obPos = obStepsArr.indexOf(obStep);
  const obSegs = obStepsArr.map((st, i) => (obPos >= 0 && i <= obPos));
  const iv = s.interrupts;
  const interruptsLabel = iv + (iv === 1 ? ' time a day' : ' times a day');
  const refocusHrs = Math.round(iv * 23.25 / 60 * 10) / 10;
  const refocusDays = Math.round(refocusHrs * 230 / 24);
  const reportStatus = s.reportProgress < 40 ? 'Reading your answers…' : (s.reportProgress < 80 ? 'Modeling your focus patterns…' : 'Almost there…');
  const habitOptions = HABITS.map((label) => ({ label, active: s.habit === label, onPress: () => M.setHabit(label), ...obSel(s.habit === label) }));
  const usePlanOptions = [['work', 'At work', 2], ['study', 'While studying', 3], ['goals', 'On personal goals', 1]].map(([v, label, dots]) => ({ value: v, label, dots, active: s.usePlan === v, onPress: () => M.setUsePlan(v), ...obSel(s.usePlan === v) }));
  const ageItems = [-2, -1, 0, 1, 2].map((d) => { const a = s.age + d; const ok = a >= 5; return { age: ok ? a : '', onPress: ok ? () => M.setAge(a) : () => {}, size: d === 0 ? 32 : 19, color: d === 0 ? C.ink : C.faint, opacity: d === 0 ? 1 : (Math.abs(d) === 1 ? 0.7 : 0.4) }; });
  const commitOptions = [['curious', "I'm just curious for now", 'ring'], ['daily', 'I want a daily focus habit that sticks', 'lock'], ['patterns', 'I want to understand my focus patterns first', 'chart']].map(([v, label, icon]) => ({ value: v, label, icon, active: s.commitment === v, onPress: () => M.setCommitment(v), ...obSel(s.commitment === v) }));
  const obDisabled = (obStep === 2 && !s.habit) || (obStep === 3 && !s.usePlan) || (obStep === 7 && !s.commitment);
  const obPrimaryLabel = obStep === 0 ? 'Get Started' : (obStep === 8 ? 'Begin my practice' : 'Continue');

  /* settings: questions */
  const eCount = h.enabledCount(s.questions);
  const effectiveAsk = h.clampAsk(s.questions, s.askCount);
  const askSummary = eCount === 0 ? 'No questions turned on yet' : (eCount <= effectiveAsk ? ("Asking all " + eCount + " you've turned on") : (eCount + ' turned on · ' + effectiveAsk + ' picked at random each day'));
  const unlockRuleText = eCount === 0 ? 'Add a question to begin' : (eCount > effectiveAsk ? (effectiveAsk + ' of ' + eCount + ' · shuffled daily') : ('1 session · ' + effectiveAsk + (effectiveAsk === 1 ? ' question' : ' questions')));
  const catList = Object.keys(s.cats).map((name) => ({ name, letter: name.charAt(0), desc: CAT_DESC[name], on: s.cats[name], rec: RECOMMENDED.includes(name), onToggle: () => M.toggleCat(name) }));
  const qList = s.questions.map((q, i) => ({ text: q.text, on: q.on, onToggle: () => M.toggleQ(i), onEdit: (v) => M.editQ(i, v) }));

  /* voice */
  const vSegs = s.sessionQs.map((_, i) => i <= s.vStep);

  /* insights */
  const RD = INSIGHTS_DATA[s.range] || INSIGHTS_DATA.week;
  const maxWin = Math.max.apply(null, RD.windows.map((w) => w.pct));

  /* reflections calendar */
  const cy = s.calYear, cm = s.calMonth;
  const isCurMonth = (cy === 2026 && cm === 5);
  const jset = h.journaledSet(cy, cm);
  const leadingN = new Date(cy, cm, 1).getDay();
  const daysIn = new Date(cy, cm + 1, 0).getDate();
  const monthCells = [];
  for (let i = 0; i < leadingN; i++) monthCells.push({ n: '', isToday: false, done: false, future: false });
  for (let n = 1; n <= daysIn; n++) {
    const done = jset.has(n); const isToday = isCurMonth && n === TODAY_N; const future = isCurMonth && n > TODAY_N;
    monthCells.push({ n, isToday, done, future });
  }
  const buildMiniDots = (y, m) => {
    const js = h.journaledSet(y, m);
    const lead = new Date(y, m, 1).getDay();
    const din = new Date(y, m + 1, 0).getDate();
    const cur = (y === 2026 && m === 5);
    const arr = [];
    for (let i = 0; i < lead; i++) arr.push({ bg: 'transparent' });
    for (let n = 1; n <= din; n++) { const isT = cur && n === TODAY_N; arr.push({ bg: isT ? ACC : (js.has(n) ? 'rgba(245,169,127,0.5)' : 'rgba(255,255,255,0.1)') }); }
    return arr;
  };
  const yearGroups = [2026, 2025].map((y) => ({ year: y, months: Array.from({ length: 12 }, (_, m) => ({ label: MABBR[m], dots: buildMiniDots(y, m), active: (y === cy && m === cm), has: h.hasEntriesMonth(y, m), onSelect: () => M.selectMonth(y, m) })) }));

  /* journals + themes */
  const themes = THEME_META.map((m) => { const st = h.styleOf(m.name); return { name: m.name, count: m.count, color: st.color, shape: st.shape, onOpen: () => M.openJournalScreen(m.name) }; });
  const jName = s.openJournal;
  const jStyle = h.styleOf(jName || THEME_META[0].name);
  const jMeta = THEME_META.find((t) => t.name === jName) || {};
  const journalList = (JOURNAL_ENTRIES[jName] || []).map((e) => ({ ...e, onOpen: () => M.openEntryScreen(e.id) }));
  let curEntry = null, curEntryJournal = '';
  if (s.openEntry) { for (const k in JOURNAL_ENTRIES) { const f = JOURNAL_ENTRIES[k].find((e) => e.id === s.openEntry); if (f) { curEntry = f; curEntryJournal = k; break; } } }
  const colorOptions = PALETTE.map((c) => ({ color: c, active: jStyle.color === c, onPick: () => M.setJournalStyle({ color: c }) }));
  const shapeOptions = SHAPES.map((sh) => ({ shape: sh, color: jStyle.color, active: jStyle.shape === sh, onPick: () => M.setJournalStyle({ shape: sh }) }));
  const feelingList = FEELING_DEFS.map(([id, label, color]) => ({ id, label, dot: color, on: s.feelings.includes(id), onToggle: () => M.toggleFeeling(id) }));

  const composeWC = s.composeBody.trim() ? s.composeBody.trim().split(/\s+/).length : 0;
  const composeCanSave = !!(s.composeTitle.trim() || s.composeBody.trim());

  const navItems = [['onboarding', 'Onboarding'], ['home', 'Home / Today'], ['shield', 'Shield gate'], ['feelings', 'Feeling check-in'], ['voice', 'Voice session'], ['history', 'Reflections'], ['journal', 'Open a journal'], ['insights', 'Insights'], ['settings', 'Settings'], ['appselect', 'App setup']]
    .map(([k, label]) => ({ key: k, label, active: s.screen === k, onPress: k === 'journal' ? () => M.openJournalScreen(THEME_META[0].name) : () => M.go(k) }));

  return {
    accentGlow: h.props.accentGlow != null ? h.props.accentGlow : 0.85,
    showSideNav: h.props.showSideNav !== false,
    screen: s.screen,
    showTabBar: ['home', 'history', 'insights', 'settings'].includes(s.screen),
    activeTab: s.screen,
    navItems,
    particles: h.particles, waveBars: h.waveBars,

    /* onboarding */
    obStep, obSegs, obShowHeader: obStep >= 1 && obStep !== 5, obShowSkip: obStep >= 1 && obStep <= 7 && obStep !== 5,
    obShowBack: obStep >= 1 && obStep !== 5 && obStep !== 6, obShowPrimary: obStep !== 5,
    obPrimaryLabel, obPrimaryDisabled: obDisabled, obPrimaryAction: obStep === 8 ? M.finishOnboard : M.nextOnboard,
    obSubLabel: obStep === 1 ? "I don't know" : null, obSubAction: M.dontKnowPhone,
    interrupts: iv, interruptsLabel, refocusHrs, refocusDays, focusGain: '22.8%',
    reportProgress: s.reportProgress, reportStatus,
    habitOptions, usePlanOptions, ageItems, commitOptions,
    onSkip: () => M.go('home'),

    /* home */
    streak: s.streak, longest: s.longest, appsBlocked: s.configured ? s.blockedCount : s.appsBlocked, goal: s.goal,
    journaledToday: s.journaledToday, launching: s.launching, showCelebration: s.showCelebration,
    blockedApps: ['Ig', 'Tk', 'Yt'], unlockedApps: ['Ig', 'Tk', 'Yt'],
    // real blocking view-state
    configured: s.configured, dayStartTime: s.dayStartTime,
    lockInActive: s.lockInActive, lockInUntil: s.lockInUntil,
    lockInLabel: lockInRemainingLabel(s.lockInActive, s.lockInUntil),

    /* voice */
    vStep: s.vStep, vNum: s.vStep + 1, vLabel: (s.vStep + 1) + ' of ' + s.sessionQs.length,
    question: s.sessionQs[s.vStep], transcript: s.vTranscript[s.vStep],
    vPhase: s.vPhase, vSegs,
    primaryLabel: (s.vStep === s.sessionQs.length - 1) ? 'Save entry' : 'Next question',
    primaryAction: (s.vStep === s.sessionQs.length - 1) ? M.finishSession : M.nextQuestion,
    sessionSuccess: s.sessionSuccess, appsUnlocked: s.appsUnlocked,

    /* shield */
    freePasses: s.freePasses,

    /* reflections */
    entriesThisYear: 142, wordsAllTime: '18,640',
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    calMonthLabel: MONTHS[cm], calYearLabel: cy, monthCells, yearGroups, showCalPicker: s.showCalPicker,
    themes,

    /* feelings */
    feelingList, feelingsCta: s.feelings.length ? 'Start reflecting' : 'Just start',

    /* journal + entry */
    journalTitle: jName, journalCount: jMeta.count || (JOURNAL_ENTRIES[jName] || []).length, journalList,
    journalIcon: { color: jStyle.color, shape: jStyle.shape }, showIconEditor: s.showIconEditor,
    colorOptions, shapeOptions,
    entryJournalName: curEntryJournal, entry: curEntry,

    /* compose */
    composeTitle: s.composeTitle, composeBody: s.composeBody, composeWordCount: composeWC,
    composeDictating: s.composeDictating, composeSaved: s.composeSaved, composeCanSave,

    /* insights */
    range: s.range, RD, maxWin, expandedApp: s.expandedApp,
    segList: [['day', 'Day'], ['week', 'Week'], ['month', 'Month']].map(([v, label]) => ({ value: v, label, active: s.range === v, onPress: () => M.setRange(v) })),

    /* settings + appselect */
    catList, qList, unlockRuleText,
    askCount: effectiveAsk, askSummary, askCanDec: effectiveAsk > 1, askCanInc: effectiveAsk < Math.max(1, eCount),
  };
}
