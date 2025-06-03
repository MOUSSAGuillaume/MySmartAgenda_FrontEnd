export default function initCalendarPage() {
  const calendarEl = document.getElementById('calendar');

  if (!calendarEl) {
    console.warn("L'élément #calendar est introuvable.");
    return;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'fr',
    events: [
      { title: 'Événement 1', start: '2025-06-03' },
      { title: 'Événement 2', start: '2025-06-07' },
    ]
  });

  calendar.render();
}
