import {
  LegacyRef,
  MouseEventHandler,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useRef,
  useState
} from 'react';
import './Registration.scss';
import Welcome from './Welcome';
import prevAvatar from '../icons/aaa.png';
import axios from 'axios';
import { useAppSelector } from '../../redux/hooks';
import { type } from 'os';
import Avatar from 'react-avatar-edit';
import UploadAvatar from './UploadAvatar';
import AvatarEditComponent from './UploadAvatar';
import useMediaQuery from '@mui/material/useMediaQuery';
import Compressor from 'compressorjs';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { userLogin } from '../../redux/slices/Auth';

const RegisterAvatarPage = () => {
  const [image, setImage] = useState<string | null>(null);

  const fileInputRef = useRef<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false); // Добавленное состояние
  const isCurrentUserString: string | null = localStorage?.getItem('CurrentUser');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isSmallScreen = useMediaQuery('(max-width: 390px)');
  const isCurrentUser: string | null = isCurrentUserString ? JSON.parse(isCurrentUserString) : null;
  const handleSubmitImage: React.MouseEventHandler<HTMLButtonElement> = async e => {
    try {
      const response = await axios.post(
        'http://localhost:3333/UploadAvatar',
        { isCurrentUser, image },
        {}
      );
      console.log('Загруженное изображение:', response.data);
      if (response.status === 200) {
        localStorage.setItem('CurrentUser', JSON.stringify(response.data.user));
        const responseLogin = await dispatch(userLogin(isCurrentUser));
        navigate('/Chat');
        if (responseLogin.payload?.token === undefined) {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const compressedFile: any = await compressImage(file);
      const compressedDataURL = URL.createObjectURL(compressedFile);
      const imageUrl = URL.createObjectURL(file);
      const imageSize: any = await getImageSize(imageUrl);

      if (imageSize.width > 5500 || imageSize.height > 5500) {
        console.error('Изображение слишком большое');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImage(compressedDataURL);
        setPreview(null);
        setIsEditorOpen(true);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  const compressImage = (file: File) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 800,
        maxHeight: 800,
        success(result) {
          resolve(result);
        },
        error(err) {
          reject(err);
        }
      });
    });
  };
  const getImageSize = (url: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  return (
    <div style={{ background: '#dbeef5', height: '100vh' }}>
      <div className="background">
        <div className="Register-window">
          <div className="row">
            <h1 className="Welcome-text">Choose your avatar</h1>

            <div
              className="photo-container"
              onClick={() => !isEditorOpen && fileInputRef.current?.click()} // Обратите внимание на ?. для безопасного вызова
            >
              <button className="setImageBtn">
                <input
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {!image && (
                  <div
                    style={{
                      background: `url(${prevAvatar})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', // Размер изображения
                      backgroundPosition: 'center center'
                    }}
                    className={'avatar-image'}
                  ></div>
                )}
                {image && (
                  <div>
                    <AvatarEditComponent
                      preview={preview}
                      setPreview={setPreview}
                      fileInputRef={fileInputRef}
                      image={image}
                      setImage={setImage}
                      setIsEditorOpen={setIsEditorOpen}
                      isEditorOpen={isEditorOpen}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                    />
                    {!isEditorOpen && <img className="avatar-image" src={image} />}
                  </div>
                )}
              </button>
            </div>

            {image && !isEditorOpen && (
              <button onClick={() => setImage(null)} className="deleteImg-btn">
                Delete Image
              </button>
            )}
            {image && !isEditorOpen ? (
              <button
                onClick={handleSubmitImage}
                style={{ top: !isSmallScreen ? '13px' : '1px' }}
                className="continiue-btn"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => navigate('/Chat')}
                style={{ top: !isSmallScreen ? '65px' : '40px' }}
                className="continiueDefault-btn"
              >
                Continue with default
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAvatarPage;
