import {Header} from "./pages/public/Header.tsx";
import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
        </>
    );
}