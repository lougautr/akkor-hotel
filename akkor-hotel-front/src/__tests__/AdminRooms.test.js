import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminRooms from '../components/AdminRooms';

// Mock Fetch API globally
global.fetch = jest.fn();

// Mock useNavigate
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
    useParams: () => ({ id: "1" }), // Mock de useParams
    Link: ({ children }) => <div>{children}</div>,
}));

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {}); 
});

afterAll(() => {
    console.error.mockRestore();
});

describe('AdminRooms Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("token", "mockToken");

        fetch.mockImplementation((url) => {
            if (url.includes("/hotels/")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ id: 1, name: 'Hotel Test' }),
                });
            }
            if (url.includes("/rooms/hotel/")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        { id: 101, price: 100, number_of_beds: 2 },
                        { id: 102, price: 120, number_of_beds: 3 },
                    ],
                });
            }
            return Promise.reject(new Error("Unexpected API call"));
        });
    });

    test('renders the AdminRooms component', async () => {
        await act(async () => {
            render(<AdminRooms />);
        });

        expect(screen.getAllByText('Rooms Management').length).toBeGreaterThan(0);

        await screen.findByText('Hotel Test');
    });

    test('opens edit modal', async () => {
        await act(async () => {
            render(<AdminRooms />);
        });

        await waitFor(() => screen.getByTestId('edit-room-button-101'));
        const editButton = screen.getByTestId('edit-room-button-101');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 3, name: 'Edit Room' })).toBeInTheDocument();
        });
    });

    test('opens delete modal', async () => {
        await act(async () => {
            render(<AdminRooms />);
        });

        await waitFor(() => screen.getByTestId('delete-room-button-101'));
        const deleteButton = screen.getByTestId('delete-room-button-101');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
        });
    });

    test('opens create modal', async () => {
        await act(async () => {
            render(<AdminRooms />);
        });

        const createButton = screen.getByTestId('create-room-button');
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 3, name: 'Create Room' })).toBeInTheDocument();
        });
    });
});
