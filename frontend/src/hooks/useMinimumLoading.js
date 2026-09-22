import { useState, useEffect } from "react";

/**
 * Custom Hook: Holds loading state for a minimum duration (default 2000ms)
 * to prevent flickering skeletons on high-speed network connections.
 */
export function useMinimumLoading(isLoading, minTime = 2000) {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      timer = setTimeout(() => {
        setShowSkeleton(false);
      }, minTime);
    }
    return () => clearTimeout(timer);
  }, [isLoading, minTime]);

  return showSkeleton;
}

export default useMinimumLoading;
