"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiTrash2, FiCalendar, FiInfo, FiPlus, FiX } from 'react-icons/fi';
import axios from 'axios';
import moment from 'moment-jalaali';

moment.loadPersian({ dialect: 'persian-modern' });

interface Day {
  year: number;
  month: number;
  day: number;
  isToday: boolean;
  isSelected: boolean;
  events: Event[];
  holidays: HolidayEvent[];
}

interface Event {
  id: string;
  date: {
    year: number;
    month: number;
    day: number;
  };
  title: string;
  description?: string;
  isHoliday: boolean;
  reminder?: string;
}

interface HolidayEvent {
  description: string;
  additional_description: string;
  is_religious: boolean;
  is_holiday: boolean;
}

interface HolidayAPIResponse {
  is_holiday: boolean;
  events: HolidayEvent[];
}

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const PERSIAN_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

export default function PersianCalendar() {
  const today = moment();
  const [currentMonth, setCurrentMonth] = useState(today.jMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.jYear());
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [holidays, setHolidays] = useState<{ [key: string]: HolidayEvent[] }>({});
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    isHoliday: false,
    reminder: ''
  });

  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const fetchHolidays = async (date: { year: number; month: number; day: number }) => {
    try {
      const response = await axios.get<HolidayAPIResponse>(
        `https://holidayapi.ir/jalali/${date.year}/${date.month}/${date.day}`
      );
      const key = `${date.year}-${date.month}-${date.day}`;
      setHolidays(prev => ({ ...prev, [key]: response.data.events }));
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const addEvent = () => {
    if (!selectedDay || !newEvent.title) return;

    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      date: {
        year: selectedDay.year,
        month: selectedDay.month,
        day: selectedDay.day
      },
      title: newEvent.title,
      description: newEvent.description,
      isHoliday: newEvent.isHoliday || false,
      reminder: newEvent.reminder
    };

    setEvents(prev => [...prev, event]);
    setNewEvent({
      title: '',
      description: '',
      isHoliday: false,
      reminder: ''
    });
    setShowEventForm(false);
  };

  const deleteEvent = (eventId: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این رویداد را حذف کنید؟')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const renderCalendarDays = () => {
    const days: Day[] = [];
    const m = moment(`${currentYear}/${currentMonth}/1`, 'jYYYY/jM/jD');
    
    // استفاده از endOf و jDate به جای jDaysInMonth
    const daysInMonth = m.endOf('jMonth').jDate();
    
    const firstDayOfMonth = m.day();
    const today = moment();

    // Add empty days for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({
        year: 0,
        month: 0,
        day: 0,
        isToday: false,
        isSelected: false,
        events: [],
        holidays: []
      });
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = moment(`${currentYear}/${currentMonth}/${i}`, 'jYYYY/jM/jD');
      const isToday = currentDate.isSame(today, 'day');

      const dayEvents = events.filter(event => 
        event.date.year === currentYear &&
        event.date.month === currentMonth &&
        event.date.day === i
      );

      const key = `${currentYear}-${currentMonth}-${i}`;
      const dayHolidays = holidays[key] || [];

      days.push({
        year: currentYear,
        month: currentMonth,
        day: i,
        isToday,
        isSelected: selectedDay?.day === i,
        events: dayEvents,
        holidays: dayHolidays
      });
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.02 }}
          >
            {PERSIAN_MONTHS[currentMonth - 1]} {currentYear}
          </motion.h2>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (currentMonth === 1) {
                  setCurrentMonth(12);
                  setCurrentYear(prev => prev - 1);
                } else {
                  setCurrentMonth(prev => prev - 1);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              ماه قبل
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (currentMonth === 12) {
                  setCurrentMonth(1);
                  setCurrentYear(prev => prev + 1);
                } else {
                  setCurrentMonth(prev => prev + 1);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              ماه بعد
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {PERSIAN_WEEKDAYS.map(day => (
            <motion.div 
              key={day} 
              className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              whileHover={{ scale: 1.05 }}
            >
              {day}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays().map((day, index) => (
            day.year === 0 ? (
              <div key={`empty-${index}`} className="aspect-square" />
            ) : (
              <motion.button
                key={`${day.year}-${day.month}-${day.day}`}
                onClick={() => {
                  setSelectedDay(day);
                  fetchHolidays(day);
                }}
                className={`
                  relative aspect-square rounded-2xl p-2 text-center
                  backdrop-blur-sm transition-all duration-300
                  ${day.isToday ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                  ${day.isSelected ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg' : 
                    'hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md'}
                  ${day.events.length > 0 ? 'font-bold' : ''}
                  ${day.holidays.some(h => h.is_holiday) ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'}
                  ${index % 7 === 6 ? 'text-red-500 dark:text-red-400' : ''} // Friday
                `}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg relative z-10">{day.day}</span>
                {(day.events.length > 0 || day.holidays.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1"
                  >
                    {day.events.length > 0 && (
                      <motion.div 
                        className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                        whileHover={{ scale: 1.5 }}
                      />
                    )}
                    {day.holidays.length > 0 && (
                      <motion.div 
                        className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500"
                        whileHover={{ scale: 1.5 }}
                      />
                    )}
                  </motion.div>
                )}
              </motion.button>
            )
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <motion.h3 
                className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
              >
                {selectedDay.day} {PERSIAN_MONTHS[selectedDay.month - 1]} {selectedDay.year}
              </motion.h3>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEventForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  <FiPlus className="w-5 h-5" />
                  افزودن رویداد
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300"
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {showEventForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 space-y-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-purple-100 dark:border-gray-600"
                >
                  <motion.input
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="عنوان رویداد..."
                    className="w-full p-3 rounded-xl border border-purple-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                  <motion.textarea
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    value={newEvent.description}
                    onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="توضیحات..."
                    className="w-full p-3 rounded-xl border border-purple-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 dark:text-white h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-4"
                  >
                    <input
                      type="datetime-local"
                      value={newEvent.reminder}
                      onChange={e => setNewEvent(prev => ({ ...prev, reminder: e.target.value }))}
                      className="flex-1 p-3 rounded-xl border border-purple-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={newEvent.isHoliday}
                        onChange={e => setNewEvent(prev => ({ ...prev, isHoliday: e.target.checked }))}
                        className="rounded text-purple-600 focus:ring-purple-500 transition-all duration-300"
                      />
                      تعطیل
                    </label>
                  </motion.div>
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-end gap-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowEventForm(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors duration-300"
                    >
                      انصراف
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addEvent}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-all duration-300"
                    >
                      افزودن
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedDay.holidays.length > 0 && (
              <div className="mb-6 space-y-3">
                <motion.h4 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-lg font-medium bg-gradient-to-r from-red-600 to-pink-500 bg-clip-text text-transparent"
                >
                  مناسبت‌ها
                </motion.h4>
                {selectedDay.holidays.map((holiday, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl backdrop-blur-sm ${
                      holiday.is_holiday
                        ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800'
                        : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FiInfo className={`w-5 h-5 mt-0.5 ${
                        holiday.is_holiday ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                      }`} />
                      <div>
                        <p className="text-gray-900 dark:text-white">{holiday.description}</p>
                        {holiday.additional_description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {holiday.additional_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <motion.h4 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
              >
                رویدادهای شخصی
              </motion.h4>
              {selectedDay.events.length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  هیچ رویدادی برای این روز ثبت نشده است.
                </motion.p>
              ) : (
                selectedDay.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl backdrop-blur-sm ${
                      event.isHoliday
                        ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800'
                        : 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-600/50 border border-purple-100 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                        {event.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                        )}
                        {event.reminder && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <FiBell className="w-4 h-4" />
                            {moment(event.reminder).format('jYYYY/jM/jD HH:mm')}
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 