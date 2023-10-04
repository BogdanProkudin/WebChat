import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  time: { type: Date, default: Date.now },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  isRead: { type: Boolean, default: false } // Поле для отслеживания прочтения
});

export const MessageModel = mongoose.model('Message', messageSchema);
