import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminUsers from '../components/AdminUsers';

// Mock Fetch API globally
global.fetch = jest.fn();

// Mock useNavigate
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
    Link: ({ children }) => <div>{children}</div>,
}));

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {}); 
});

describe('AdminUsers Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("token", "mockToken");

        fetch.mockImplementation((url) => {
            if (url.includes("/users")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [{ id: 1, email: 'user@example.com', pseudo: 'User123', is_admin: false }],
                });
            }
            return Promise.reject(new Error("Unexpected API call"));
        });
    });

    test('renders the AdminUsers component', async () => {
        await act(async () => {
            render(<AdminUsers />);
        });

        expect(screen.getAllByText('Users Management').length).toBeGreaterThan(0);

        await screen.findByText('user@example.com'); // ✅ Corrected
    });

    test('opens edit modal', async () => {
        await act(async () => {
            render(<AdminUsers />);
        });

        await waitFor(() => screen.getByTestId('edit-user-button-1'));
        const editButton = screen.getByTestId('edit-user-button-1');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 3, name: 'Edit User' })).toBeInTheDocument();
        });
    });
});