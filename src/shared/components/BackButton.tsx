import { Link } from 'react-router-dom';

interface BackButtonProps {
  text: string;
  to?: string;
}

export const BackButton = ({ text, to = '/' }: BackButtonProps) => {
  return (
    <Link to={to} className="hover:text-primary-100">
      <i className="fa-solid fa-angle-left"></i>
      <span className="ml-2">{text}</span>
    </Link>
  );
};
