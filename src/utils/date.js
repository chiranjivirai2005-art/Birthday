const parseDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (value, options = {}) => {
  const date = parseDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date);
};

export const getBirthdayCountdown = (birthdayString, now = new Date()) => {
  const today = new Date(now);
  const birthday = parseDate(birthdayString);
  if (!birthday) return null;

  const isBirthdayToday = today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate();
  if (isBirthdayToday) {
    return {
      isToday: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const nextBirthday = new Date(today);
  nextBirthday.setMonth(birthday.getMonth(), birthday.getDate());
  nextBirthday.setHours(0, 0, 0, 0);

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const difference = Math.max(0, nextBirthday.getTime() - today.getTime());
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    isToday: false,
    days,
    hours,
    minutes,
    seconds,
  };
};

export const formatCountdown = (birthdayString, now = new Date()) => {
  const countdown = getBirthdayCountdown(birthdayString, now);
  if (!countdown) return '';
  if (countdown.isToday) return 'Today is Stuti Day 🎉';

  const pad = (value) => String(value).padStart(2, '0');
  return `${countdown.days}d ${pad(countdown.hours)}h ${pad(countdown.minutes)}m ${pad(countdown.seconds)}s until Stuti Day`;
};
