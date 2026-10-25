/* Adapted from Magic UI NumberTicker (MIT).
 * https://github.com/magicuidesign/magicui
 *
 * The upstream component starts at 0 in the DOM, which would leave the
 * prerendered/no-JS stats reading 0. This version renders the final value on
 * the server, then animates 0 -> value once the figure enters the viewport.
 * Reduced motion keeps the final value.
 */
import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "motion/react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function NumberTicker({ value, className, ...props }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || reduced || !isInView) return;
    motionValue.set(0);
    const id = requestAnimationFrame(() => motionValue.set(value));
    return () => cancelAnimationFrame(id);
  }, [mounted, reduced, isInView, motionValue, value]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US").format(Math.round(latest));
        }
      }),
    [springValue],
  );

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)} {...props}>
      {value}
    </span>
  );
}
