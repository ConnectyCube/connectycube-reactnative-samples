import { users } from './config';

export function getUserById(userId, key) {
  const user = users.find(user => user.id == userId);

  if (typeof key === 'string') {
    return user[key];
  }

  return user;
};
