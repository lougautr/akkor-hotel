import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => <div>{children}</div>, 
}));

import Register from '../components/Register';

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
    })
);

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Success' }),
            })
        );
    });

    test('submits register form with valid data and navigates to login', async () => {
        render(<Register />);

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testUser' } });

            const passwordInputs = screen.getAllByPlaceholderText(/password/i);
            fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
            fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

            await waitFor(() => expect(screen.getByTestId('register-button')).toBeInTheDocument());

            fireEvent.click(screen.getByTestId('register-button'));
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:8000/users/",
            expect.objectContaining({
                method: "POST",
            })
        );

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    });
});