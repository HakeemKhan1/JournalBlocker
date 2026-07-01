import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SANS, SERIF } from '../theme';
import { Orb, Glow, Particles, Lock, CheckSmall } from '../ui';

/* ---- progress header ---- */
function Header({ v }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18, height: 20 }}>
      <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
        {v.obSegs.map((on, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 99, backgroundColor: on ? C.acc : C.faint }} />
        ))}
      </View>
      {v.obShowSkip ? (
        <Pressable onPress={v.onSkip}>
          <Text style={{ color: C.faint, fontSize: 13, fontFamily: SANS }}>Skip</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---- step 0: welcome / hook ---- */
function Step0({ v }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 210, height: 210, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <Glow size={250} opacity={0.85} />
        <Orb size={128} />
        <Particles list={v.particles} />
      </View>
      <Text style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 40, color: C.ink, textAlign: 'center', letterSpacing: -0.3 }}>Build focus{'\n'}that lasts.</Text>
      <Text style={{ color: C.dim, fontSize: 16, lineHeight: 25, marginTop: 16, maxWidth: 296, textAlign: 'center', fontFamily: SANS }}>A few quiet minutes of reflection a day can measurably sharpen how you focus. We'll show you the research.</Text>
    </View>
  );
}

/* ---- step 1: phone time ---- */
function StepBtn({ glyph, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.s06, borderWidth: 1, borderColor: C.b10, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.ink, fontSize: 22, lineHeight: 24, fontFamily: SANS }}>{glyph}</Text>
    </Pressable>
  );
}

