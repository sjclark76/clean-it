// src/types/availability.ts (New File)
export interface TimeSlot {
    id: string; // e.g., "slot-0", "slot-1"
    time: string; // e.g., "09:00 AM"
    available: boolean;
}

export interface DayAvailability {
    _id?: any;
    date: string; // e.g., "2023-10-27"
    dayName: string; // e.g., "Friday"
    slots: TimeSlot[]; // Array of half-hour slots defined by admin
}

export interface Booking {
    _id?: any;
    date: string;
    startTime: string; // Start time of the 2-hour service
    endTime: string;   // End time of the 2-hour service
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    serviceType: string;
    notes?: string;
    status: 'pending_confirmation' | 'confirmed' | 'cancelled';
    createdAt: Date;
}