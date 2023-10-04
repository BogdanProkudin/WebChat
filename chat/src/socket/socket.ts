import io from 'socket.io-client';

const socket = io('http://localhost:3333'); // Создание сокета

export default socket;
