import useMediaQuery from '@mui/material/useMediaQuery';
import React, { SetStateAction, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-edit';
import Modal from 'react-modal';
import Cropper, { Area } from 'react-easy-crop';
type AvatarEditComponentProps = {
  image: string | null;
  setImage: SetStateAction<any>;
  fileInputRef: any;
  preview: any;
  setPreview: any;
  setIsEditorOpen: any;
  isEditorOpen: any;
  isModalOpen: boolean;
  setIsModalOpen: any;
};

const AvatarEditComponent: React.FC<AvatarEditComponentProps> = ({
  image,
  setImage,
  fileInputRef,
  setPreview,
  isEditorOpen,
  setIsEditorOpen,
  preview,
  setIsModalOpen,
  isModalOpen
}) => {
  const imageRef = useRef<any>();
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const handleCrop = (dataUrl: string) => {
    setPreview(dataUrl);
  };
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // Начальные координаты кропа
  const [zoom, setZoom] = useState(1);
  const [CroppedAreaPixels, setCroppedAreaPixels] = useState({});
  const getCroppedImg = async (imageSrc: any, croppedAreaPixels: any) => {
    const image = new Image();
    image.src = imageSrc;

    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');

    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return canvas.toDataURL('image/jpeg'); // Возвращает base64 изображения
  };
  const handleSave = async () => {
    setIsEditorOpen(false);
    setIsModalOpen(false);
    const croppedImage = await getCroppedImg(image, CroppedAreaPixels);
    setImage(croppedImage);
    console.log(image);
  };
  const onClose = () => {
    setIsEditorOpen(false);
    setImage(null);
  };

  function CropComplete(croppedArea: Area, croppedAreaPixels: Area): void {
    setCroppedAreaPixels(croppedAreaPixels);
  }

  return (
    <div>
      <Modal
        style={modalStyles as Modal.Styles}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <div className="">
          {image && isEditorOpen && (
            <div style={editorContainerStyles as any}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop} // Обновляем координаты кропа
                onZoomChange={setZoom}
                onCropComplete={CropComplete}
                cropShape="round"
                zoomWithScroll={true}
                showGrid={false}
                cropSize={{ width: 300, height: 300 }}
              />
            </div>
          )}

          {isEditorOpen && (
            <div className="wrapper">
              <button onClick={handleSave} className="SubmitBtn">
                <span>Submit</span>
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AvatarEditComponent;

const modalStyles = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  content: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
    padding: '20px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    maxWidth: '90%',
    maxHeight: '100%',
    height: '400px',
    minWidth: '310px',

    overflow: 'auto'
  }
};

const editorContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '360px',
  alignItems: 'center',
  borderRadius: '8px'
};

const borderRadius = {
  borderRadius: '100px'
};
