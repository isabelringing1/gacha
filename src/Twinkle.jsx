import { useEffect, useRef, useState } from "react";

export default function Twinkle(props) {
  const { data } = props;

  const containerRef = useRef(null);
  const [isBig] = useState(() => Math.random() < 0.15);
  const [duration] = useState(() => 3 + Math.random() * 2.3);
  const [delay] = useState(() => -Math.random() * (3 + 2.3));

  function randomizeDirection() {
    const el = containerRef.current;
    if (!el) return;
    const a = Math.random() * Math.PI * 2;
    const height = window.screen.height;
    const d = Math.random() * height * 0.9 + height * 0.2;
    const rot = Math.random() * 180;
    el.style.setProperty("--tw-dx", `${Math.cos(a) * d}px`);
    el.style.setProperty("--tw-dy", `${Math.sin(a) * d}px`);
    el.style.setProperty("--tw-rot", `${rot}deg`);
  }

  useEffect(() => {
    randomizeDirection();
  }, []);

  return (
    <div
      ref={containerRef}
      className="twinkle-container"
      onAnimationIteration={randomizeDirection}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className={isBig ? "twinkle twinkle-big" : "twinkle twinkle-small"}
        style={{
          backgroundColor: data.custom_palette[2],
          clipPath:
            "polygon(50% 0, calc(50%*(1 + sin(.4turn))) calc(50%*(1 - cos(.4turn))), calc(50%*(1 - sin(.2turn))) calc(50%*(1 - cos(.2turn))), calc(50%*(1 + sin(.2turn))) calc(50%*(1 - cos(.2turn))), calc(50%*(1 - sin(.4turn))) calc(50%*(1 - cos(.4turn))))",
          filter: `drop-shadow(0 0 0.3vh ${data.font_color}) drop-shadow(0 0 1.5vh ${data.twinkle_shadow})`,
          transform: "rotate(var(--tw-rot, 0deg))",
        }}
      />
    </div>
  );
}
