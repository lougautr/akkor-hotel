import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => <div>{children}</div>,
}));

import Login from '../components/Login';

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'mockToken' }),
    })
);

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ token: 'mockToken' }),
            })
        );
    });

    test('submits login form and navigates on success', async () => {
        render(<Login />);

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testUser' } });
            fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });

            await waitFor(() => expect(screen.getByTestId('login-button')).toBeInTheDocument());

            fireEvent.click(screen.getByTestId('login-button'));
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:8000/users/login",
            expect.objectContaining({
                method: "POST",
            })
        );

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    });
});