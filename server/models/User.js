// /server/models/User.js

class User {
  constructor(userId, username, email) {
    this.userId = userId;
    this.username = username;
    this.email = email;
  }

  getRole() {
    return "user";
  }

  getSummary() {
    return `${this.username} (${this.email})`;
  }
}

module.exports = User;
