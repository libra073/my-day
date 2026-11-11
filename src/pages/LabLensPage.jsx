import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas-pro';
import RefractionCanvas from '../components/lab/RefractionCanvas';

const PANEL = { width: 380, height: 220 };

export default function LabLensPage() {
  const sceneRef = useRef(null);
  const panelRef = useRef(null);
  const [texture, setTexture] = useState(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [captureMs, setCaptureMs] = useState(null);
  const [strength, setStrength] = useState(14);
  const [blur, setBlur] = useState(1.2);
  const [rim, setRim] = useState(0.18);
  const [live, setLive] = useState(false);
  const [showTexture, setShowTexture] = useState(false);

  const capture = useCallback(async () => {
    const scene = sceneRef.current;
    const panel = panelRef.current;
    if (!scene || !panel) return;
    const started = performance.now();
    const canvas = await html2canvas(scene, {
      backgroundColor: null,
      scale: 1,
      logging: false,
      useCORS: true,
      removeContainer: true,
    });
    const sceneRect = scene.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const nextOrigin = { x: panelRect.left - sceneRect.left, y: panelRect.top - sceneRect.top };
    setOrigin(nextOrigin);
    setTexture(canvas);
    setCaptureMs(Math.round(performance.now() - started));
  }, []);

  useEffect(() => {
    const timer = setTimeout(capture, 400);
    return () => clearTimeout(timer);
  }, [capture]);

  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(capture, 280);
    return () => clearInterval(id);
  }, [live, capture]);

  const strengthLabel = useMemo(() => `${strength}px`, [strength]);

  return (
    <div className="lab">
      <header className="lab__head">
        <div>
          <p className="lab__eyebrow">Hidden lab · not linked in the app</p>
          <h1 className="lab__title">True refraction, judged side by side</h1>
          <p className="lab__sub">
            Left: the CSS glass shipped today. Right: a captured backdrop pushed through a WebGL lens.
            Same position, same content — only the optics differ.
          </p>
        </div>
        <div className="lab__stats">
          <span>{captureMs ? `capture ${captureMs} ms` : 'capturing…'}</span>
          <span>{live ? 'live 4fps' : 'static'}</span>
        </div>
      </header>

      <div className="lab__controls">
        <button type="button" onClick={capture} className="lab__btn">Re-capture</button>
        <label className="lab__range">
          Bend <input type="range" min="0" max="80" value={strength} onChange={(e) => setStrength(Number(e.target.value))} />
          <b>{strengthLabel}</b>
        </label>
        <label className="lab__range">
          Soften <input type="range" min="0" max="4" step="0.2" value={blur} onChange={(e) => setBlur(Number(e.target.value))} />
          <b>{blur.toFixed(1)}</b>
        </label>
        <label className="lab__range">
          Rim <input type="range" min="0" max="0.5" step="0.02" value={rim} onChange={(e) => setRim(Number(e.target.value))} />
          <b>{rim.toFixed(2)}</b>
        </label>
        <label className="lab__check">
          <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> live capture
        </label>
        <label className="lab__check">
          <input type="checkbox" checked={showTexture} onChange={(e) => setShowTexture(e.target.checked)} /> show texture
        </label>
      </div>

      <div className="lab__stage">
        <div className="lab__scene" ref={sceneRef}>
          <img className="lab__photo" src="/portfolio/gele-portrait.jpg" alt="" />
          <div className="lab__scrim" />
          <div className="lab__scene-copy">
            <span className="lab__badge">Zanzibar · Destination weddings</span>
            <h2>Gold, lace and a very long veil.</h2>
            <p>Real couples, documented across the coast — the kind of frame that makes you stop scrolling.</p>
          </div>
          <div className="lab__tiles">
            <div className="lab__tile"><b>TSh 4.2M</b><span>average spend</span></div>
            <div className="lab__tile"><b>18</b><span>verified venues</span></div>
            <div className="lab__tile"><b>96%</b><span>couples rebook</span></div>
          </div>
          <div className="lab__ticker">EST. 2026 · DAR ES SALAAM · ARUSHA · ZANZIBAR · MWANZA</div>
        </div>

        <div className="lab__panels">
          <div className="lab__panel lab__panel--css">
            <div className="lab__panel-inner">
              <span className="lab__panel-kicker">CSS glass</span>
              <h3>Reserve with 30% escrow</h3>
              <p>Blurred backdrop, no displacement.</p>
            </div>
          </div>

          <div className="lab__panel lab__panel--webgl" ref={panelRef}>
            {texture && (
              <RefractionCanvas
                texture={texture}
                origin={origin}
                width={PANEL.width}
                height={PANEL.height}
                strength={strength}
                blur={blur}
                rim={rim}
              />
            )}
            <div className="lab__panel-tint" />
            <div className="lab__panel-inner">
              <span className="lab__panel-kicker">WebGL lens</span>
              <h3>Reserve with 30% escrow</h3>
              <p>Captured backdrop, bent at the rim.</p>
            </div>
          </div>
        </div>
      </div>

      {showTexture && texture && (
        <div className="lab__texture">
          <img src={texture.toDataURL('image/png')} alt="captured backdrop" />
        </div>
      )}

      <footer className="lab__foot">
        Capture is a full DOM rasterisation: {captureMs ?? '—'} ms per frame at 1× on this machine.
        At 4fps that is already visible CPU cost; at 60fps it is not viable, which is the whole argument
        for pre-rendered plates or a backdrop-only canvas.
      </footer>
    </div>
  );
}
