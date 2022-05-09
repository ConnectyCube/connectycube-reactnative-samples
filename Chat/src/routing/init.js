import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { createSwitchNavigator, createAppContainer, StackActions } from 'react-navigation'
import {
  Text
} from 'react-native'
import Auth from '../screens/auth'
import Dialogs from '../screens/main/dialogs'
import AppWrap from '../screens/appWrap'
import Settings from '../screens/main/settings/index'
import Chat from '../screens/main/chat/index'
import Contacts from '../screens/main/contacts/index'
import CreateDialog from '../screens/main/contacts/createDialog'
import GroupDetails from '../screens/main/chat/groupDetails'
import ContactDetails from '../screens/main/chat/contactDetails'

const Navigation = createAppContainer(createSwitchNavigator(
  {
    AppWrap,
    Auth: createStackNavigator({
      Auth: {
        screen: Auth,
        navigationOptions: {
          headerShown: false
        }
      }
    }),
    Main: createStackNavigator({
      Dialogs: {
        screen: Dialogs
      },
      Settings: {
        screen: Settings,
        navigationOptions: {
          headerTitle: () => (
            <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
              Settings
            </Text>
          ),
        }
      },
      Chat: {
        screen: Chat,
      },
      Contacts: {
        screen: Contacts,
        navigationOptions: {
          headerTitle: () => (
            <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
              Contacts
            </Text>
          ),
        }
      },
      CreateDialog: {
        screen: CreateDialog,
        navigationOptions: {
          headerTitle: () => (
            <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
              New group
            </Text>
          ),
        }
      },
      GroupDetails: {
        screen: GroupDetails,
        navigationOptions: {
          headerTitle: () => (
            <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
              Group details
            </Text>
          ),
        }
      },
      ContactDetails: {
        screen: ContactDetails,
        navigationOptions: {
          headerTitle: () => (
            <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
              Contact details
            </Text>
          ),
        }
      }
    }),
  },
  {
    initialRouteName: 'AppWrap',
  }
))
export default Navigation;

export const popToTop = StackActions.popToTop()