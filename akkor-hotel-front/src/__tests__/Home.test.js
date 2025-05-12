import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../components/Home';

global.fetch = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('Home Component', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    
    afterAll(() => {
        console.error.mockRestore();
        console.warn.mockRestore();
        console.log.mockRestore();
    });
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders Home component without crashing', () => {
        render(<Home />);
        expect(screen.getByText('Book Smart, Stay Better')).toBeInTheDocument();
    });

    test('fetches hotels successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, name: 'Hotel Paradise', address: 'New York' }],
        });

        await act(async () => {
            render(<Home />);
        });

        await waitFor(() => expect(fetch).toHaveBeenCalled());

        expect(screen.getByTestId('hotel-list')).toBeInTheDocument();
    });

    test('handles fetch errors gracefully', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => { throw new Error('Failed to fetch hotels'); },
        });

        await act(async () => {
            render(<Home />);
        });

        await waitFor(() => expect(fetch).toHaveBeenCalled());

        expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    test('fetches locations successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { id: 1, name: 'Hotel Paradise', address: 'New York' },
                { id: 2, name: 'Hotel Bliss', address: 'Los Angeles' },
            ],
        });

        await act(async () => {
            render(<Home />);
        });

        await waitFor(() => expect(fetch).toHaveBeenCalled());

        const locationInput = screen.getByTestId('location-input');

        fireEvent.change(locationInput, { target: { value: 'New' } });

        await waitFor(() => expect(screen.getByTestId('autocomplete-list')).toBeInTheDocument());
    });

    test('search button triggers hotel search', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, name: 'Hotel Paradise', address: 'New York' }],
        });

        await act(async () => {
            render(<Home />);
        });

        const searchButton = screen.getByTestId('search-button');
        fireEvent.click(searchButton);

        await waitFor(() => expect(fetch).toHaveBeenCalled());
        expect(screen.getByTestId('hotel-list')).toBeInTheDocument();
    });
});