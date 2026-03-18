import { Link } from 'react-router-dom';

interface BackButtonProps {
  text: string;
}

export const BackButton = ({ text }: BackButtonProps) => {
  return (
    <Link to="/" className="hover:text-primary-100">
      <i className="fa-solid fa-angle-left"></i>
      <span className="ml-2">{text}</span>
    </Link>
  );
};
