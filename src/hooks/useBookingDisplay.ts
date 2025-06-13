// src/hooks/useBookingDisplay.ts
export function useBookingDisplay() {
  const formatTimeDisplay = (isoDateString: string): string => {
    if (!isoDateString) return '';
    // Ensures that we're creating a date object from the ISO string
    // and then formatting it to the user's local time.
    return new Date(isoDateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // You could add other booking-specific display helpers here if needed in the future.
  // For example, a function to get a specific icon or color based on serviceType or status.

  return { formatTimeDisplay };
}
