import fs from 'fs';
import path from 'path';

const messagesFilePath = path.join(__dirname, 'messages.json');
const lockFilePath = path.join(__dirname, 'messages.lock');

// Helper function to read messages from the JSON file
function readMessagesFromFile() {
  if (fs.existsSync(messagesFilePath)) {
    const data = fs.readFileSync(messagesFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

// Helper function to write messages to the JSON file
function writeMessagesToFile(messages) {
  const data = JSON.stringify(messages, null, 2);
  fs.writeFileSync(messagesFilePath, data);
}

// Helper function to acquire a file lock
function acquireLock() {
  while (fs.existsSync(lockFilePath)) {
    // Wait for the lock to be released
  }
  fs.writeFileSync(lockFilePath, 'locked');
}

// Helper function to release a file lock
function releaseLock() {
  if (fs.existsSync(lockFilePath)) {
    fs.unlinkSync(lockFilePath);
  }
}

// Function to send a message
export function sendMessage(sender, recipient, content) {
  acquireLock();
  const messages = readMessagesFromFile();
  const newMessage = {
    id: messages.length + 1,
    sender,
    recipient,
    content,
    timestamp: new Date().toISOString()
  };
  messages.push(newMessage);
  writeMessagesToFile(messages);
  releaseLock();
}

// Function to receive messages for a specific user
export function receiveMessages(user) {
  acquireLock();
  const messages = readMessagesFromFile();
  const userMessages = messages.filter(message => message.recipient === user);
  releaseLock();
  return userMessages;
}

// Function to display messages in the UI
export function displayMessages(user) {
  const messages = receiveMessages(user);
  const messagesContainer = document.getElementById('messagesContainer');
  messagesContainer.innerHTML = '';
  messages.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="message-sender">${message.sender}</span>
        <span class="message-timestamp">${message.timestamp}</span>
      </div>
      <div class="message-content">${message.content}</div>
    `;
    messagesContainer.appendChild(messageElement);
  });
}

// Function to initialize the messaging system
export function initializeMessaging() {
  const sendMessageForm = document.getElementById('sendMessageForm');
  sendMessageForm.onsubmit = (e) => {
    e.preventDefault();
    const sender = document.getElementById('messageSender').value;
    const recipient = document.getElementById('messageRecipient').value;
    const content = document.getElementById('messageContent').value;
    sendMessage(sender, recipient, content);
    displayMessages(recipient);
  };
}
