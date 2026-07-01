import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

/**
 * Minimal animated stack navigator (iOS slide-from-right). Avoids a heavy nav
 * dependency and stays predictable on web. Screens receive a `navigation`
 * prop ({ push, pop, popToTop }) plus their route params spread in.
 */
export default function Stack({ screens, initial, sharedProps = {} }) {
  const width = Dimensions.get('window').width;
  const [cards, setCards] = useState([{ name: initial, params: {}, key: 'c0' }]);
  const anim = useRef(new Animated.Value(0)).current; // 0 settled, 1 = incoming offscreen
  const idRef = useRef(1);

  const push = useCallback((name, params = {}) => {
    setCards((c) => [...c, { name, params, key: `c${idRef.current++}` }]);
    anim.setValue(1);
    Animated.timing(anim, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [anim]);

  const pop = useCallback(() => {
    setCards((c) => {
      if (c.length <= 1) return c;
      Animated.timing(anim, { toValue: 1, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(() => { setCards((cc) => cc.slice(0, -1)); anim.setValue(0); });
      return c;
    });
  }, [anim]);

  const popToTop = useCallback(() => setCards((c) => c.slice(0, 1)), []);
  const navigation = { push, pop, popToTop };

  const render = (card) => {
    const Comp = screens[card.name];
    return Comp ? <Comp navigation={navigation} {...sharedProps} {...card.params} /> : null;
  };

  const top = cards[cards.length - 1];
  const below = cards[cards.length - 2];
  const topX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, width] });
  const belowX = anim.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.25, 0] });

  return (
    <View style={styles.fill}>
      {below && (
        <Animated.View style={[styles.card, { transform: [{ translateX: belowX }] }]}>{render(below)}</Animated.View>
      )}
      <Animated.View style={[styles.card, styles.shadow, { transform: [{ translateX: topX }] }]}>{render(top)}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  card: { ...StyleSheet.absoluteFillObject },
  shadow: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: -3, height: 0 } },
});
