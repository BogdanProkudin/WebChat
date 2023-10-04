import { useState } from 'react';
import { FieldErrors } from 'react-hook-form';
type PasswordInputProps = {
  register: any;
  errors: FieldErrors;
};
const PasswordInput: React.FC<PasswordInputProps> = ({ register, errors }) => {
  const [showPassowrd, setShowPassword] = useState<boolean>(false);
  return (
    <>
      <input
        {...register('password', {
          required: 'Поле должно быть заполнено'
        })}
        className="email-input"
        placeholder="Password"
        type={showPassowrd ? 'text' : 'password'}
      />
      <button
        onClick={() => setShowPassword(!showPassowrd)}
        type="button"
        className="btnEye"
        aria-label="ViewMode Changer"
      >
        {showPassowrd ? (
          <svg className="EyeOpen" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <g fill="currentColor">
              <path d="M23.432,10.524C20.787,7.614,16.4,4.538,12,4.6,7.6,4.537,3.213,7.615.568,10.524a2.211,2.211,0,0,0,0,2.948C3.182,16.351,7.507,19.4,11.839,19.4h.308c4.347,0,8.671-3.049,11.288-5.929A2.21,2.21,0,0,0,23.432,10.524ZM7.4,12A4.6,4.6,0,1,1,12,16.6,4.6,4.6,0,0,1,7.4,12Z"></path>
              <circle cx="12" cy="12" r="2"></circle>
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" focusable="false" className="EyeOpen" aria-hidden="true">
            <g fill="currentColor">
              <path d="M23.2,10.549a20.954,20.954,0,0,0-4.3-3.6l4-3.995a1,1,0,1,0-1.414-1.414l-.018.018a.737.737,0,0,1-.173.291l-19.5,19.5c-.008.007-.018.009-.026.017a1,1,0,0,0,1.631,1.088l4.146-4.146a11.26,11.26,0,0,0,4.31.939h.3c4.256,0,8.489-2.984,11.051-5.8A2.171,2.171,0,0,0,23.2,10.549ZM16.313,13.27a4.581,4.581,0,0,1-3,3.028,4.3,4.3,0,0,1-3.1-.19.253.253,0,0,1-.068-.407l5.56-5.559a.252.252,0,0,1,.407.067A4.3,4.3,0,0,1,16.313,13.27Z"></path>
              <path d="M7.615,13.4a.244.244,0,0,0,.061-.24A4.315,4.315,0,0,1,7.5,12,4.5,4.5,0,0,1,12,7.5a4.276,4.276,0,0,1,1.16.173.244.244,0,0,0,.24-.062l1.941-1.942a.254.254,0,0,0-.1-.421A10.413,10.413,0,0,0,12,4.75C7.7,4.692,3.4,7.7.813,10.549a2.15,2.15,0,0,0-.007,2.9,21.209,21.209,0,0,0,3.438,3.03.256.256,0,0,0,.326-.029Z"></path>
            </g>
          </svg>
        )}
      </button>
    </>
  );
};

export default PasswordInput;
