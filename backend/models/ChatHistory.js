import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['human', 'ai']
  },
  data: {
    content: {
      type: String,
      required: true
    },
    additional_kwargs: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [chatMessageSchema]
});

const ConversationModel = mongoose.model('Conversation', conversationSchema);

export default ConversationModel;