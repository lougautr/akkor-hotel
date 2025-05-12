import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminBookings from '../components/AdminBookings';

// Mock global de fetch
global.fetch = jest.fn();

// Mock de useNavigate et Link depuis react-router-dom
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

describe('AdminBookings Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("token", "mockToken");

        // Mock de fetch pour tous les endpoints utilisés par AdminBookings
        fetch.mockImplementation((url) => {
            if (url.includes("/bookings")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        { 
                          id: 1, 
                          user_id: 1, 
                          room_id: 1, 
                          start_date: '2025-03-15', 
                          end_date: '2025-03-16', 
                          nbr_people: 1, 
                          breakfast: true 
                        }
                    ],
                });
            }
            if (url.includes("/users/")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ pseudo: "JohnDoe" }),
                });
            }
            if (url.includes("/rooms/")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ hotel_id: 100 }),
                });
            }
            if (url.includes("/hotels/")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ name: "Hotel California", address: "42 Sunset Blvd" }),
                });
            }
            return Promise.reject(new Error("Unexpected API call: " + url));
        });
    });

    test('renders the AdminBookings component', async () => {
        await act(async () => {
            render(<AdminBookings />);
        });

        expect(screen.getAllByText('Bookings Management').length).toBeGreaterThan(0);

        await screen.findByText('2025-03-15'); 
    });

    test('opens view modal', async () => {
        await act(async () => {
            render(<AdminBookings />);
        });

        // Attendre que le bouton d'ouverture soit disponible
        await waitFor(() => screen.getByTestId('see-booking-button-1'));
        const viewButton = screen.getByTestId('see-booking-button-1');
        fireEvent.click(viewButton);

        // Attendre que le modal apparaisse et vérifier que le heading "Booking Details" est affiché
        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 3, name: 'Booking Details' })).toBeInTheDocument();
        });
    });
});