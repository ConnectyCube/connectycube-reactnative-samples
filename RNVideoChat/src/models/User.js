const defaultUser = {
	id: null,
	full_name: 'User',
	email: '',
	phone: '',
	avatar: null,
	custom_data: ''
}

export class User {
	constructor(user = defaultUser) {
		this.id = user.id
		this.full_name = user.full_name
		this.email = user.email
		this.phone = user.phone
		this.avatar = user.avatar && { uri: user.avatar }
		this.custom_data = user.custom_data && JSON.parse(user.custom_data)
	}
}