function Step1({ v, M }) {
  const pct = Math.max(0, Math.min(1, (v.interrupts - 2) / (40 - 2)));
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: SERIF, fontSize: 27, lineHeight: 33, color: C.ink, textAlign: 'center' }}>How often does{'\n'}your focus break?</Text>
      <Text style={{ color: C.mute, fontSize: 14, marginTop: 8, textAlign: 'center', fontFamily: SANS }}>Times you get pulled off task on a typical workday</Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Text style={{ fontFamily: SERIF, fontSize: 74, lineHeight: 74, color: C.ink }}>{v.interrupts}</Text>
        <Text style={{ color: C.dim, fontSize: 16, fontFamily: SANS }}>{v.interruptsLabel}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 }}>
        <StepBtn glyph="−" onPress={() => M.phoneStep(-1)} />
        <View style={{ flex: 1, height: 6, borderRadius: 99, backgroundColor: C.b10, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${pct * 100}%`, borderRadius: 99, backgroundColor: C.acc }} />
        </View>
        <StepBtn glyph="+" onPress={() => M.phoneStep(1)} />
      </View>
    </View>
  );
}

/* ---- step 2: habit ---- */
function Step2({ v }) {
  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <Text style={{ fontFamily: SERIF, fontSize: 27, lineHeight: 33, color: C.ink, textAlign: 'center' }}>What breaks{'\n'}your focus most?</Text>
      <View style={{ alignSelf: 'center', marginTop: 10, backgroundColor: C.accSurf, borderWidth: 1, borderColor: 'rgba(245,169,127,0.22)', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 99 }}>
        <Text style={{ color: C.warm, fontSize: 12, fontWeight: '600', fontFamily: SANS }}>+4.2M people in common</Text>
      </View>
      <ScrollView style={{ flex: 1, marginTop: 18 }} contentContainerStyle={{ gap: 9, paddingRight: 2 }} showsVerticalScrollIndicator={false}>
        {v.habitOptions.map((o, i) => (
          <Pressable key={i} onPress={o.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, paddingHorizontal: 16, borderRadius: 15, backgroundColor: o.bg, borderWidth: 1, borderColor: o.border }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: o.active ? C.acc : C.b12, backgroundColor: o.active ? 'rgba(245,169,127,0.18)' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {o.active ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.acc }} /> : null}
            </View>
            <Text style={{ flex: 1, color: o.color, fontSize: 15, fontWeight: '500', fontFamily: SANS }}>{o.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---- step 3: use plan ---- */
function Step3({ v }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: SERIF, fontSize: 27, lineHeight: 33, color: C.ink, textAlign: 'center' }}>Where do you want{'\n'}to focus better?</Text>
      <View style={{ gap: 11, marginTop: 28 }}>
        {v.usePlanOptions.map((o, i) => (
          <Pressable key={i} onPress={o.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, backgroundColor: o.bg, borderWidth: 1, borderColor: o.border }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.accSurfHi, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {Array.from({ length: o.dots }).map((_, d) => (
                <View key={d} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.acc }} />
              ))}
            </View>
            <Text style={{ flex: 1, color: o.color, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ---- step 4: age ---- */
function Step4({ v }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: SERIF, fontSize: 27, lineHeight: 33, color: C.ink, textAlign: 'center' }}>How old are you?</Text>
      <Text style={{ color: C.mute, fontSize: 14, marginTop: 8, textAlign: 'center', fontFamily: SANS }}>So we can shape the right pace for you.</Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 210, height: 50, borderRadius: 14, backgroundColor: C.s06, borderWidth: 1, borderColor: C.s08 }} />
        <View style={{ alignItems: 'center' }}>
          {v.ageItems.map((a, i) => (
            <Pressable key={i} onPress={a.onPress} style={{ height: 34, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: SERIF, fontSize: a.size, lineHeight: a.size, color: a.color, opacity: a.opacity }}>{a.age}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ---- step 5: preparing report ---- */
function Step5({ v }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 16 }}>
      <Text style={{ fontFamily: SERIF, fontSize: 23, color: C.ink }}>Preparing your report…</Text>
      <View style={{ width: '100%', maxWidth: 280, height: 6, borderRadius: 99, backgroundColor: C.b10, overflow: 'hidden' }}>
        <LinearGradient colors={[C.purple, C.acc]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', width: `${v.reportProgress}%`, borderRadius: 99 }} />
      </View>
      <Text style={{ color: C.mute, fontSize: 13, fontFamily: SANS }}>{v.reportStatus}</Text>
    </View>
  );
}

/* ---- step 6: report reveal ---- */
function Stat({ value, unit, label }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 8, alignItems: 'center' }}>
      <Text style={{ fontFamily: SERIF, fontSize: 24, color: C.warm }}>{value}<Text style={{ fontFamily: SERIF, fontSize: 13, color: C.warm }}>{unit}</Text></Text>
      <Text style={{ fontSize: 11, color: C.mute, marginTop: 3, fontFamily: SANS }}>{label}</Text>
    </View>
  );
}

function Step6({ v }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 33, color: C.ink, textAlign: 'center', marginTop: 4 }}>What focus is costing{'\n'}— and what you'll gain.</Text>
      <View style={{ gap: 12, marginTop: 20 }}>
        <View style={{ backgroundColor: 'rgba(232,143,135,0.08)', borderWidth: 1, borderColor: 'rgba(232,143,135,0.22)', borderRadius: 18, padding: 18 }}>
          <Text style={{ fontSize: 12, letterSpacing: 0.84, textTransform: 'uppercase', color: C.red, marginBottom: 8, fontFamily: SANS }}>The hidden cost</Text>
          <Text style={{ fontSize: 16, lineHeight: 25, color: C.ink, fontFamily: SANS }}>At {v.interruptsLabel}, just getting back on task can eat up to <Text style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.redLite }}>{v.refocusHrs} hours</Text> of every workday — roughly <Text style={{ color: C.redLite, fontFamily: SANS }}>{v.refocusDays} days</Text> a year.</Text>
          <Text style={{ fontSize: 11, lineHeight: 15, color: C.mute, marginTop: 10, fontFamily: SANS }}>It takes 23 min to fully refocus after a single interruption · UC Irvine</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(123,191,158,0.08)', borderWidth: 1, borderColor: 'rgba(123,191,158,0.24)', borderRadius: 18, padding: 18 }}>
          <Text style={{ fontSize: 12, letterSpacing: 0.84, textTransform: 'uppercase', color: C.green, marginBottom: 8, fontFamily: SANS }}>What the practice gives back</Text>
          <Text style={{ fontSize: 16, lineHeight: 25, color: C.ink, fontFamily: SANS }}>People who spend 15 minutes a day reflecting perform <Text style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.greenLite }}>{v.focusGain} better</Text> — and two weeks of focus training lifted scores 16 points, improving even working memory.</Text>
          <Text style={{ fontSize: 11, lineHeight: 15, color: C.mute, marginTop: 10, fontFamily: SANS }}>Harvard Business School · Psychological Science</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <Stat value="23" unit=" min" label="to refocus" />
          <Stat value="22.8" unit="%" label="more done" />
          <Stat value="+16" unit=" pts" label="focus boost" />
        </View>
      </View>
    </ScrollView>
  );
}

/* ---- step 7: commitment ---- */
function CommitIcon({ icon }) {
  if (icon === 'ring') return <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: C.acc }} />;
  if (icon === 'lock') return <Lock color={C.acc} />;
  // chart
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2.5, height: 15 }}>
      <View style={{ width: 3, height: 7, backgroundColor: C.acc, borderRadius: 1 }} />
      <View style={{ width: 3, height: 13, backgroundColor: C.acc, borderRadius: 1 }} />
      <View style={{ width: 3, height: 10, backgroundColor: C.acc, borderRadius: 1 }} />
    </View>
  );
}

function Step7({ v }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: SERIF, fontSize: 27, lineHeight: 33, color: C.ink, textAlign: 'center' }}>What level of{'\n'}commitment feels right?</Text>
      <View style={{ gap: 11, marginTop: 28 }}>
        {v.commitOptions.map((o, i) => (
          <Pressable key={i} onPress={o.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, paddingHorizontal: 16, borderRadius: 16, backgroundColor: o.bg, borderWidth: 1, borderColor: o.border }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.accSurfHi, alignItems: 'center', justifyContent: 'center' }}>
              <CommitIcon icon={o.icon} />
            </View>
            <Text style={{ flex: 1, color: o.color, fontSize: 15, fontWeight: '500', lineHeight: 20, fontFamily: SANS }}>{o.label}</Text>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: o.active ? C.acc : C.b12, backgroundColor: o.active ? C.acc : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {o.active ? <CheckSmall color={C.onAcc} size={11} weight={2} /> : null}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ---- step 8: connect / first step ---- */
function Step8() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 74, height: 74, borderRadius: 22, backgroundColor: C.accSurf, borderWidth: 1, borderColor: C.accBorderHi, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: C.acc, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.acc }} />
        </View>
      </View>
      <Text style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 33, color: C.ink, textAlign: 'center' }}>Start with one reflection</Text>
      <Text style={{ color: C.soft, fontSize: 16, lineHeight: 26, marginTop: 14, maxWidth: 300, textAlign: 'center', fontFamily: SANS }}>Each day, Journal Blocker guides you through a two-minute reflection that clears your mind and trains your attention before deep work. Your entries stay on your phone — never sent to us, or anyone.</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
        <Text style={{ color: C.mute, fontSize: 13, fontFamily: SANS }}>On-device · private by default</Text>
      </View>
    </View>
  );
}

/* ---- footer ---- */
function Footer({ v, M }) {
  return (
    <View style={{ gap: 10, marginTop: 16 }}>
      {v.obSubLabel ? (
        <Pressable onPress={v.obSubAction} style={{ alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 10 }}>
          <Text style={{ color: C.mute, fontSize: 14, fontWeight: '600', fontFamily: SANS }}>{v.obSubLabel}</Text>
        </Pressable>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {v.obShowBack ? (
          <Pressable onPress={M.prevOnboard} style={{ paddingVertical: 17, paddingHorizontal: 22, borderRadius: 18, backgroundColor: C.s06, borderWidth: 1, borderColor: C.b10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: C.ink, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>Back</Text>
          </Pressable>
        ) : null}
        {v.obPrimaryDisabled ? (
          <View style={{ flex: 1, paddingVertical: 17, borderRadius: 18, borderWidth: 1, borderColor: C.s08, backgroundColor: C.s05, alignItems: 'center' }}>
            <Text style={{ color: C.faint, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>{v.obPrimaryLabel}</Text>
          </View>
        ) : (
          <Pressable onPress={v.obPrimaryAction} style={{ flex: 1 }}>
            <LinearGradient colors={['#f7b48f', '#f0926b']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ paddingVertical: 17, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: C.accDeep, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } }}>
              <Text style={{ color: C.onAcc, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>{v.obPrimaryLabel}</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const STEPS = [Step0, Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8];

export default function Onboarding({ v, M, s }) {
  const StepView = STEPS[v.obStep] || Step0;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 16, paddingHorizontal: 26, paddingBottom: 30 }}>
        {v.obShowHeader ? <Header v={v} /> : null}
        <StepView v={v} M={M} s={s} />
        {v.obShowPrimary ? <Footer v={v} M={M} /> : null}
      </View>
    </View>
  );
}
