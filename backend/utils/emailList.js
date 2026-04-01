const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Load all users with their usernames
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    const json = JSON.parse(data);
    return json.users || [];
  } catch (err) {
    console.error('Error loading users:', err);
    return [];
  }
};

// Get user info by email
const getUserByEmail = (email) => {
  const users = loadUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// Get all approved emails
const getAllApprovedEmails = () => {
  const users = loadUsers();
  return users.map(u => u.email);
};

// Check if email is approved
const isApprovedEmail = (email) => {
  const users = loadUsers();
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
};

// Add a new user with username
const addUser = (email, username, name = '') => {
  const users = loadUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return false;
  }
  users.push({
    email: email.toLowerCase(),
    username: username || email.split('@')[0],
    name: name || username || email.split('@')[0]
  });
  fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2));
  return true;
};

// Get username by email
const getUsernameByEmail = (email) => {
  const user = getUserByEmail(email);
  return user ? user.username : email.split('@')[0];
};

// Get display name by email
const getDisplayNameByEmail = (email) => {
  const user = getUserByEmail(email);
  return user ? user.name : email.split('@')[0];
};

module.exports = {
  loadUsers,
  getUserByEmail,
  getAllApprovedEmails,
  isApprovedEmail,
  addUser,
  getUsernameByEmail,
  getDisplayNameByEmail
};
