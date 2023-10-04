import { Link } from 'react-router-dom';
import { Inputs } from './Registration';
import { useAppSelector } from '../../redux/hooks';
import { FieldErrors, SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
type HandleSubmitProp = UseFormHandleSubmit<Inputs>;

interface IRegisterButton {
  errors: FieldErrors;
  type: string;
  onSubmit: (some: object) => void;
  handleSubmit: HandleSubmitProp;
}

const RegisterButton: React.FC<IRegisterButton> = ({}) => {
  return (
    <div>
      <button type={'submit'} className="RegisterBtn">
        Register
      </button>
    </div>
  );
};

export default RegisterButton;
