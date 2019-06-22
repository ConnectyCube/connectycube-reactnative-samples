class ContactsCollection {
	constructor(contacts = {}) {
		this.contacts = contacts
	}

	set = data => Object.assign(this.contacts, data)

	get = id => (id ? this.contacts[id] : Object.values(this.contacts))
}

// create instance
const Contacts = new ContactsCollection()

// lock instance
Object.freeze(Contacts)

export default Contacts