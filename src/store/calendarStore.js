import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCalendarStore = create(
  persist(
    (set, get) => ({
      reminders: [],      // { eventId, eventTitle, deadline, type: 'reminder' }
      calendarItems: [],  // { eventId, eventTitle, date, time, type: 'calendar' }

      addReminder: (event) => {
        const already = get().reminders.find(r => r.eventId === event.id)
        if (already) return false
        set(state => ({
          reminders: [
            ...state.reminders,
            {
              eventId: event.id,
              eventTitle: event.title,
              deadline: event.registrationDeadlineDate || event.date,
              addedAt: new Date().toISOString(),
              type: 'reminder'
            }
          ]
        }))
        return true
      },

      addCalendarItem: (event) => {
        const already = get().calendarItems.find(c => c.eventId === event.id)
        if (already) return false
        set(state => ({
          calendarItems: [
            ...state.calendarItems,
            {
              eventId: event.id,
              eventTitle: event.title,
              date: event.startDate || event.date,
              time: event.startTime || event.time,
              location: event.location || '',
              description: event.shortDescription || event.description || '',
              addedAt: new Date().toISOString(),
              type: 'calendar'
            }
          ]
        }))
        return true
      },

      hasReminder: (eventId) => get().reminders.some(r => r.eventId === eventId),
      hasCalendarItem: (eventId) => get().calendarItems.some(c => c.eventId === eventId),

      removeReminder: (eventId) => set(state => ({
        reminders: state.reminders.filter(r => r.eventId !== eventId)
      })),
      removeCalendarItem: (eventId) => set(state => ({
        calendarItems: state.calendarItems.filter(c => c.eventId !== eventId)
      })),
    }),
    { name: 'campus-calendar' }
  )
)

/** Generates and downloads a .ics file for the event so users can import it
 *  into Google Calendar, Apple Calendar, or Outlook in one click. */
export function downloadICS(event) {
  const dateStr = (event.startDate || event.date || '').replace(/-/g, '')
  const timeStr = (event.startTime || event.time || '0900').replace(':', '') + '00'
  const dtStart = `${dateStr}T${timeStr}`
  // Default 2-hour duration
  const endHour = String(parseInt(timeStr.slice(0, 2)) + 2).padStart(2, '0')
  const dtEnd   = `${dateStr}T${endHour}${timeStr.slice(2)}`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.shortDescription || event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${event.title.replace(/\s+/g, '_')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
