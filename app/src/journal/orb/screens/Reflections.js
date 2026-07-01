import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SANS, SERIF } from '../theme';
import { Chevron } from '../ui';
import { iconStyle } from '../controller';
import { fill, Scroll, Card } from './kit';

function DayCell({ c }) {
  const bg = c.isToday ? C.acc : 'transparent';
  const numColor = c.isToday ? C.onAcc : (c.future ? C.off : C.ink);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 3 }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <Text style={{ fontSize: 14, color: numColor, fontFamily: SANS }}>{c.n}</Text>
      </View>
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.acc, marginTop: 3, opacity: c.done ? 1 : 0 }} />
    </View>
  );
}

function ThemeRow({ t }) {
  return (
    <Pressable onPress={t.onOpen} style={{ backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 16, padding: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
      <View style={iconStyle(t.color, t.shape, 11)} />
      <Text style={{ flex: 1, fontSize: 15, color: C.ink, fontFamily: SANS }}>{t.name}</Text>
      <Text style={{ fontSize: 13, color: C.mute, fontFamily: SANS }}>{t.count}</Text>
      <Text style={{ color: C.faint, fontSize: 18, fontFamily: SANS }}>›</Text>
    </Pressable>
  );
}

function MonthButton({ m }) {
  const bg = m.active ? C.accSurfHi : 'transparent';
  const borderColor = m.active ? C.acc : 'transparent';
  const labelColor = m.active ? C.acc : (m.has ? C.ink : C.faint);
  return (
    <View style={{ width: '33.333%', paddingHorizontal: 6, marginBottom: 12 }}>
      <Pressable onPress={m.onSelect} style={{ backgroundColor: bg, borderWidth: 1, borderColor, borderRadius: 14, paddingHorizontal: 8, paddingTop: 10, paddingBottom: 12, gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: labelColor, fontFamily: SANS }}>{m.label}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {m.dots.map((d, i) => (
            <View key={i} style={{ width: '14.285%', alignItems: 'center', justifyContent: 'center', paddingVertical: 1 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: d.bg }} />
            </View>
          ))}
        </View>
      </Pressable>
    </View>
  );
}

export default function Reflections({ v, M }) {
  return (
    <View style={{ flex: 1 }}>
      <Scroll>
        <Text style={{ fontFamily: SERIF, fontSize: 27, color: C.ink }}>Your reflections</Text>

        {/* stat row */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Card style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontFamily: SERIF, fontSize: 30, color: C.warm, lineHeight: 30 }}>{v.entriesThisYear}</Text>
            <Text style={{ fontSize: 12.5, color: C.dim, marginTop: 6, fontFamily: SANS }}>entries this year</Text>
          </Card>
          <Card style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontFamily: SERIF, fontSize: 30, color: C.soft, lineHeight: 30 }}>{v.wordsAllTime}</Text>
            <Text style={{ fontSize: 12.5, color: C.mute, marginTop: 6, fontFamily: SANS }}>words, all time</Text>
          </Card>
        </View>

        {/* calendar */}
        <View style={{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: C.s08, borderRadius: 20, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <Pressable onPress={M.openCalPicker} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Text style={{ fontFamily: SERIF, fontSize: 19, color: C.ink }}>{v.calMonthLabel} <Text style={{ color: C.acc }}>{v.calYearLabel}</Text></Text>
              <View style={{ marginLeft: 2, marginBottom: 3 }}><Chevron dir="down" color={C.acc} size={7} /></View>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 22 }}>
              <Pressable onPress={M.prevMonth} style={{ padding: 4 }}><Chevron dir="left" color={C.acc} size={9} /></Pressable>
              <Pressable onPress={M.nextMonth} style={{ padding: 4 }}><Chevron dir="right" color={C.acc} size={9} /></Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            {v.weekdays.map((w, i) => (
              <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: C.faint, paddingBottom: 6, fontFamily: SANS }}>{w}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {v.monthCells.map((c, i) => (
              <View key={i} style={{ width: '14.285%' }}><DayCell c={c} /></View>
            ))}
          </View>
        </View>

        {/* looking back */}
        <Text style={{ marginTop: 22, fontWeight: '600', fontSize: 15, color: C.ink, fontFamily: SANS }}>Looking back</Text>
        <LinearGradient colors={['rgba(245,169,127,0.14)', 'rgba(106,74,166,0.14)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
          style={{ marginTop: 12, borderWidth: 1, borderColor: C.accBorder, borderRadius: 20, padding: 20 }}>
          <Text style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: C.acc, fontFamily: SANS }}>One year ago today</Text>
          <Text style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, lineHeight: 29, color: C.ink, marginTop: 10 }}>"I was so wired all the time. I want this year to feel slower, more like my own."</Text>
          <Text style={{ color: C.dim, fontSize: 13, marginTop: 10, fontFamily: SANS }}>You, last June</Text>
        </LinearGradient>

        {/* journals */}
        <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: C.ink, fontFamily: SANS }}>Journals</Text>
          <Text style={{ fontSize: 12, color: C.faint, fontFamily: SANS }}>Sorted as you reflect</Text>
        </View>
        <Text style={{ fontSize: 13, color: C.mute, lineHeight: 19.5, marginTop: 4, fontFamily: SANS }}>Entries file themselves into journals by what you talk about. Nothing to set up.</Text>
        <View style={{ gap: 10, marginTop: 14 }}>
          {v.themes.map((t) => <ThemeRow key={t.name} t={t} />)}
        </View>
      </Scroll>

      {/* calendar picker overlay */}
      {v.showCalPicker ? (
        <LinearGradient colors={['#241f44', '#16132b', '#0f0d1e']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={{ ...fill, zIndex: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 12 }}>
            <Pressable onPress={M.closeCalPicker} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Chevron dir="left" color={C.acc} size={9} />
              <Text style={{ color: C.acc, fontSize: 16, fontFamily: SANS }}>Calendar</Text>
            </Pressable>
            <Pressable onPress={M.jumpToday}><Text style={{ color: C.acc, fontSize: 15, fontFamily: SANS }}>Today</Text></Pressable>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {v.yearGroups.map((yg) => (
              <View key={yg.year}>
                <Text style={{ fontFamily: SERIF, fontSize: 30, color: C.ink, marginVertical: 14, marginHorizontal: 6 }}>{yg.year}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
                  {yg.months.map((m) => <MonthButton key={m.label} m={m} />)}
                </View>
              </View>
            ))}
          </ScrollView>
        </LinearGradient>
      ) : null}
    </View>
  );
}
