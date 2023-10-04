// models/chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  members: [
    {
      type: Array,
      ref: 'User',
      required: true
    }
  ],
  messages: [
    {
      sender: {
        type: String,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      isRead: { type: Boolean, require: true, default: true }
    }
  ],
  activeUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

export const ChatModel = mongoose.model('Chat', chatSchema);
