# StudyHub — Backend

REST API + WebSocket server for StudyHub collaborative study platform.

## 🔗 Live URL
https://backend-final-fullstack.onrender.com

## 🛠 Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- WebSocket (ws library)
- Jest + Supertest (testing)

## 📁 Project Structure
backend/
├── src/
│   ├── models/          # Mongoose models (User, Room, Note, Message, FileAttachment)
│   ├── routes/          # Express routes (auth, rooms, notes, messages, files)
│   ├── middleware/       # JWT auth middleware
│   ├── utils/           # Helper functions
│   └── websocket/       # WebSocket server
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
└── server.js

## ⚙️ Environment Variables
Create a `.env` file in the root:
PORT=5002
MONGO_URI=mongodb://localhost:27017/studyhub
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000

## 🚀 Setup & Run
```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run in production
npm start

# Run tests
npm test
```

## 🗄 Database Models
- **User** — authentication, profile, avatar
- **Room** — study rooms with members (many-to-many)
- **Note** — personal notes with attachments (one-to-many)
- **Message** — chat messages in rooms (one-to-many)
- **FileAttachment** — uploaded files linked to notes/rooms

## 🔌 WebSocket Events
|      Event       |      Description      |
|------------------|-----------------------|
| `join_room`      | Join a study room     |
| `leave_room`     | Leave a study room    |
| `chat_message`   | Send a message        |
| `delete_message` | Delete a message      |
| `online_users`   | Get online users list |
| `typing`         | Typing indicator      |
