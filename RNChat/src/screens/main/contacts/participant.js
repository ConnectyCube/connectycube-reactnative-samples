import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Avatar from '../../components/avatar';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Participant({ isSelected, onSelectUser, user, isGroupDialog }) {
  const toggleUserSelect = () => {
    onSelectUser(user);
  };

  return (
    <TouchableOpacity onPress={toggleUserSelect}>
      <View style={styles.container}>
        <View style={styles.userContainer}>
          <Avatar
            photo={user.avatar}
            name={user.full_name}
            iconSize="medium"
          />
          <Text style={styles.nameTitle}>{user.full_name}</Text>
        </View>
        <>
          {isGroupDialog ?
            isSelected ? (
              <Icon name="radio-button-checked" size={24} color="green" />
            ) : (
              <Icon name="radio-button-unchecked" size={24} color="black" />
            ) : <Icon name="arrow-forward" size={24} color="green" />
          }
        </>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgrey',
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  nameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'grey',
  },
  select: {
    color: 'green',
    fontSize: 10,
    fontWeight: '500',
  },
});
