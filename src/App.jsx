import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAppInitialized } from './store/slices/uiSlice.js';
import { setCredentials, setInitializing } from './store/slices/authSlice.js';
import { useGetMeQuery } from './store/api/authApi.js';
import AppSplashScreen from './components/common/AppSplashScreen.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export const App = () => {
  const dispatch = useDispatch();
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingSplash, setIsFadingSplash] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const { isInitializing } = useSelector((state) => state.auth);

  // Restore authenticated session from HTTP-only cookie ONLY on application startup / page refresh
  const { data: authData, isSuccess, isError, isLoading } = useGetMeQuery(undefined, {
    skip: !isInitializing,
  });

  useEffect(() => {
    // Only execute during initial startup session restoration
    if (!isInitializing) return;

    if (isSuccess && authData) {
      const user = authData.data?.user || authData.user;
      if (user) {
        dispatch(setCredentials({ user }));
      } else {
        dispatch(setInitializing(false));
      }
    } else if (isError) {
      dispatch(setInitializing(false));
    }
  }, [isInitializing, isSuccess, isError, authData, dispatch]);

  // Enforce minimum splash display duration (~4000ms)
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 4000);

    return () => clearTimeout(minTimer);
  }, []);

  // When both minimum display duration (~4s) and app readiness are reached:
  useEffect(() => {
    if (minTimeElapsed && !isLoading) {
      dispatch(setAppInitialized(true));
      setIsFadingSplash(true);

      const exitTimer = setTimeout(() => {
        setShowSplash(false);
      }, 700);

      return () => clearTimeout(exitTimer);
    }
  }, [minTimeElapsed, isLoading, dispatch]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Global Splash Initialization Screen */}
      <AppSplashScreen
        isVisible={showSplash}
        isFading={isFadingSplash}
        statusMessage="Preparing your spiritual journey..."
      />

      {/* Main Routed Application */}
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
