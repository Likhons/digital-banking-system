function generateAccountNumber() {
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `ACC${randomDigits}`;
}

module.exports = generateAccountNumber;