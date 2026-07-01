/**
 * Static content for the Journal Blocker prototype — a faithful copy of the
 * data baked into the Claude Design composition (mock journal entries, the
 * question bank, insight figures, feelings, blocked-app categories).
 */
export const ANSWERS = [
  "I keep reaching for my phone in every quiet moment, almost on reflex.",
  "Closing the laptop by six and taking a slow walk before the light goes.",
  "The morning was quiet enough to hear the rain on the window.",
  "Honestly a little tired, but a good tired. I got through the hard thing today.",
  "I want to stop checking my phone the second I open my eyes.",
];

export const CAT_DESC = {
  'Short-form video': 'Reels, TikTok, Shorts', 'Social media': 'Feeds & timelines',
  'Games': 'Casual & competitive', 'News': 'Headlines & alerts', 'Streaming': 'Video & shows',
  'Shopping': 'Stores & deals', 'Dating': 'Matches & chats', 'Messaging': 'Group chats',
};
export const RECOMMENDED = ['Short-form video', 'Social media', 'Games'];
export const PALETTE = ['#f5a97f', '#e89bb5', '#c9a6ef', '#8fb0ef', '#7bbf9e', '#e6c478'];
export const SHAPES = ['dot', 'ring', 'square', 'diamond'];

export const THEME_META = [
  { name: 'Restlessness & screens', count: 9, color: '#f5a97f', shape: 'dot' },
  { name: 'Slowing down', count: 7, color: '#c9a6ef', shape: 'dot' },
  { name: 'Gratitude', count: 6, color: '#7bbf9e', shape: 'dot' },
  { name: 'Work & focus', count: 5, color: '#8fb0ef', shape: 'dot' },
];

export const FEELING_DEFS = [
  ['anxious', 'Anxious', '#e89bb5'], ['restless', 'Restless', '#f5a97f'], ['bored', 'Bored', '#b9b3da'],
  ['tired', 'Tired', '#8f9fd1'], ['stressed', 'Stressed', '#e8a06e'], ['overwhelmed', 'Overwhelmed', '#d08bbf'],
  ['lonely', 'Lonely', '#9fb0e6'], ['frustrated', 'Frustrated', '#e58f87'], ['calm', 'Calm', '#7bbf9e'],
  ['content', 'Content', '#86c6a8'], ['grateful', 'Grateful', '#9ed1b0'], ['hopeful', 'Hopeful', '#c9a6ef'],
  ['curious', 'Curious', '#8fb0ef'], ['excited', 'Excited', '#e6c478'], ['peaceful', 'Peaceful', '#7fc6c0'],
];

