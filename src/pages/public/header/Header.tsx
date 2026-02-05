import LangButton from '@components/LangButton/LangButton';
import { Link, useNavigate } from 'react-router-dom';

import styles from './Header.module.scss';

export function Header() {
    const navigate = useNavigate();

    return (
        <header className={styles.header}>
            <div className='relative w-full flex items-center justify-end gap-4'>
                <nav className='flex gap-7.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <Link to="/" className={styles.link}>Home</Link>
                    <Link to="/news" className={styles.link}>News</Link>
                </nav>
                <LangButton className="btn-stroked" variant="short"/>
                <button className="btn-regular" onClick={() => navigate('/login')}>Login/Register</button>
            </div>
        </header>
    );
}