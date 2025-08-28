"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";

// Wir definieren die Props, die unsere Komponente akzeptiert.
// `children` ist der Inhalt, der "sticky" sein soll.
// `className` erlaubt uns, von außen weitere Tailwind-Klassen zu übergeben.
interface SmoothStickyWrapperProps {
    children: ReactNode;
    className?: string;
}

export const SmoothStickyWrapper = ({
    children,
    className,
}: SmoothStickyWrapperProps) => {
    // 1. Refs, um die Höhe des Wrappers und des Inhalts zu messen
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // 2. State, um die Höhe des Inhalts zu speichern
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [contentHeight, setContentHeight] = useState(0);

    // 3. Framer Motion Hooks
    // `scrollY` gibt uns die aktuelle Scroll-Position der Seite
    const { scrollY } = useScroll();

    // `useSpring` fügt eine "federnde" Physik hinzu. Das ist die Magie!
    // Es wird versuchen, den Wert von `scrollY` zu erreichen, aber mit einer Verzögerung/Federung.
    const springyScrollY = useSpring(scrollY, {
        stiffness: 400, // Wie steif die Feder ist (höher = schneller)
        damping: 90, // Wie stark die Bewegung gedämpft wird (höher = weniger wackeln)
    });

    // 4. `useTransform`, um den Scroll-Wert in einen `translateY`-Wert umzuwandeln
    // Wir bewegen das Element nur, wenn die Höhe des Inhalts kleiner ist als die des Wrappers.
    const y = useTransform(springyScrollY, (latest) => {
        if (!wrapperRef.current || !contentRef.current) return 0;

        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Berechne, wie weit das Element maximal nach unten bewegt werden darf
        const maxTranslateY = Math.max(
            0,
            wrapperRect.height - contentRect.height
        );

        // Berechne den Scroll-Fortschritt innerhalb des Wrappers
        const scrollStart = wrapperRect.top + window.scrollY;
        const scrollEnd = scrollStart + wrapperRect.height - windowHeight;

        const scrollProgress =
            (latest - scrollStart) / (scrollEnd - scrollStart);

        // Begrenze den Fortschritt zwischen 0 und 1
        const clampedProgress = Math.max(0, Math.min(1, scrollProgress));

        return clampedProgress * maxTranslateY;
    });

    // 5. `useEffect`, um die Höhe des Inhalts zu messen, sobald er gerendert ist
    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.offsetHeight);
        }
    }, []);

    return (
        // Der äußere Wrapper. Er definiert den Bereich, in dem die Animation stattfindet.
        // Seine Höhe muss größer sein als die des Inhalts.
        <div ref={wrapperRef} className={className}>
            {/* 
        Das ist das Element, das wir tatsächlich bewegen.
        - `position: sticky` und `top-0` sorgen für ein Fallback und die korrekte Positionierung.
        - `motion.div` macht es für Framer Motion animierbar.
        - `style={{ y }}` wendet unsere berechnete, federnde Y-Position an.
      */}
            <motion.div
                ref={contentRef}
                className="sticky top-5" // Wichtig: `top-5` oder dein gewünschter Abstand
                style={{ y }}
            >
                {children}
            </motion.div>
        </div>
    );
};