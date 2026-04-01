const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

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

const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2));
};

const getUserByEmail = (email) => {
  const users = loadUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

const getAllApprovedEmails = () => {
  const users = loadUsers();
  return users.map(u => u.email);
};

const isApprovedEmail = (email) => {
  const users = loadUsers();
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
};

const addApprovedEmail = (email, username, name = '') => {
  const users = loadUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return false;
  }
  users.push({
    email: email.toLowerCase(),
    username: username || email.split('@')[0],
    name: name || username || email.split('@')[0],
    score: 0
  });
  saveUsers(users);
  return true;
};

const getUsernameByEmail = (email) => {
  const user = getUserByEmail(email);
  return user ? user.username : email.split('@')[0];
};

const getDisplayNameByEmail = (email) => {
  const user = getUserByEmail(email);
  return user ? user.name : email.split('@')[0];
};

module.exports = {
  loadUsers,
  getUserByEmail,
  getAllApprovedEmails,
  isApprovedEmail,
  addApprovedEmail,
  getUsernameByEmail,
  getDisplayNameByEmail
};
