const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

function validatePassword(password) {
  return passwordRegex.test(password);
}

module.exports = validatePassword;
