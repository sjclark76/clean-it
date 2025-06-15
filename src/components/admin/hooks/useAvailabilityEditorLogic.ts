// src/hooks/useAvailabilityEditorLogic.ts
'use client';

import {
  FormEvent,
  ChangeEvent,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { TimeSlot } from '@/types';
import { useAtom } from 'jotai';
import {
  editMessageAtom,
  editMessageTypeAtom,
  isSavingAtom,
  selectedDateForEditingAtom,
  upcomingAvailabilityAtom,
} from '@/components/admin/state';
import { useUpcomingAvailability } from '@/hooks/useUpcomingAvailability';

const PREDEFINED_TIMES = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

const getDayName = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export function useAvailabilityEditorLogic() {
  const [isSaving, setIsSaving] = useAtom(isSavingAtom);
  const [editMessage, setEditMessage] = useAtom(editMessageAtom);
  const [editMessageType, setEditMessageType] = useAtom(editMessageTypeAtom);
  const [selectedDateForEditing, setSelectedDateForEditing] = useAtom(
    selectedDateForEditingAtom
  );
  const [upcomingAvailability] = useAtom(upcomingAvailabilityAtom);
  const fetchUpcomingAvailability = useUpcomingAvailability();

  const getDefaultSlotsForEditing = useCallback((): TimeSlot[] => {
    return PREDEFINED_TIMES.map((time, index) => ({
      id: `slot-${index}-${Date.now()}`,
      time,
      available: false,
    }));
  }, []);

  const [timeSlotsForEditing, setTimeSlotsForEditing] = useState<TimeSlot[]>(
    getDefaultSlotsForEditing
  );

  useEffect(() => {
    const existingDayData = upcomingAvailability.find(
      (day) => day.date === selectedDateForEditing
    );
    if (existingDayData) {
      const editorSlots = PREDEFINED_TIMES.map((time, index) => {
        const existingSlot = existingDayData.slots.find((s) => s.time === time);
        return {
          id: `edit-slot-${index}-${selectedDateForEditing}-${Math.random()}`,
          time,
          available: existingSlot ? existingSlot.available : false,
        };
      });
      setTimeSlotsForEditing(editorSlots);
    } else {
      setTimeSlotsForEditing(getDefaultSlotsForEditing());
    }
  }, [selectedDateForEditing, upcomingAvailability, getDefaultSlotsForEditing]);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDateForEditing(e.target.value);
    setEditMessage(null); // Clear message on date change
  };

  const handleSlotToggle = (toggledSlotId: string) => {
    setTimeSlotsForEditing((prevSlots) =>
      prevSlots.map((s) =>
        s.id === toggledSlotId ? { ...s, available: !s.available } : s
      )
    );
    setEditMessage(null); // Clear message on slot toggle
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setEditMessage(null);
    setEditMessageType(null);

    const dayName = getDayName(selectedDateForEditing);
    const payload = {
      date: selectedDateForEditing,
      dayName: dayName,
      slots: timeSlotsForEditing.map(({ time, available, id }) => ({
        time,
        available,
        id,
      })),
    };

    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        setEditMessage(result.message || 'Availability saved successfully!');
        setEditMessageType('success');
        await fetchUpcomingAvailability(); // Re-fetch to update lists
      } else {
        setEditMessage(result.message || 'Failed to save availability.');
        setEditMessageType('error');
      }
    } catch (err) {
      setEditMessage(
        (err instanceof Error ? err.message : 'An unexpected error occurred') +
          '. Please try again.'
      );
      setEditMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    selectedDateForEditing,
    timeSlotsForEditing,
    isSaving,
    editMessage,
    editMessageType,
    handleDateChange,
    handleSlotToggle,
    handleSubmit,
  };
}
