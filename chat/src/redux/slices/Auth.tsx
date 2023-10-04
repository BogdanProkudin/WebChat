import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { error, log } from 'console';
interface RegisterResponse {
  // Тип данных, которые приходят в ответ на успешную регистрацию
  // Например, поле message с сообщением об успешной регистрации
  message: string;
}
interface UserData {
  email: string;
  password: string;
  userName: string;
}
interface AuthState {
  [x: string]: any;
  data: null;

  status: string;

  RegisterError: {
    emailError?: string;
    userNameError?: string;
  } | null;
  LoginError: null;
}
const initialState: AuthState = {
  data: null,
  status: 'loading',

  RegisterError: null,
  LoginError: null
};
export interface LoginResponse {
  message: string;
  userId: string;
  token: string;
}
export type ParamsType = {
  email: string;
  password: string;
};

interface LoginError {
  message: string;
}

interface RegisterError {
  message?: string;
  emailError?: string;
  userNameError?: string;
}
interface LoginError {
  message: string;
  error?: string;
}
export const fetchUserData = createAsyncThunk<
  RegisterResponse,
  object,
  { rejectValue: RegisterError }
>('Registration/fetchUserData', async (params, { rejectWithValue }) => {
  try {
    const response = await axios.post<RegisterResponse>(
      'http://localhost:3333/Registration',
      params
    );

    return response.data;
  } catch (error: any | unknown) {
    // Обработка ошибки и передача сообщения на фронтенд
    const customError: RegisterError = {};
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<RegisterError>;

      if (axiosError.response && axiosError.response.data) {
        console.log('BOS', axiosError.response.data);

        if (axiosError.response.data.emailError === 'Email already taken') {
          customError.emailError = 'Email already taken';
        }
        if (axiosError.response.data.userNameError === 'UserName already taken') {
          customError.userNameError = 'UserName already taken';
        }
        console.log(customError, 1222222222);

        return rejectWithValue(customError);
      }
    }
    return rejectWithValue(customError);
  }
});

export const userLogin: any = createAsyncThunk<
  LoginResponse,
  object,
  {
    rejectValue: LoginError | string;
  }
>('Login', async (params, { rejectWithValue }) => {
  try {
    const response = await axios.post<LoginResponse>('http://localhost:3333/Login', params);

    const token: string | undefined = response.data.token;

    if (token) {
      localStorage.setItem('token', token);
    }

    if (!token) {
      return rejectWithValue('Неверная почта или пароль');
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Обработка ошибки Axios
      const axiosError = error as AxiosError<LoginError>;
      if (axiosError.response && axiosError.response.data) {
        // Ошибка с ответом сервера
        return rejectWithValue(axiosError.response.data);
      }
    }
    // Общая ошибка
    return rejectWithValue({ message: 'An error occurred' });
  }
});

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: {
    ['Registration/fetchUserData/pending']: state => {
      state.status = 'loading';
      state.RegisterError = null;
    },
    ['Registration/fetchUserData/fulfilled']: (state, action) => {
      state.status = 'completed';
      state.data = action.payload;
      state.RegisterError = null;
    },
    ['Registration/fetchUserData/rejected']: (state, action) => {
      state.status = 'error';
      state.RegisterError = action.payload;
    },
    [userLogin.pending]: state => {
      state.status = 'loading';
      state.LoginError = null;
    },
    [userLogin.fulfilled]: (state, action) => {
      state.status = 'completed';
      state.data = action.payload;

      state.LoginError = null;
    },
    [userLogin.rejected]: (state, action) => {
      state.status = 'error';
      state.LoginError = action.payload;
    }
  }
});

export const auth = AuthSlice.reducer;
