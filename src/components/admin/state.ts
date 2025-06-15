import { atom } from 'jotai';
import { Booking, DayAvailability } from '@/types';

const initialDate = new Date().toISOString().split('T')[0];

const selectedDateForEditingAtom = atom(initialDate);
const isSavingAtom = atom<boolean>(false);
const editMessageAtom = atom<string | null>(null);
const editMessageTypeAtom = atom<'success' | 'error' | null>(null);

const upcomingAvailabilityAtom = atom<DayAvailability[]>([]);
const isLoadingAvailabilityAtom = atom(true);
const availabilityErrorAtom = atom<string | null>(null);

const upcomingBookingsAtom = atom<Booking[]>([]);
const isLoadingBookingsAtom = atom<boolean>(true);
const bookingsErrorAtom = atom<string | null>(null);
const isUpdatingBookingAtom = atom<string | null>(null);
export {
  selectedDateForEditingAtom,
  isSavingAtom,
  editMessageAtom,
  editMessageTypeAtom,
  upcomingAvailabilityAtom,
  isLoadingAvailabilityAtom,
  availabilityErrorAtom,
  upcomingBookingsAtom,
  isLoadingBookingsAtom,
  bookingsErrorAtom,
  isUpdatingBookingAtom,
};
