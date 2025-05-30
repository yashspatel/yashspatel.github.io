import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Dialog } from "@headlessui/react";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";

const API_URL = "<YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL>";

export default function App() {
  const [events, setEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ date: "", signer: "", start: "", end: "", hours: "" });
  const [selectedWeek, setSelectedWeek] = useState({});

  useEffect(() => {
    fetch(`${API_URL}?type=get`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          title: `${item.TotalHours} hrs`,
          date: item.Date,
          extendedProps: item,
        }));
        setEvents(formatted);
      });
  }, [isOpen]);

  const handleDateClick = (arg) => {
    setFormData((prev) => ({ ...prev, date: arg.dateStr }));
    setIsOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };
    if (name === "start" || name === "end") {
      const [h1, m1] = newData.start.split(":"), [h2, m2] = newData.end.split(":");
      if (h1 && h2) {
        const diff = (parseInt(h2) * 60 + parseInt(m2)) - (parseInt(h1) * 60 + parseInt(m1));
        newData.hours = (diff / 60).toFixed(2);
      }
    }
    setFormData(newData);
  };

  const handleSubmit = async () => {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(formData),
    });
    setIsOpen(false);
  };

  const calculateWeeklyHours = () => {
    const map = {};
    events.forEach((e) => {
      const d = parseISO(e.date);
      const monday = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
      map[monday] = (map[monday] || 0) + parseFloat(e.title);
    });
    return map;
  };

  const weeklyHours = calculateWeeklyHours();

  return (
    <div className="p-4 flex">
      <div className="flex-1">
        <button
          className="mb-2 bg-blue-600 text-white p-2 rounded"
          onClick={() => setIsOpen(true)}
        >
          + Add Entry
        </button>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
        />
      </div>

      <div className="w-64 ml-4">
        <h2 className="font-bold text-lg mb-2">Weekly Hours</h2>
        <ul className="space-y-1">
          {Object.entries(weeklyHours).map(([weekStart, hours]) => (
            <li key={weekStart} className="bg-gray-100 p-2 rounded">
              Week of {weekStart}: {hours.toFixed(2)} hrs
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 z-10">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded space-y-4 w-96">
            <Dialog.Title className="text-lg font-medium">Add Work Entry</Dialog.Title>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border p-2 rounded" />
            <input type="text" name="signer" placeholder="Signer Name" value={formData.signer} onChange={handleChange} className="w-full border p-2 rounded" />
            <input type="time" name="start" value={formData.start} onChange={handleChange} className="w-full border p-2 rounded" />
            <input type="time" name="end" value={formData.end} onChange={handleChange} className="w-full border p-2 rounded" />
            <input type="number" name="hours" step="0.01" value={formData.hours} onChange={handleChange} className="w-full border p-2 rounded" />
            <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded w-full">Save</button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}