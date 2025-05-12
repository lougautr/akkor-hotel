import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Profile from "../components/Profile";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    BrowserRouter: ({ children }) => <div>{children}</div>,
}));

beforeAll(() => {
    // Suppress known error logs for cleaner test output
    jest.spyOn(console, "error").mockImplementation((message) => {
        if (message.includes("Failed to update user profile.")) return;
        console.warn(message);
    });
});

afterAll(() => {
    console.error.mockRestore(); // Restore console.error after tests
});

beforeEach(async () => {
    jest.clearAllMocks();
    localStorage.setItem("token", "mockToken");

    global.fetch = jest.fn((url, options) => {
        if (url.includes("/users/me") && options?.method === "GET") { // ✅ URL mise à jour
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        id: 42, // ✅ ID dynamique
                        email: "test@example.com",
                        pseudo: "testUser",
                    }),
            });
        }
        if (url.includes("/users/42") && options?.method === "PATCH") { // ✅ ID dynamique
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        id: 42,
                        email: "newemail@example.com",
                        pseudo: "newPseudo",
                    }),
            });
        }
        return Promise.reject(new Error("API request failed"));
    });

    await act(async () => {
        render(<Profile />);
    });
});

describe("Profile Component", () => {
    test("renders profile correctly", async () => {
        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /My Profile/i })).toBeInTheDocument();
            expect(screen.getByText("User Information")).toBeInTheDocument();
            expect(screen.getByText(/Email:/i)).toBeInTheDocument();
            expect(screen.getByText(/Pseudo:/i)).toBeInTheDocument();
        });
    });

    test("opens and closes the edit modal", async () => {
        await waitFor(() => {
            expect(screen.getByText(/Edit/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Edit/i));

        await waitFor(() => {
            expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Cancel/i));

        await waitFor(() => {
            expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument();
        });
    });

    test("updates form input values", async () => {
        await waitFor(() => {
            expect(screen.getByText(/Edit/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Edit/i));

        const emailInput = screen.getByLabelText("Email*:");
        const pseudoInput = screen.getByLabelText("Pseudo*:");

        fireEvent.change(emailInput, { target: { value: "newemail@example.com" } });
        fireEvent.change(pseudoInput, { target: { value: "newPseudo" } });

        expect(emailInput.value).toBe("newemail@example.com");
        expect(pseudoInput.value).toBe("newPseudo");
    });

    test("submits the form and updates user profile", async () => {
        await waitFor(() => {
            expect(screen.getByText(/Edit/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Edit/i));

        const emailInput = screen.getByLabelText("Email*:");
        const pseudoInput = screen.getByLabelText("Pseudo*:");

        fireEvent.change(emailInput, { target: { value: "newemail@example.com" } });
        fireEvent.change(pseudoInput, { target: { value: "newPseudo" } });

        fireEvent.click(screen.getByText(/Save/i));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8000/users/42", // ✅ ID dynamique
                expect.objectContaining({
                    method: "PATCH",
                })
            );

            expect(screen.getByText(/newemail@example.com/i)).toBeInTheDocument();
            expect(screen.getByText(/newPseudo/i)).toBeInTheDocument();
        });
    });

    test("handles update failure", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: "Failed to update" }),
            })
        );

        await waitFor(() => {
            expect(screen.getByText(/Edit/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Edit/i));

        fireEvent.click(screen.getByText(/Save/i));

        await waitFor(() => {
            expect(screen.getByText(/Failed to update/i)).toBeInTheDocument();
        });
    });
});