import React, { createContext, useContext, useState, useEffect } from 'react';
import initialData from '../data/initialData';
import { translations } from '../i18n/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // i18n initialization
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('myday_lang') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('myday_lang', lang);
  };

  const t = (key, defaultValue) => {
    const langDict = translations[language] || translations['en'];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const fallbackDict = translations['en'];
    if (fallbackDict && fallbackDict[key] !== undefined) {
      return fallbackDict[key];
    }
    return defaultValue !== undefined ? defaultValue : key;
  };

  const [role, setRole] = useState('customer'); // 'customer' | 'provider' | 'admin'
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({
    id: 'cust-1',
    name: 'John & Sarah',
    email: 'john.sarah@myday.co.tz',
    phone: '+255 777 123 456',
    role: 'customer'
  });

  const [wedding, setWedding] = useState({
    id: 'wed-1',
    title: "John & Sarah's Wedding",
    bride: 'John',
    groom: 'Sarah',
    date: '2026-12-25',
    location: 'Dar es Salaam',
    guests: 300,
    budget: 15000000,
    description: '',
    image: null,
    cart: [],
  });

  const [providers, setProviders] = useState(initialData.providers);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [commissionRate, setCommissionRate] = useState(0.05);

  const calculateCart = () => {
    const total = wedding.cart.reduce((sum, item) => sum + item.price, 0);
    const deposit = Math.round(total * 0.3);
    return { total, deposit };
  };

  const switchRole = newRole => {
    setRole(newRole);
    if (newRole === 'customer') {
      setUser({ id: 'cust-1', name: 'John & Sarah', email: 'john.sarah@myday.co.tz', phone: '+255 777 123 456', role: 'customer' });
    } else if (newRole === 'provider') {
      setUser({ id: 'prov-1', name: 'Grand Imperial Hall', email: 'info@grandimperial.co.tz', phone: '+255 777 999 888', role: 'provider' });
    } else if (newRole === 'admin') {
      setUser({ id: 'admin-1', name: 'MY DAY Superadmin', email: 'admin@myday.co.tz', phone: '+255 22 210 0900', role: 'admin' });
    }
    setIsLoggedIn(true);
  };

  const loginUser = ({ email, role: targetRole, name }) => {
    setRole(targetRole);
    setUser({
      id: `usr-${Date.now()}`,
      name: name || (targetRole === 'customer' ? 'John & Sarah' : targetRole === 'provider' ? 'Imperial Vendor' : 'Platform Admin'),
      email: email || 'user@myday.co.tz',
      role: targetRole
    });
    setIsLoggedIn(true);
  };

  const registerUser = (userObj) => {
    setRole(userObj.role || 'customer');
    setUser({
      id: `usr-${Date.now()}`,
      name: userObj.name || 'New Member',
      email: userObj.email,
      phone: userObj.phone || '',
      role: userObj.role || 'customer'
    });
    setIsLoggedIn(true);
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
  };

  const createBooking = (category, vendorId, packageId, price, date, deposit) => {
    const bookingId = `bk-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      customerId: user.id,
      providerId: vendorId,
      category,
      packageId,
      weddingId: wedding.id,
      date,
      price,
      deposit,
      paidAmount: deposit,
      commission: Math.round(price * commissionRate),
      status: 'confirmed',
    };
    setBookings(prev => [...prev, newBooking]);
    setProviders(prev =>
      prev.map(p =>
        p.id === vendorId
          ? { ...p, unavailableDates: [...(p.unavailableDates || []), date] }
          : p
      )
    );
    return bookingId;
  };

  const recordPayment = (bookingId, amount, full = false) => {
    const paymentId = `pay-${Date.now()}`;
    setPayments(prev => [...prev, { id: paymentId, bookingId, amount, date: new Date().toISOString() }]);
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status: full ? 'confirmed' : 'partial', paidAmount: (b.paidAmount || 0) + amount }
          : b
      )
    );
    return paymentId;
  };

  const value = {
    language,
    setLanguage,
    t,
    role,
    user,
    isLoggedIn,
    wedding,
    setWedding,
    providers,
    setProviders,
    bookings,
    setBookings,
    payments,
    setPayments,
    commissionRate,
    setCommissionRate,
    calculateCart,
    switchRole,
    loginUser,
    registerUser,
    logoutUser,
    createBooking,
    recordPayment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
