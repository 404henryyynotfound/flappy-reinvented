// Authentication and database module using localStorage
class AuthManager {
  constructor() {
    this.currentUser = localStorage.getItem('flappy_current_user') || null;
  }

  signUp(username, password) {
    if (!username || !password) return { success: false, message: 'Fill in all fields!' };
    let users = JSON.parse(localStorage.getItem('flappy_users')) || {};
    
    if (users[username]) {
      return { success: false, message: 'Username already exists!' };
    }

    users[username] = {
      password: password,
      robins: 0,
      unlockedSkins: ['Classic Yellow'],
      currentSkin: 'Classic Yellow',
      unlockedLevels: 1,
      purchasedPerks: []
    };

    localStorage.setItem('flappy_users', JSON.stringify(users));
    return { success: true, message: 'Account created successfully!' };
  }

  signIn(username, password) {
    if (!username || !password) return { success: false, message: 'Fill in all fields!' };
    let users = JSON.parse(localStorage.getItem('flappy_users')) || {};

    if (!users[username] || users[username].password !== password) {
      return { success: false, message: 'Invalid username or password!' };
    }

    this.currentUser = username;
    localStorage.setItem('flappy_current_user', username);
    return { success: true, message: 'Signed in successfully!' };
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem('flappy_current_user');
  }

  getUserData() {
    if (!this.currentUser) return null;
    let users = JSON.parse(localStorage.getItem('flappy_users')) || {};
    return users[this.currentUser] || null;
  }

  saveUserData(data) {
    if (!this.currentUser) return;
    let users = JSON.parse(localStorage.getItem('flappy_users')) || {};
    if (users[this.currentUser]) {
      users[this.currentUser] = { ...users[this.currentUser], ...data };
      localStorage.setItem('flappy_users', JSON.stringify(users));
    }
  }
}

window.db = new AuthManager();
