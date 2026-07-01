/**
 * Mock data (stands in for local storage). Journals carry an Ionicons name + a
 * tile color; entries reference a journalId and a `bucket` (today | month | earlier).
 */
import { colors } from '../theme';

export const journals = [
  { id: 'personal', name: 'Personal', icon: 'moon', color: colors.tiles.indigo },
  { id: 'gratitude', name: 'Gratitude', icon: 'heart', color: colors.tiles.pink },
  { id: 'work', name: 'Work', icon: 'briefcase', color: colors.tiles.blue },
  { id: 'health', name: 'Health', icon: 'fitness', color: colors.tiles.green },
];

export const moods = [
  { id: 'great', icon: 'happy', label: 'Great', color: colors.tiles.green },
  { id: 'good', icon: 'happy-outline', label: 'Good', color: colors.tiles.mint },
  { id: 'okay', icon: 'remove-circle-outline', label: 'Okay', color: colors.tiles.yellow },
  { id: 'low', icon: 'sad-outline', label: 'Low', color: colors.tiles.orange },
  { id: 'tired', icon: 'bed-outline', label: 'Tired', color: colors.tiles.gray },
];

export const entries = [
  {
    id: 'e1', journalId: 'personal', bucket: 'today', date: 'Today', time: '8:24 AM', mood: 'good', aiAssisted: true,
    title: 'A quiet start',
    text: 'Woke up before the alarm and didn’t reach for my phone. Made coffee, sat by the window. Small thing, but the morning felt like mine.',
  },
  {
    id: 'e2', journalId: 'personal', bucket: 'month', date: 'Yesterday', time: '9:42 PM', mood: 'good', aiAssisted: true,
    title: 'A good kind of tired',
    text: 'Shipped the first build and made myself go for a walk after instead of refreshing my phone. The walk fixed my whole mood.',
  },
  {
    id: 'e3', journalId: 'gratitude', bucket: 'month', date: 'Mon, Jun 15', time: '8:15 AM', mood: 'great', aiAssisted: true,
    title: 'Morning pages',
    text: 'Grateful for a slow start, good coffee, and that my sister called out of nowhere. We talked for an hour about nothing in particular.',
  },
  {
    id: 'e4', journalId: 'work', bucket: 'month', date: 'Sat, Jun 13', time: '10:03 PM', mood: 'okay', aiAssisted: false,
    title: 'Stuck, then unstuck',
    text: 'Spent most of the day stuck on the same bug. The fix was three lines. Note to self: walk away sooner.',
  },
  {
    id: 'e5', journalId: 'personal', bucket: 'earlier', date: 'Thu, Jun 11', time: '7:50 AM', mood: 'low', aiAssisted: true,
    title: 'Off morning',
    text: 'Didn’t sleep well. Writing this anyway, because skipping is how I lose the thread of my own week.',
  },
];

export const streak = { current: 6, longest: 14 };

export const insightsPreview = [
  { id: 'streak', icon: 'flame', color: colors.tiles.orange, value: '6 days', label: 'Streak' },
  { id: 'month', icon: 'create-outline', color: colors.tiles.indigo, value: '12', label: 'This month' },
];

export const insightsAll = {
  stats: [
    { id: 'streak', icon: 'flame', color: colors.tiles.orange, value: '6 days', label: 'Current streak' },
    { id: 'best', icon: 'trophy', color: colors.tiles.yellow, value: '14 days', label: 'Longest streak' },
    { id: 'entries', icon: 'create-outline', color: colors.tiles.indigo, value: '12', label: 'Entries this month' },
    { id: 'words', icon: 'text', color: colors.tiles.blue, value: '1,840', label: 'Words written' },
  ],
  summary:
    'This month leaned toward focus and rest. Your hardest mornings followed nights of poor sleep — and you still showed up to write, which is the habit doing its job.',
  themes: ['Focus & work', 'Rest', 'Family', 'Anxiety to calm'],
  onThisDay: { when: 'One year ago today', text: 'I was so nervous about starting. Funny to read that now.' },
};

export const blockedCategories = [
  { id: 'shortform', name: 'Short-form video', detail: 'TikTok, Reels, Shorts', icon: 'play-circle', color: colors.tiles.red, on: true },
  { id: 'social', name: 'Social', detail: 'Instagram, Snapchat, X', icon: 'people', color: colors.tiles.blue, on: true },
  { id: 'games', name: 'Games', detail: 'Mobile games', icon: 'game-controller', color: colors.tiles.purple, on: true },
  { id: 'news', name: 'News', detail: 'Reddit, news apps', icon: 'newspaper', color: colors.tiles.orange, on: false },
  { id: 'shopping', name: 'Shopping', detail: 'Amazon, retail', icon: 'bag-handle', color: colors.tiles.green, on: false },
];

export const blockedApps = [
  { id: 'tiktok', name: 'TikTok', icon: 'logo-tiktok', color: '#000000' },
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: colors.tiles.pink },
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube', color: colors.tiles.red },
  { id: 'x', name: 'X', icon: 'logo-twitter', color: '#000000' },
];

export const dailyPrompt = 'What pulled at your attention today — and was it worth it?';
