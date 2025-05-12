export const mockHotels = [
    {
        id: 1,
        name: 'Akkor Luxury Hotel',
        location: 'Paris, France',
        description: 'A beautiful 5-star hotel in the heart of Paris with views of the Eiffel Tower.',
        image: 'https://www.kayak.fr/rimg/himg/3d/6e/67/ice-149608-103293113-104202.jpg?width=1366&height=768&crop=true',
        rating: 4.8,
        breakfast: true
    },
    {
        id: 2,
        name: 'Seaside Paradise',
        location: 'Nice, France',
        description: 'An ocean-view resort with private beach and luxury spa.',
        image: 'https://www.kayak.fr/rimg/himg/3d/6e/67/ice-149608-103293113-104202.jpg?width=1366&height=768&crop=true',
        rating: 4.6,
        breakfast: false
    }
];

export const mockRooms = [
    { id: 101, hotelId: 1, price: 120, number_of_beds: 1 },
    { id: 102, hotelId: 1, price: 200, number_of_beds: 2 },
    { id: 201, hotelId: 2, price: 180, number_of_beds: 2 },
    { id: 202, hotelId: 2, price: 250, number_of_beds: 3 }
];

export const mockBookings = [
    { id: 1, roomId: 101, userId: 1, number_of_people: 1, start_date: '2022-08-01', end_date: '2022-08-05' },
    { id: 2,  roomId: 201, userId: 1, number_of_people: 2, start_date: '2022-08-10', end_date: '2022-08-15' }
];