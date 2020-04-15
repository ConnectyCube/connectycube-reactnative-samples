import React, { PureComponent } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';

import Avatar from '../../components/avatar';
import { SIZE_SCREEN, BTN_TYPE } from '../../../helpers/constants';
import ChatService from '../../../services/chat-service';
import CreateBtn from '../../components/createBtn';
import Indicator from '../../components/indicator';
import { showAlert } from '../../../helpers/alert';
import { popToTop } from '../../../routing/init';

export default class CreateDialog extends PureComponent {
  state = {
    keyword: '',
    isPickImage: null,
    isLoader: false,
  };

  renderParticipant = (item) => (
    <View style={styles.participant} key={item.id}>
      <View style={{ paddingLeft: 10 }}>
        <Avatar
          photo={item.avatar}
          name={item.full_name}
          iconSize="medium"
        />
      </View>
      <Text numberOfLines={2} style={{ textAlign: 'center' }}>{item.full_name}</Text>
    </View>
  )

  createDialog = () => {
    const { navigation } = this.props;
    const { isPickImage, keyword } = this.state;
    const users = navigation.getParam('users');
    const str = keyword.trim();
    if (str.length < 3) {
      return showAlert('Enter more than 4 characters');
    }
    this.setState({ isLoader: true });
    const occupants_ids = users.map(elem => elem.id);
    ChatService.createPublicDialog(occupants_ids, str, isPickImage)
      .then((newDialog) => {
        this.setState({ isLoader: false });
        navigation.dispatch(popToTop);
        navigation.push('Chat', { dialog: newDialog, isNeedFetchUsers: true });
      });
  }

  onPickImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      this.setState({ isPickImage: image });
    });
  }

  updateSearch = keyword => this.setState({ keyword })

  render() {
    const { isPickImage, isLoader, search } = this.state;
    const { navigation } = this.props;
    const users = navigation.getParam('users');

    return (
      <View style={styles.container}>
        {isLoader
          && <Indicator color="blue" size={40} />}
        <View style={styles.header}>
          <TouchableOpacity onPress={this.onPickImage} style={styles.picker}>
            {isPickImage ? (
              <Image
                style={styles.imgPicker}
                source={{ uri: isPickImage.path }}
              />
            )
              : (
                <View style={styles.iconPicker}>
                  <Icon name="local-see" size={50} color="#48A6E3" />
                </View>
              )}
          </TouchableOpacity>
          <View style={styles.description}>
            <TextInput
              style={styles.searchInput}
              autoCapitalize="none"
              placeholder="Group name..."
              returnKeyType="search"
              onChangeText={this.updateSearch}
              placeholderTextColor="grey"
              value={search}
              maxLength={255}
            />
            <Text style={styles.descriptionText}>Please provide a group subject and optional group icon</Text>
          </View>
        </View>
        <View style={styles.participantsContainer}>
          {users.map(elem => this.renderParticipant(elem))}
        </View>
        <CreateBtn goToScreen={this.createDialog} type={BTN_TYPE.CREATE_GROUP} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginVertical: 20,
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  participant: {
    width: 72,
    padding: 5,
    height: 100,
  },
  searchInput: {
    fontSize: 18,
    color: 'black',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  picker: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  iconPicker: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#48A6E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgPicker: {
    width: 70,
    height: 70,
    borderRadius: 40,
  },
  description: {
    width: SIZE_SCREEN.width - 110,
  },
  descriptionText: {
    paddingVertical: 5,
    color: 'grey',
    fontSize: 15,
  },
});
