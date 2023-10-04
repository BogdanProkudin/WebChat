import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
import { LoginResponse } from './Auth';
import { User } from '../../components/SideBar/UserList';

interface ChatParticipant {
  id?: string; // User ID
  username: string;
}

interface ChatMessage {
  sender: string; // User ID
  content: string;
  timestamp: string;
  isRead: boolean;
}
interface CurrentChat {
  _id: string;
  members: ChatParticipant[];
  messages: ChatMessage[];
}
interface CreateChatResponse {
  chat: any;
  _id: string; // Chat ID
  members: ChatParticipant[];
  messages: ChatMessage[];
}

interface ChatsState {
  data: ChatParticipant[];
  status: 'idle' | 'loading' | 'completed' | 'error';
  error: string | null;
  inChat: boolean;
  chatId: string;
  CurrentChat: CurrentChat;
  Messages: ChatMessage[];
  Companion: string;
  friends: User[];
  messageId: string;
  activeUsers: any;
  userinChat: boolean;
  showModal: boolean;
  allInChat: boolean;
}

const initialState: ChatsState = {
  data: [],
  status: 'idle',
  inChat: false,
  error: null,
  chatId: '',
  CurrentChat: {
    _id: '',
    members: [],
    messages: [{ sender: '', content: '', timestamp: '', isRead: false }]
  },
  Messages: [{ sender: '', content: '', timestamp: '', isRead: false }],
  Companion: '',
  friends: [],
  messageId: '',
  activeUsers: [],
  userinChat: false,
  showModal: false,
  allInChat: false
};

export const createChat = createAsyncThunk<CreateChatResponse, object, { rejectValue: any }>(
  'chats/createChat',
  async (members, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<CreateChatResponse>(
        'http://localhost:3333/CreateChat',
        {
          members
        },

        {
          headers: {
            Authorization: `Bearer ${token}` // Добавляем токен в заголовок запроса
          }
        }
      );

      console.log(response, 'Response');
      if (response.status === 200) {
        axios
          .get('http://localhost:3333/getMessages', {
            params: { id: response.data.chat._id }
          })
          .then(res => {
            return res.data;
          })

          .catch(error => {
            console.error('error when tried get message on front REDUX', { error });
          });
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'An error occurred' });
    }
  }
);

// actions.js

const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setInChat: (state, action) => {
      state.inChat = action.payload;
    },
    setChatId: (state, action) => {
      state.chatId = action.payload;
    },
    setMessages: (state, action) => {
      state.Messages = action.payload;
    },
    setCompanion: (state, action) => {
      state.Companion = action.payload;
    },
    setFriends: (state, action) => {
      state.friends = action.payload;
    },
    setMessagesId: (state, action) => {
      state.messageId = action.payload;
    },
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    setIsUserInChat: (state, action) => {
      state.userinChat = action.payload;
    },
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
    setAllinChat: (state, action) => {
      state.allInChat = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(createChat.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.status = 'completed';
        state.Messages = action.payload.chat.messages;
        console.log(action.payload, '!@#!@#!@#');

        state.chatId = action.payload._id;

        state.error = null;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.status = 'error';
        console.log(action.payload, 'ERORRORS');

        state.error = action.payload ? action.payload.message : 'An error occurred';
      });
  }
});
export const {
  setInChat,
  setMessages,
  setCompanion,
  setFriends,
  setChatId,
  setMessagesId,
  setActiveUsers,
  setIsUserInChat,
  setShowModal,
  setAllinChat
} = chatSlice.actions;

export default chatSlice.reducer;
