import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeAnalytics, trackPageView } from '../utils/analytics';

const RouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    initializeAnalytics();
  }, []);

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;
    trackPageView(path, document.title);
  }, [location]);

  return null;
};

export default RouteChangeTracker;


