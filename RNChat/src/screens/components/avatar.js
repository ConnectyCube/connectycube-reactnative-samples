import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getCbToken } from '../../helpers/file';

const COLORS = [
  'blue',
  'darkmagenta',
  'fuchsia',
  'gold',
  'green',
  'limegreen',
  'navy',
  'purple',
  'red',
  'skyblue',
];

export default function Avatar({ photo, name, iconSize }) {
  let styles;

  switch (iconSize) {
    case 'extra-large': {
      styles = extraLargeIcon;
      break;
    }
    case 'large': {
      styles = largeIcon;
      break;
    }
    case 'medium': {
      styles = mediumIcon;
      break;
    }
    case 'small': {
      styles = smallIcon;
      break;
    }
  }

  const randomizeColor = useMemo(() => {
    return COLORS[name.length % COLORS.length];
  }, [name]);

  const iconLabel = useMemo(() => {
    const words = name.split(' ');

    const lbl = words.length > 1
      ? `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`
      : name.slice(0, 2);

    return lbl.toUpperCase().trim();
  }, [name]);

  return (
    photo
      ? <Image
        style={styles.photo}
        source={getCbToken(photo)}
        key={photo}
      />
      : (
        <View style={[styles.photo, { backgroundColor: randomizeColor }]}>
          <Text style={styles.randomIcon}>{iconLabel}</Text>
        </View >
      )
  );
}

const extraLargeIcon = StyleSheet.create({
  photo: {
    borderRadius: 50,
    height: 100,
    width: 100,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  randomIcon: {
    fontSize: 48,
    fontWeight: '600',
    color: 'white',
  },
});

const largeIcon = StyleSheet.create({
  photo: {
    borderRadius: 25,
    height: 50,
    width: 50,
    marginVertical: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  randomIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
});

const mediumIcon = StyleSheet.create({
  photo: {
    borderRadius: 20,
    height: 40,
    width: 40,
    marginVertical: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  randomIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
});

const smallIcon = StyleSheet.create({
  photo: {
    borderRadius: 18,
    height: 36,
    width: 36,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  randomIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});
