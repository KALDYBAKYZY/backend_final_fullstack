const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const rooms = new Map();
const onlineUsers = new Map();

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    // Authenticate via token in query string: /ws?token=...
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    let user;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id).select('username avatar _id');
      if (!user) return ws.close(4001, 'Unauthorized');
    } catch {
      return ws.close(4001, 'Unauthorized');
    }

    const clientInfo = { ws, userId: user._id.toString(), username: user.username, avatar: user.avatar };
    onlineUsers.set(user._id.toString(), ws);

    ws.on('message', async (raw) => {
      let data;
      try { data = JSON.parse(raw); } catch { return; }
      console.log('WS received:', data.type, 'from:', clientInfo.username)
      switch (data.type) {
        case 'join_room': {
          const roomId = data.roomId;
          if (!rooms.has(roomId)) rooms.set(roomId, new Set());
          
          const roomSet = rooms.get(roomId);
          
          // Удали мёртвые соединения
          for (const client of roomSet) {
            if (client.ws.readyState !== WebSocket.OPEN) {
              roomSet.delete(client);
            }
          }
          
          // Удали старую запись этого же юзера если есть
          for (const client of roomSet) {
            if (client.userId === clientInfo.userId) {
              roomSet.delete(client);
            }
          }
          
          roomSet.add(clientInfo);
          clientInfo.currentRoom = roomId;
          
          console.log('join_room:', clientInfo.username, 'roomId:', roomId)
          console.log('room members now:', roomSet.size)
          
          broadcastToRoom(roomId, {
            type: 'online_users',
            users: getRoomOnlineUsers(roomId),
          });
          break;
        }

        case 'delete_message': {
          const { roomId, messageId } = data;
          broadcastToRoom(roomId, {
            type: 'delete_message',
            messageId,
          }, clientInfo.ws);
          break;
        }

        case 'leave_room': {
          leaveRoom(clientInfo);
          break;
        }

        case 'chat_message': {
          const { roomId, content } = data;
          console.log('chat_message from:', clientInfo.username, 'roomId:', roomId)
          console.log('room exists:', rooms.has(roomId), 'members:', rooms.get(roomId)?.size)
          broadcastToRoom(roomId, {
            type: 'chat_message',
            message: {
              content,
              sender: { _id: clientInfo.userId, username: clientInfo.username, avatar: clientInfo.avatar },
              createdAt: new Date().toISOString(),
              room: roomId,
            },
          }, clientInfo.ws);
          break;
        }

        case 'note_update': {
          // Broadcast live note edits to a room
          const { roomId, noteId, content, title } = data;
          broadcastToRoom(roomId, {
            type: 'note_update',
            noteId, content, title,
            updatedBy: clientInfo.username,
          }, clientInfo.ws);   // exclude sender
          break;
        }

        case 'typing': {
          broadcastToRoom(data.roomId, {
            type: 'typing',
            username: clientInfo.username,
            isTyping: data.isTyping,
          }, ws);
          break;
        }
      }
    });

    ws.on('close', () => {
      onlineUsers.delete(user._id.toString());
      leaveRoom(clientInfo);
    });
  });
}

function leaveRoom(clientInfo) {
  if (!clientInfo.currentRoom) return;
  const roomId = clientInfo.currentRoom;
  const set = rooms.get(roomId);
  if (set) {
    set.delete(clientInfo);
    if (set.size === 0) rooms.delete(roomId);
    else broadcastToRoom(roomId, { type: 'online_users', users: getRoomOnlineUsers(roomId) });
  }
  clientInfo.currentRoom = null;
}

function broadcastToRoom(roomId, payload, exclude = null) {
  const set = rooms.get(roomId);
  if (!set) return;
  const msg = JSON.stringify(payload);
  set.forEach(({ ws, userId }) => {
    if (ws !== exclude && ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

function getRoomOnlineUsers(roomId) {
  const set = rooms.get(roomId);
  if (!set) return [];
  return [...set].map(({ userId, username, avatar }) => ({ userId, username, avatar }));
}

module.exports = { initWebSocket };