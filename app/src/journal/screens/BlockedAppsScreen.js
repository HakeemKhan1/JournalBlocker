import React, { useState } from 'react';
import { View, Switch } from 'react-native';
import { Screen, ListSection, ListRow, IconTile } from '../components';
import { colors } from '../theme';
import { blockedCategories, blockedApps } from '../data/mockState';

/** Blocked Apps — categories (toggle) + individual apps + rules. */
export default function BlockedAppsScreen({ navigation }) {
  const [cats, setCats] = useState(() => Object.fromEntries(blockedCategories.map((c) => [c.id, c.on])));
  const [blocking, setBlocking] = useState(true);

  return (
    <Screen title="Blocked Apps" onBack={() => navigation.pop()} backLabel="Journal">
      <ListSection footer="Apple keeps your selection private — the app only ever receives anonymous tokens.">
        <ListRow
          tile={<IconTile icon="shield-checkmark" color={colors.tint} />}
          title="Block until I journal"
          chevron={false}
          accessory={<Switch value={blocking} onValueChange={setBlocking} trackColor={{ true: colors.tint }} />}
        />
      </ListSection>

      <ListSection header="Categories">
        {blockedCategories.map((c) => (
          <ListRow
            key={c.id}
            tile={<IconTile icon={c.icon} color={c.color} />}
            title={c.name}
            subtitle={c.detail}
            chevron={false}
            accessory={
              <Switch
                value={cats[c.id]}
                onValueChange={(v) => setCats((s) => ({ ...s, [c.id]: v }))}
                trackColor={{ true: colors.tint }}
              />
            }
          />
        ))}
      </ListSection>

      <ListSection header="Apps">
        {blockedApps.map((a) => (
          <ListRow key={a.id} tile={<IconTile icon={a.icon} color={a.color} />} title={a.name} value="Blocked" chevron={false} />
        ))}
        <ListRow tile={<IconTile icon="add" color={colors.tiles.gray} />} title="Add apps…" titleColor={colors.tint} onPress={() => {}} />
      </ListSection>

      <ListSection header="Rules">
        <ListRow tile={<IconTile icon="checkmark-circle" color={colors.tiles.green} />} title="Unlock rule" value="1 entry / day" onPress={() => {}} />
        <ListRow tile={<IconTile icon="time" color={colors.tiles.blue} />} title="Schedule" value="All day" onPress={() => {}} />
      </ListSection>
    </Screen>
  );
}
