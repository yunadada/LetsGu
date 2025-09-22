import { useEffect, useRef, useState } from "react";

export const useIntersectionObserver = (callback: () => void) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        callback();
      } else {
        setIsIntersecting(false);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [callback]);

  return { ref, isIntersecting };
};
