import { useEffect, useState } from 'react';
import { AnimatedLineProgressBar } from '@frogress/line';
import imageNoError from '../icons/galka.png';
import ImageError from '../icons/2939478.png';
import closeImage from '../icons/close.png';
import Modal from 'react-modal';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setShowModal } from '../../redux/slices/Chat';
type MessageDeletedChatProps = {
  message: string;
  isError: boolean;
};
const MessageError: React.FC<MessageDeletedChatProps> = ({ message, isError }) => {
  const [percent, setPercent] = useState(100);
  const showModal = useAppSelector(state => state.Chat.showModal);
  const dispatch = useAppDispatch();

  Modal.setAppElement('#root');
  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(prevPercent => {
        if (prevPercent > 0) {
          return prevPercent - 1;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, 30); // Здесь 30 миллисекунд для анимации в течение 3 секунд (100 миллисекунд / 3 секунды)
    if (percent === 10) {
      console.log('закончился');

      dispatch(setShowModal(false));
    }
    return () => clearInterval(interval);
  }, [percent]);

  function closeModal() {
    console.log('clicked');

    dispatch(setShowModal(false));
  }

  return (
    <Modal
      style={{
        overlay: { backgroundColor: 'none', zIndex: 999 },
        content: { backgroundColor: isError ? 'rgb(199, 48, 48)' : 'green' }
      }}
      overlayClassName={''}
      className={'ChatDeletedModal'}
      onRequestClose={closeModal}
      isOpen={showModal}
    >
      <motion.div
        initial={{ width: `${percent}%` }}
        animate={{ width: '0%' }}
        transition={{ duration: 3, ease: 'linear' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '240px',
            zIndex: '999'
          }}
        >
          <img
            style={{ height: '25px', width: '25px', marginTop: '8.5px' }}
            src={!isError ? imageNoError : ImageError}
          ></img>
          <h1
            style={{
              fontSize: '16px',
              color: 'white',
              width: '200px',
              fontWeight: '800',
              fontFamily: 'Open Sans'
            }}
          >
            {message}
          </h1>
          <img
            onClick={() => closeModal()}
            style={{ height: '25px', width: '25px', marginRight: '-30px' }}
            src={closeImage}
          ></img>
        </div>
        <AnimatedLineProgressBar
          percent={percent}
          rounded={36}
          height={10}
          progressColor="linear-gradient(to right, #ff655b 60%, #fd297b)"
          transition={{ easing: 'linear' }}
        />
      </motion.div>
    </Modal>
  );
};
export default MessageError;
