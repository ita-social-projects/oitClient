import { Link, useNavigate } from 'react-router-dom';

import styles from './Header.module.scss';

export function Header() {
    const navigate = useNavigate();

    return (
        <header>
            <div></div>
            <div className="flex-1"></div>
            <div className="flex gap-7.5">
                <Link to="/" className={styles.link}>Home</Link>
                <Link to="/news" className={styles.link}>News</Link>
            </div>
            <div className="flex-1"></div>
            <button className="btn-regular" onClick={() => navigate('/login')}>Login/Register</button>
        </header>
    );
}