// src/app/admin/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent, useCallback, useEffect } from 'react';

// Assuming types are defined here or imported from a shared file
interface TimeSlotInput {
    id: string;
    time: string;
    available: boolean;
}

interface AdminDayAvailability {
    _id?: any;
    date: string;
    dayName: string;
    slots: TimeSlotInput[];
}

// Define Booking type (or import from shared types)
interface Booking {
    _id: any; // Assuming MongoDB ObjectId
    date: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    serviceType: string;
    notes?: string;
    status: 'pending_confirmation' | 'confirmed' | 'cancelled';
    createdAt: Date;
}


const PREDEFINED_TIMES = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM",
];

export default function AdminAvailabilityPage() {
    const initialDate = new Date().toISOString().split('T')[0];
    const [selectedDateForEditing, setSelectedDateForEditing] = useState<string>(initialDate);

    const getDefaultSlotsForEditing = useCallback((): TimeSlotInput[] => {
        return PREDEFINED_TIMES.map((time, index) => ({
            id: `slot-${index}-${Date.now()}`,
            time,
            available: false,
        }));
    }, []);

    const [timeSlotsForEditing, setTimeSlotsForEditing] = useState<TimeSlotInput[]>(getDefaultSlotsForEditing);

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [editMessage, setEditMessage] = useState<string | null>(null);
    const [editMessageType, setEditMessageType] = useState<'success' | 'error' | null>(null);

    const [upcomingAvailability, setUpcomingAvailability] = useState<AdminDayAvailability[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(true);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);

    // State for upcoming client bookings
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);


    const fetchUpcomingAvailability = useCallback(async () => {
        setIsLoadingAvailability(true);
        setAvailabilityError(null);
        try {
            const response = await fetch('/api/availability');
            if (!response.ok) {
                throw new Error('Failed to fetch upcoming availability');
            }
            const data: AdminDayAvailability[] = await response.json();
            const todayStr = new Date().toISOString().split('T')[0];
            setUpcomingAvailability(
                data
                    .filter(day => day.date >= todayStr)
                    .sort((a, b) => a.date.localeCompare(b.date))
            );
        } catch (err) {
            setAvailabilityError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoadingAvailability(false);
        }
    }, []);

    // Fetch upcoming client bookings
    const fetchUpcomingBookings = useCallback(async () => {
        setIsLoadingBookings(true);
        setBookingsError(null);
        try {
            const response = await fetch('/api/bookings'); // Use the new endpoint
            if (!response.ok) {
                throw new Error('Failed to fetch upcoming bookings');
            }
            const data: Booking[] = await response.json();
            setUpcomingBookings(data);
        } catch (err) {
            setBookingsError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoadingBookings(false);
        }
    }, []);


    useEffect(() => {
        fetchUpcomingAvailability();
        fetchUpcomingBookings(); // Fetch bookings on mount
    }, [fetchUpcomingAvailability, fetchUpcomingBookings]);


    useEffect(() => {
        const existingDayData = upcomingAvailability.find(day => day.date === selectedDateForEditing);
        if (existingDayData) {
            const editorSlots = PREDEFINED_TIMES.map((time, index) => {
                const existingSlot = existingDayData.slots.find(s => s.time === time);
                return {
                    id: `edit-slot-${index}-${selectedDateForEditing}`,
                    time,
                    available: existingSlot ? existingSlot.available : false,
                };
            });
            setTimeSlotsForEditing(editorSlots);
        } else {
            setTimeSlotsForEditing(getDefaultSlotsForEditing());
        }
    }, [selectedDateForEditing, upcomingAvailability, getDefaultSlotsForEditing]);


    const handleDateChangeForEditing = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedDateForEditing(e.target.value);
        setEditMessage(null);
    };

    const handleSlotToggleForEditing = (toggledSlotId: string) => {
        setTimeSlotsForEditing(prevSlots =>
            prevSlots.map(s =>
                s.id === toggledSlotId ? { ...s, available: !s.available } : s
            )
        );
        setEditMessage(null);
    };

    const getDayName = (dateString: string): string => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const handleSubmitAvailability = async (event: FormEvent) => {
        event.preventDefault();
        setIsSaving(true);
        setEditMessage(null);
        setEditMessageType(null);

        const dayName = getDayName(selectedDateForEditing);
        const payload = {
            date: selectedDateForEditing,
            dayName: dayName,
            slots: timeSlotsForEditing.map(({ time, available, id }) => ({ time, available, id })),
        };

        try {
            const response = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (response.ok) {
                setEditMessage(result.message || "Availability saved successfully!");
                setEditMessageType('success');
                fetchUpcomingAvailability();
                // Optionally, re-fetch bookings if saving availability might affect them,
                // though typically saving general availability doesn't directly change existing bookings.
                // fetchUpcomingBookings();
            } else {
                setEditMessage(result.message || "Failed to save availability.");
                setEditMessageType('error');
            }
        } catch (error) {
            setEditMessage("An unexpected error occurred. Please try again.");
            setEditMessageType('error');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDateDisplay = (dateString: string) => {
        const dateObj = new Date(dateString + 'T00:00:00');
        return dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatBookingStatus = (status: Booking['status']) => {
        switch (status) {
            case 'pending_confirmation': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans">
            <header className="bg-white shadow-md">
                <nav className="container mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold text-purple-600">Admin Dashboard</h1>
                </nav>
            </header>

            <main className="flex-grow container mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
                {/* Section for Editing/Adding Availability (takes 1/3 on large screens) */}
                <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-xl shadow-xl">
                    <h2 className="text-xl md:text-2xl font-semibold mb-2 text-gray-700">Set/Update Working Hours</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Select a date and mark all half-hour slots you are available to work.
                    </p>

                    {editMessage && (
                        <div className={`p-3 mb-4 rounded-md text-sm ${
                            editMessageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                                editMessageType === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : ''
                        }`}>
                            {editMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmitAvailability} className="space-y-6">
                        <div>
                            <label htmlFor="date-edit" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Date to Edit:
                            </label>
                            <input
                                type="date"
                                id="date-edit"
                                value={selectedDateForEditing}
                                onChange={handleDateChangeForEditing}
                                required
                                className="w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div>
                            <h3 className="text-md font-medium text-gray-700 mb-2">
                                Mark Available Half-Hour Slots for {formatDateDisplay(selectedDateForEditing)}:
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-2 border rounded-md bg-gray-50">
                                {timeSlotsForEditing.map((slot) => (
                                    <label
                                        key={slot.id}
                                        className={`flex items-center space-x-2 p-2.5 rounded-md border cursor-pointer transition-colors
                                            ${slot.available ? 'bg-purple-100 border-purple-400 ring-1 ring-purple-300' :
                                            'bg-white hover:bg-gray-100 border-gray-300'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={slot.available}
                                            onChange={() => handleSlotToggleForEditing(slot.id)}
                                            className="form-checkbox h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-1"
                                        />
                                        <span className={`text-xs sm:text-sm ${slot.available ? 'font-semibold text-purple-700' : 'text-gray-600'}`}>
                                            {slot.time}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Working Hours'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section for Displaying Upcoming Client Bookings (takes 2/3 on large screens) */}
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-xl shadow-xl">
                    <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-700">Upcoming Client Bookings</h2>
                    {isLoadingBookings && <p className="text-gray-600">Loading bookings...</p>}
                    {bookingsError && <p className="text-red-600">Error: {bookingsError}</p>}
                    {!isLoadingBookings && !bookingsError && upcomingBookings.length === 0 && (
                        <p className="text-gray-600">No upcoming client bookings found.</p>
                    )}
                    {!isLoadingBookings && !bookingsError && upcomingBookings.length > 0 && (
                        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                            {upcomingBookings.map(booking => (
                                <div key={booking._id.toString()} className="p-4 border rounded-lg bg-slate-50 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-purple-700">
                                                {formatDateDisplay(booking.date)} @ {booking.startTime} - {booking.endTime}
                                            </h3>
                                            <p className="text-sm text-gray-600">Service: {booking.serviceType}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'pending_confirmation' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700' // for cancelled
                                        }`}>
                                            {formatBookingStatus(booking.status)}
                                        </span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <p><strong>Client:</strong> {booking.clientName}</p>
                                        <p><strong>Email:</strong> <a href={`mailto:${booking.clientEmail}`} className="text-purple-600 hover:underline">{booking.clientEmail}</a></p>
                                        <p><strong>Phone:</strong> <a href={`tel:${booking.clientPhone}`} className="text-purple-600 hover:underline">{booking.clientPhone}</a></p>
                                        {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                                    </div>
                                    {/* Add buttons for Confirm/Cancel actions here if needed */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* Section for Displaying Admin's General Availability (Optional - can be removed or kept) */}
                {/* This section is currently hidden for brevity, but you can uncomment it if you want to keep it */}
                {/*
                <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-xl shadow-xl mt-8">
                    <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-700">Your Upcoming General Availability</h2>
                    {isLoadingAvailability && <p className="text-gray-600">Loading general availability...</p>}
                    {availabilityError && <p className="text-red-600">Error: {availabilityError}</p>}
                    {!isLoadingAvailability && !availabilityError && upcomingAvailability.length === 0 && (
                        <p className="text-gray-600">No upcoming general availability has been set.</p>
                    )}
                    {!isLoadingAvailability && !availabilityError && upcomingAvailability.length > 0 && (
                        <div className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto pr-2">
                            {upcomingAvailability.map(day => {
                                const availableSlotsForDay = day.slots.filter(s => s.available);
                                if (availableSlotsForDay.length === 0) return null;

                                return (
                                    <div key={day.date + "-general"} className="p-3 border rounded-lg bg-gray-50/70">
                                        <h3 className="text-md font-semibold text-purple-700 mb-2">{formatDateDisplay(day.date)}</h3>
                                        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
                                            {availableSlotsForDay.map(slot => (
                                                <li key={slot.id || slot.time + "-general"} className="text-xs text-gray-700 bg-green-100 p-1.5 rounded text-center">
                                                    {slot.time}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                */}
            </main>

            <footer className="bg-gray-200 text-center py-6 mt-auto">
                <p className="text-gray-600">&copy; {new Date().getFullYear()} Jessiah's Car Cleaning - Admin</p>
            </footer>
        </div>
    );
}