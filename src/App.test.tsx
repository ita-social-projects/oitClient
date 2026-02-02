import App from "./App.tsx";
import {render, screen} from '@testing-library/react';

describe("App", () => {
    test('should create', () => {
        render(<App/>);
        expect(screen.getByText('Click on', { exact: false })).toBeInTheDocument();
    });
});