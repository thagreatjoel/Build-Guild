const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Load approved emails
const loadApprovedEmails = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    const json = JSON.parse(data);
    return new Set(json.approvedEmails);
  } catch (err) {
    console.error('Error loading emails:', err);
    return new Set();
  }
};

// Save approved emails
const saveApprovedEmails = (emailsSet) => {
  const data = {
    approvedEmails: Array.from(emailsSet)
  };
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

// Add a new email
const addApprovedEmail = (email) => {
  const emails = loadApprovedEmails();
  if (!emails.has(email.toLowerCase())) {
    emails.add(email.toLowerCase());
    saveApprovedEmails(emails);
    return true;
  }
  return false;
};

// Remove an email
const removeApprovedEmail = (email) => {
  const emails = loadApprovedEmails();
  if (emails.has(email.toLowerCase())) {
    emails.delete(email.toLowerCase());
    saveApprovedEmails(emails);
    return true;
  }
  return false;
};

// Check if email is approved
const isApprovedEmail = (email) => {
  const emails = loadApprovedEmails();
  return emails.has(email.toLowerCase());
};

// Get all approved emails
const getAllApprovedEmails = () => {
  return Array.from(loadApprovedEmails());
};

module.exports = {
  loadApprovedEmails,
  saveApprovedEmails,
  addApprovedEmail,
  removeApprovedEmail,
  isApprovedEmail,
  getAllApprovedEmails
};
