import ConnectyCube from 'connectycube-reactnative'

class ChatService {
	// Chat - Core
	connect(user) {
		return new Promise((resolve, reject) => {
			if (!user) reject()

			ConnectyCube.chat.connect(
				{
					userId: user.id,
					password: user.password,
				},
				(error, contacts) => {
					if (!error && contacts) {
						resolve(contacts)
					} else {
						reject(error)
					}
				},
			)
		})
	}

	disonnect() {
		ConnectyCube.chat.disconnect()
	}
}

// create instance
const Chat = new ChatService()

// lock instance
Object.freeze(Chat)

export default Chat
