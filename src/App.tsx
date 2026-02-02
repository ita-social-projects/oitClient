import {Route, Routes} from 'react-router-dom';
import './App.css'
import Home from "./pages/public/Home.tsx";
import {Layout} from "./Layout.tsx";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home/>}/>
            </Route>
        </Routes>
    );
}