export const JOURNAL_ENTRIES = {
  'Restlessness & screens': [
    { id: 'rs1', dateShort: 'Tue · Jun 16', date: 'Tuesday, June 16', when: 'Tuesday evening', mins: '2 min', mood: 'restless', moodColor: '#f5a97f', title: 'Reaching on reflex', preview: 'I keep reaching for my phone in every quiet moment, almost on reflex…', blocks: [
      { q: "What's pulling at your attention right now?", text: "I keep reaching for my phone in every quiet moment, almost on reflex. The second there's a gap — waiting for the kettle, a pause in a conversation — my hand goes to my pocket before I've even decided to." },
      { q: "What would make today feel a little calmer?", text: "Leaving the phone in the other room tonight. Not as a punishment, just to hear what the quiet actually sounds like when I stop filling it." },
    ] },
    { id: 'rs2', dateShort: 'Sat · Jun 13', date: 'Saturday, June 13', when: 'Saturday morning', mins: '1 min', mood: 'anxious', moodColor: '#e89bb5', title: 'The 6am scroll', preview: 'Woke up and the first thing my hand did was find the phone…', blocks: [
      { q: "When did you first reach for a screen today?", text: "Before my feet even hit the floor. I woke up and the first thing my hand did was find the phone on the nightstand and start scrolling. Twenty minutes gone before I'd taken a proper breath." },
      { q: "What were you actually looking for?", text: "Honestly, nothing. I think I just didn't want to be alone with the start of the day yet. The feed is easier than the morning." },
    ] },
    { id: 'rs3', dateShort: 'Wed · Jun 10', date: 'Wednesday, June 10', when: 'Wednesday, late', mins: '2 min', mood: 'bored', moodColor: '#b9b3da', title: 'A quieter evening', preview: 'Tonight I noticed the urge before I acted on it, and just waited…', blocks: [
      { q: "What pulled at your attention tonight?", text: "The usual itch around nine — that restless, slightly bored feeling where the phone seems like the obvious answer. But tonight I noticed it before I acted on it, and just waited." },
      { q: "What happened when you waited?", text: "It passed faster than I expected. I made tea, opened the window, and the urge sort of dissolved. I keep forgetting that it always does." },
    ] },
  ],
  'Slowing down': [
    { id: 'sd1', dateShort: 'Mon · Jun 15', date: 'Monday, June 15', when: 'Monday evening', mins: '1 min', mood: 'calm', moodColor: '#7bbf9e', title: 'A slower walk home', preview: 'I took the long way home tonight, the one along the canal…', blocks: [
      { q: "What would make today feel calmer?", text: "I took the long way home tonight, the one along the canal. No podcast, no phone, just the sound of my own footsteps. It added ten minutes and somehow gave the whole evening back to me." },
      { text: "I want more of that — choosing the slower route on purpose, even when there's a faster one." },
    ] },
    { id: 'sd2', dateShort: 'Thu · Jun 11', date: 'Thursday, June 11', when: 'Thursday, midday', mins: '2 min', mood: 'peaceful', moodColor: '#7fc6c0', title: 'Lunch without the phone', preview: 'Ate outside and left the phone face-down the whole time…', blocks: [
      { text: "Ate lunch outside today and left the phone face-down in my bag the whole time. Just watched people pass, felt the sun on my arms. It's strange how much longer twenty minutes feels when you're actually in it." },
      { q: "What did you notice?", text: "How rarely I let a moment be only itself, without reaching to capture it or escape it." },
    ] },
    { id: 'sd3', dateShort: 'Fri · Jun 5', date: 'Friday, June 5', when: 'Friday evening', mins: '1 min', mood: 'content', moodColor: '#86c6a8', title: 'Letting the evening be long', preview: 'There was nothing to do tonight and I didn’t try to fill it…', blocks: [
      { text: "There was nothing to do tonight and for once I didn't try to fill it. I lay on the floor and listened to a whole record, start to finish, the way I used to. Slow is starting to feel less like waiting and more like rest." },
    ] },
  ],
  'Gratitude': [
    { id: 'gr1', dateShort: 'Sun · Jun 14', date: 'Sunday, June 14', when: 'Sunday morning', mins: '1 min', mood: 'grateful', moodColor: '#9ed1b0', title: 'Rain on the window', preview: 'The morning was quiet enough to hear the rain…', blocks: [
      { q: "Name one small thing you're grateful for.", text: "The morning was quiet enough to hear the rain on the window. No alarm, nowhere to be. I made coffee slowly and let it be the only thing I was doing." },
    ] },
    { id: 'gr2', dateShort: 'Tue · Jun 9', date: 'Tuesday, June 9', when: 'Tuesday evening', mins: '1 min', mood: 'content', moodColor: '#86c6a8', title: 'A good tired', preview: 'Tired, but a good tired — I got through the hard thing…', blocks: [
      { q: "How are you feeling tonight?", text: "Honestly a little tired, but a good tired. I got through the hard thing at work I'd been dreading all week, and now it's just done. Grateful to my morning self for starting it." },
    ] },
    { id: 'gr3', dateShort: 'Wed · Jun 3', date: 'Wednesday, June 3', when: 'Wednesday, midday', mins: '1 min', mood: 'hopeful', moodColor: '#c9a6ef', title: 'An unprompted text', preview: 'An old friend texted out of nowhere, just to say hi…', blocks: [
      { text: "An old friend texted out of nowhere today, just to say they'd been thinking of me. Funny how a small thing like that can hold up the whole afternoon." },
    ] },
  ],
  'Work & focus': [
    { id: 'wf1', dateShort: 'Mon · Jun 15', date: 'Monday, June 15', when: 'Monday, midday', mins: '2 min', mood: 'restless', moodColor: '#f5a97f', title: 'The pull mid-task', preview: 'Every time the work gets hard, my hand drifts to my phone…', blocks: [
      { q: "What's pulling at your attention right now?", text: "Every time the work gets hard, I feel my hand drift toward my phone. It's not boredom exactly — it's that the screen offers an easy out the moment my brain has to strain a little." },
      { q: "What would help you stay?", text: "Putting the phone across the room. If reaching for it takes effort, I usually realise I didn't really want it." },
    ] },
    { id: 'wf2', dateShort: 'Thu · Jun 4', date: 'Thursday, June 4', when: 'Thursday morning', mins: '1 min', mood: 'hopeful', moodColor: '#c9a6ef', title: 'A clear first hour', preview: 'Protected the first hour this morning — no inbox, no feeds…', blocks: [
      { text: "Protected the first hour this morning — no inbox, no feeds, just the one thing that mattered. Got more done before nine than I usually manage by noon. I want to guard that hour like it's sacred, because maybe it is." },
    ] },
    { id: 'wf3', dateShort: 'Mon · Jun 1', date: 'Monday, June 1', when: 'Monday evening', mins: '1 min', mood: 'tired', moodColor: '#8f9fd1', title: 'Knowing when to stop', preview: 'Closed the laptop at six even though there was more to do…', blocks: [
      { text: "Closed the laptop at six even though there was more I could've done. The work will still be there tomorrow, and I won't be any good at it if I never actually stop. Learning that rest is part of the work, not a break from it." },
    ] },
  ],
};

