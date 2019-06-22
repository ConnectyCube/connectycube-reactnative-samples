import React, { Component } from 'react'
import { RefreshControl, StatusBar, FlatList, StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux'
import Dialog from './Dialog'
import Chat from '../../services/ChatService'
import { fetchDialogs } from '../../actions/dialogs'

class DialogsScreen extends Component {
	state = {
		refreshing: false
	}

	_onRefresh = () => {
    this.setState({refreshing: true})
		
		Chat.getConversations()
			.then(dialogs => {
				this.props.fetchDialogs(dialogs)
				this.setState({refreshing: false})
			})
			.catch(e => alert(`Error.\n\n${JSON.stringify(e)}`))
  }
	
	_renderRefreshControl() {
		return (
			<RefreshControl
				colors={["red", "green", "blue"]}
				refreshing={this.state.refreshing}
				onRefresh={this._onRefresh} />
		)
	}
	
	_renderDialog(dialog) {
		return <Dialog dialog={ dialog } />
	}

	render() {
		const { dialogs } = this.props

		return (
			<View style={styles.container}>
				<StatusBar backgroundColor="blue" barStyle="light-content" animated/>
				{ 
					!dialogs.length && 
					<View style={styles.noChats}>
						<Text style={styles.noChatsText}>No chats yet</Text>
					</View>
				}
				<FlatList
					data={dialogs}
					keyExtractor={ item => item.id }
					renderItem={ ({ item }) => this._renderDialog(item) }
					refreshControl={this._renderRefreshControl()}
				/>
			</View>
		)
	}
}

const mapStateToProps = (state) => ({
	dialogs: state.dialogs
})

const mapDispatchToProps = (dispatch) => ({
	fetchDialogs: dialogs => dispatch(fetchDialogs(dialogs))
})

export default connect(mapStateToProps, mapDispatchToProps)(DialogsScreen)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white'
	},
	noChats: {
		position: 'absolute',
		alignSelf: 'center',
		top: '42%'
	},
	noChatsText: {
		fontSize: 20
	}
})