import React, { useRef, useEffect } from 'react';

interface Sparkle {
  angle: number; dist: number; phase: number;
  speed: number; size: number; isStar: boolean;
}

const SnakeBorder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Capture as non-null for use inside nested closures
    const cnv = canvas as HTMLCanvasElement;
    const c   = ctx   as CanvasRenderingContext2D;

    const R     = 12;       // border-radius matching rounded-xl
    const SPEED = 0.00010;  // fraction-of-perimeter per ms (~10 s per phase)

    /* ── perimeter geometry ─────────────────────────────────────────── */
    function ptAt(pos: number, W: number, H: number): { x: number; y: number } {
      const sW = W - 2 * R, sH = H - 2 * R, aL = (Math.PI / 2) * R;
      const total = 2 * sW + 2 * sH + 4 * aL;
      let d = ((pos % total) + total) % total;

      if (d < sW)  return { x: R + d, y: 0 };           d -= sW;
      if (d < aL)  { const a = -Math.PI/2 + d/aL * (Math.PI/2); return { x: W-R + R*Math.cos(a), y: R + R*Math.sin(a) }; } d -= aL;
      if (d < sH)  return { x: W, y: R + d };            d -= sH;
      if (d < aL)  { const a = d/aL * (Math.PI/2);       return { x: W-R + R*Math.cos(a), y: H-R + R*Math.sin(a) }; } d -= aL;
      if (d < sW)  return { x: W-R - d, y: H };          d -= sW;
      if (d < aL)  { const a = Math.PI/2 + d/aL * (Math.PI/2); return { x: R + R*Math.cos(a), y: H-R + R*Math.sin(a) }; } d -= aL;
      if (d < sH)  return { x: 0, y: H-R - d };          d -= sH;
      const a = Math.PI + d/aL * (Math.PI/2);
      return { x: R + R*Math.cos(a), y: R + R*Math.sin(a) };
    }

    function getTotal(W: number, H: number) {
      const sW = W - 2*R, sH = H - 2*R;
      return 2*sW + 2*sH + 4*(Math.PI/2)*R;
    }

    /* ── sparkles ───────────────────────────────────────────────────── */
    const sparkles: Sparkle[] = Array.from({ length: 14 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist:  6 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.022,
      size:  0.5 + Math.random() * 1.6,
      isStar: Math.random() > 0.45,
    }));

    /* ── state ──────────────────────────────────────────────────────── */
    let cycle = 0;    // 0→1 draw phase, 1→2 erase phase
    let lastT = 0;

    /* ── draw a continuous gradient line from tailPos to headPos ────── */
    function drawLine(tailPos: number, headPos: number, W: number, H: number) {
      if (headPos <= tailPos) return;
      const N = 120;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        pts.push(ptAt(tailPos + (headPos - tailPos) * (i / N), W, H));
      }

      // soft outer glow
      c.beginPath();
      c.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i <= N; i++) c.lineTo(pts[i].x, pts[i].y);
      c.strokeStyle = 'rgba(80, 160, 255, 0.18)';
      c.lineWidth = 8; c.lineJoin = 'round'; c.lineCap = 'round';
      c.stroke();

      // solid core line — single colour, no gradient
      c.beginPath();
      c.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i <= N; i++) c.lineTo(pts[i].x, pts[i].y);
      c.strokeStyle = 'rgba(100, 180, 255, 0.92)';
      c.lineWidth = 2; c.lineJoin = 'round'; c.lineCap = 'round';
      c.stroke();
    }

    /* ── draw head glow + constellation ────────────────────────────── */
    function drawHead(hp: { x: number; y: number }) {
      const halo = c.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 22);
      halo.addColorStop(0,    'rgba(230,245,255,1)');
      halo.addColorStop(0.2,  'rgba(147,197,253,0.9)');
      halo.addColorStop(0.5,  'rgba(96,165,250,0.4)');
      halo.addColorStop(1,    'rgba(15,40,120,0)');
      c.beginPath(); c.arc(hp.x, hp.y, 22, 0, Math.PI*2);
      c.fillStyle = halo; c.fill();

      c.beginPath(); c.arc(hp.x, hp.y, 3.8, 0, Math.PI*2);
      c.fillStyle = 'rgba(245,252,255,1)'; c.fill();

      sparkles.forEach(sp => {
        sp.phase += sp.speed;
        if (sp.phase > Math.PI * 2) {
          sp.phase = 0; sp.angle = Math.random()*Math.PI*2;
          sp.dist = 6 + Math.random()*22; sp.size = 0.5 + Math.random()*1.7;
          sp.speed = 0.014 + Math.random()*0.024; sp.isStar = Math.random()>0.45;
        }
        const b = Math.max(0, Math.sin(sp.phase));
        if (b < 0.02) return;
        const sx = hp.x + Math.cos(sp.angle)*sp.dist;
        const sy = hp.y + Math.sin(sp.angle)*sp.dist;
        c.beginPath(); c.arc(sx, sy, sp.size, 0, Math.PI*2);
        c.fillStyle = `rgba(180,225,255,${b*0.9})`; c.fill();
        if (sp.isStar && sp.size > 1.1) {
          const arm = sp.size * 3.2;
          c.beginPath();
          c.moveTo(sx-arm,sy); c.lineTo(sx+arm,sy);
          c.moveTo(sx,sy-arm); c.lineTo(sx,sy+arm);
          c.strokeStyle = `rgba(180,225,255,${b*0.55})`; c.lineWidth=0.6; c.stroke();
        }
      });
    }

    /* ── animation frame ────────────────────────────────────────────── */
    function frame(t: number) {
      const dt = lastT > 0 ? t - lastT : 16;
      lastT = t;

      cycle += SPEED * dt;
      if (cycle >= 2) cycle = 0;

      const W = cnv.width, H = cnv.height;
      if (W < 4 || H < 4) { rafRef.current = requestAnimationFrame(frame); return; }
      c.clearRect(0, 0, W, H);

      const total = getTotal(W, H);
      let headPos: number, tailPos: number;

      if (cycle < 1) {
        // DRAW phase: head travels, tail stays at 0
        headPos = cycle * total;
        tailPos = 0;
      } else {
        // ERASE phase: head at end, tail catches up
        headPos = total;
        tailPos = (cycle - 1) * total;
      }

      drawLine(tailPos, headPos, W, H);

      rafRef.current = requestAnimationFrame(frame);
    }

    /* ── size sync ──────────────────────────────────────────────────── */
    const sync = () => {
      const p = cnv.parentElement; if (!p) return;
      const { width, height } = p.getBoundingClientRect();
      cnv.width  = Math.round(width);
      cnv.height = Math.round(height);
    };
    sync();
    const ro = new ResizeObserver(sync);
    if (cnv.parentElement) ro.observe(cnv.parentElement);

    rafRef.current = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, zIndex: 20,
      pointerEvents: 'none', borderRadius: '0.75rem',
    }} />
  );
};

export default SnakeBorder;
