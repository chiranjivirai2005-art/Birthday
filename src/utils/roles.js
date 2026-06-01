import { roleConfig } from '../config/env';

export const normalizeEmail = (email) => (email || '').toLowerCase();

export const isAdminEmail = (email) => roleConfig.adminEmails.includes(normalizeEmail(email));

export const isSpecialEmail = (email) => {
  const normalized = normalizeEmail(email);
  return Boolean(roleConfig.specialEmail && normalized === roleConfig.specialEmail);
};

export const getUserRole = (user) => {
  if (!user) return 'public';
  if (isAdminEmail(user.email)) return 'admin';
  if (isSpecialEmail(user.email)) return 'special';
  return 'visitor';
};
