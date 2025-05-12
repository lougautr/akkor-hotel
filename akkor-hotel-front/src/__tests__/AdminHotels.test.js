import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminHotels from '../components/AdminHotels';

// Mock Fetch API globally
global.fetch = jest.fn();

// Mock useNavigate
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
    Link: ({ children }) => <div>{children}</div>,
}));

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    console.error.mockRestore();
});

describe('AdminHotels Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("token", "mockToken");

        fetch.mockImplementation((url) => {
            if (url.includes("/hotels")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [{ id: 1, name: 'Hotel Paradise', address: 'New York', rating: 5, breakfast: true }],
                });
            }
            return Promise.reject(new Error("Unexpected API call"));
        });
    });

    test('renders the AdminHotels component', async () => {
        await act(async () => {
            render(<AdminHotels />);
        });

        expect(screen.getAllByText('Hotels Management').length).toBeGreaterThan(0);

        await screen.findByText('Hotel Paradise'); // ✅ Corrected
    });

    test('opens edit modal', async () => {
        await act(async () => {
            render(<AdminHotels />);
        });

        await waitFor(() => screen.getByTestId('edit-hotel-button-1'));
        const editButton = screen.getByTestId('edit-hotel-button-1');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 3, name: 'Edit Hotel' })).toBeInTheDocument();
        });
    });
});