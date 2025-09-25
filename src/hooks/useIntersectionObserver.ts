import { useEffect, useRef, useState } from "react";

export const useIntersectionObserver = (
  callback: () => void,
  rootRef?: React.RefObject<HTMLElement | null>
) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current || !rootRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          callback();
        } else {
          setIsIntersecting(false);
        }
      },
      { root: rootRef?.current ?? null, threshold: 0 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [callback, rootRef]);

  return { ref, isIntersecting };
};
