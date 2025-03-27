import { useEffect } from "react";

interface UseIntersectionObserverProps {
  target: React.RefObject<HTMLElement>;
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const useIntersectionObserver = ({
  target,
  onIntersect,
  threshold = 0.1,
  rootMargin = "0px",
}: UseIntersectionObserverProps) => {
  useEffect(() => {
    if (!target.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      },
      {
        root: null, // Verwendet das Viewport als Root
        rootMargin: rootMargin,
        threshold: threshold,
      },
    );

    observer.observe(target.current);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      observer.unobserve(target.current!);
    };
  }, [target, onIntersect, threshold, rootMargin]);
};
