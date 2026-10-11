import { useState, useEffect } from "react";

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
