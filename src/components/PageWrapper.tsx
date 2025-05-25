'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';

interface PageWrapperProps {
  children: React.ReactNode;
  loadingText?: string;
  errorFallback?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  loadingText = 'Loading...',
  errorFallback,
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={<LoadingSpinner fullScreen text={loadingText} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}; 