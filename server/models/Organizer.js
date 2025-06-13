// /server/models/Organizer.js

const User = require("./User");

class Organizer extends User {
  constructor(userId, username, email, organizerId) {
    super(userId, username, email);
    this.organizerId = organizerId;
  }

  getRole() {
    return "organizer";
  }

  getOrganizerSummary() {
    return `Organizer: ${this.username} (ID: ${this.organizerId})`;
  }
}

module.exports = Organizer;
