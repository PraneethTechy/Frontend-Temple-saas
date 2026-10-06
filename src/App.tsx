import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks.js';
import { setAppInitialized } from './store/slices/uiSlice.js';
import { setCredentials, setInitializing } from './store/slices/authSlice.js';
import { useGetMeQuery } from './store/api/authApi.js';
import AppSplashScreen from './components/common/AppSplashScreen';
import ScrollToTop from './components/common/ScrollToTop';
import AppRoutes from './routes/AppRoutes';
import type { User } from '@shared/types/index.js';

interface AuthResponseWithData {
  data?: {
    user?: User;
  };
  user?: User;
}

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isFadingSplash, setIsFadingSplash] = useState<boolean>(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState<boolean>(false);

  const { isInitializing } = useAppSelector((state) => state.auth);

  // Restore authenticated session from HTTP-only cookie ONLY on application startup / page refresh
  const { data: rawAuthData, isSuccess, isError, isLoading } = useGetMeQuery(undefined, {
    skip: !isInitializing,
  });

  const authData = rawAuthData as unknown as AuthResponseWithData | undefined;

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
      {/* Route-level automatic scroll reset */}
      <ScrollToTop />

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