export const INSIGHTS_DATA = {
  day: {
    label: 'Today', heroNum: 3,
    heroSub: 'Four little moments today where you caught yourself. Three times, you stayed.',
    windows: [{ label: 'Morning', sub: '6–11a', pct: 15 }, { label: 'Midday', sub: '11–4p', pct: 30 }, { label: 'Evening', sub: '4–9p', pct: 50 }, { label: 'Late', sub: '9p–1a', pct: 90 }],
    apps: [{ abbr: 'Ig', name: 'Instagram', count: '2 times', bar: 100, peak: 'Late evening', mood: 'Anxious' }, { abbr: 'Tk', name: 'TikTok', count: '1 time', bar: 50, peak: 'Midday', mood: 'Bored' }, { abbr: 'Yt', name: 'YouTube', count: '1 time', bar: 50, peak: 'Evening', mood: 'Tired' }],
    trendDelta: '+1', trendCap: 'One more than yesterday. Small, but it counts.',
    nudgeText: 'Tonight looks like your softest stretch. Want a soft wind-down note around 9pm?', nudgeCta: 'Add a wind-down moment',
  },
  week: {
    label: 'This week', heroNum: 14,
    heroSub: 'You noticed the urge 23 times. Each pause is a choice, and you are getting quicker at it.',
    windows: [{ label: 'Morning', sub: '6–11a', pct: 25 }, { label: 'Midday', sub: '11–4p', pct: 45 }, { label: 'Evening', sub: '4–9p', pct: 60 }, { label: 'Late', sub: '9p–1a', pct: 95 }],
    apps: [{ abbr: 'Ig', name: 'Instagram', count: '9 times', bar: 100, peak: 'Late evening', mood: 'Anxious' }, { abbr: 'Tk', name: 'TikTok', count: '7 times', bar: 78, peak: 'Midday', mood: 'Bored' }, { abbr: 'Yt', name: 'YouTube', count: '5 times', bar: 56, peak: 'Evening', mood: 'Tired' }, { abbr: 'X', name: 'X', count: '3 times', bar: 33, peak: 'Morning', mood: 'Restless' }],
    trendDelta: '+5', trendCap: 'Up from 9 the week before. You are finding the pause more often.',
    nudgeText: 'Late evening is when the pull is strongest. Want a soft wind-down note around 9pm?', nudgeCta: 'Add a wind-down moment',
  },
  month: {
    label: 'This month', heroNum: 61,
    heroSub: 'Across the month you paused 96 times. More than half, you chose something else.',
    windows: [{ label: 'Morning', sub: '6–11a', pct: 30 }, { label: 'Midday', sub: '11–4p', pct: 50 }, { label: 'Evening', sub: '4–9p', pct: 65 }, { label: 'Late', sub: '9p–1a', pct: 92 }],
    apps: [{ abbr: 'Ig', name: 'Instagram', count: '38 times', bar: 100, peak: 'Late evening', mood: 'Anxious' }, { abbr: 'Tk', name: 'TikTok', count: '27 times', bar: 71, peak: 'Midday', mood: 'Bored' }, { abbr: 'Yt', name: 'YouTube', count: '19 times', bar: 50, peak: 'Evening', mood: 'Tired' }, { abbr: 'X', name: 'X', count: '12 times', bar: 32, peak: 'Morning', mood: 'Restless' }],
    trendDelta: '+18', trendCap: 'Up from 43 last month. The pause is becoming a habit.',
    nudgeText: 'Late evening is your most tender window, month after month. Want a soft wind-down note around 9pm?', nudgeCta: 'Add a wind-down moment',
  },
};

export const HABITS = ['Constant notifications & pings', 'Reaching for my phone on reflex', 'Jumping between tabs and tools', 'My mind drifting off-task', 'Being interrupted by other people', 'Starting things but not finishing', 'Reaching for a scroll when stuck', 'Other…'];
