// Standalone page — has its own nav/footer, does NOT use global Header/Footer.
// Design matches the provided HTML mock precisely.

const SYNC_CSS = `
.sync-page {
  --magenta: #FF00FF;
  --cyan: #00FFE5;
  --acid: #39FF14;
  --sync-bg: #000000;
  --card: #0D0D0D;
  --border: #1A1A1A;
  --text: #FFFFFF;
  --muted: #666666;
  background: var(--sync-bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.sync-page *,
.sync-page *::before,
.sync-page *::after {
  box-sizing: border-box;
}

.sync-page .sync-grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,255,229,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,229,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.sync-page nav.sync-nav {
  position: relative;
  z-index: 10;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.sync-page .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.sync-page .nav-logo { width: 32px; height: 32px; background: var(--magenta); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: white; }
.sync-page .nav-name { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 2px; color: var(--text); }
.sync-page .nav-tag { font-family: 'Space Mono', monospace; font-size: 11px; color: #444; letter-spacing: 2px; }

.sync-page .hero {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
  max-width: 1100px;
  margin: 0 auto;
  padding: 60px 40px;
  align-items: center;
  min-height: 500px;
}

.sync-page .hero-left { padding-right: 60px; }

.sync-page .badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,255,229,0.08);
  border: 1px solid rgba(0,255,229,0.2);
  border-radius: 100px;
  padding: 6px 16px;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--cyan);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 28px;
}

.sync-page .badge::before { content: ''; width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; animation: sync-pulse 2s infinite; }

@keyframes sync-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.sync-page .hero h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(52px, 6vw, 78px); line-height: 0.95; letter-spacing: 2px; margin-bottom: 20px; margin-top: 0; }
.sync-page .line-white { color: var(--text); }
.sync-page .line-magenta { color: var(--magenta); }
.sync-page .line-cyan { color: var(--cyan); }

.sync-page .hero p { font-size: 15px; color: #888; line-height: 1.7; max-width: 400px; margin: 0; font-weight: 300; }

.sync-page .dj-neko-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.sync-page .dj-neko-wrap::before {
  content: '';
  position: absolute;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(255,0,255,0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.sync-page .dj-neko-svg {
  width: 260px;
  height: 260px;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 24px rgba(255,0,255,0.5)) drop-shadow(0 0 50px rgba(0,255,229,0.2));
  animation: sync-float 4s ease-in-out infinite;
}

@keyframes sync-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.sync-page .neko-label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: var(--magenta);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-top: 16px;
  position: relative;
  z-index: 2;
}

.sync-page .laser { position: absolute; height: 1px; opacity: 0; animation: sync-laser 3s ease-out infinite; }
.sync-page .laser-1 { background: linear-gradient(90deg, rgba(255,0,255,0.8), transparent); top: 38%; right: 140px; width: 180px; animation-delay: 0s; }
.sync-page .laser-2 { background: linear-gradient(90deg, rgba(0,255,229,0.8), transparent); top: 54%; right: 100px; width: 140px; animation-delay: 1.2s; }
.sync-page .laser-3 { background: linear-gradient(270deg, rgba(57,255,20,0.6), transparent); top: 46%; left: 80px; width: 120px; animation-delay: 2.1s; }
@keyframes sync-laser { 0% { opacity: 0; transform: scaleX(0); } 30% { opacity: 1; transform: scaleX(1); } 70% { opacity: 1; } 100% { opacity: 0; } }

.sync-page .stats-strip {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 64px;
}

.sync-page .stat { text-align: center; padding: 24px 56px; border-right: 1px solid var(--border); }
.sync-page .stat:last-child { border-right: none; }
.sync-page .stat-number { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: var(--magenta); line-height: 1; }
.sync-page .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; font-family: 'Space Mono', monospace; }

.sync-page .sync-container { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; padding: 0 24px; }

.sync-page .section-label { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--muted); letter-spacing: 3px; text-transform: uppercase; text-align: center; margin-bottom: 24px; }

.sync-page .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }

.sync-page .app-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  transition: all 0.2s ease;
  text-decoration: none;
  display: block;
  position: relative;
  overflow: hidden;
  color: inherit;
}

.sync-page .app-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.2s; }
.sync-page .app-card.google::before { background: radial-gradient(circle at 50% 0%, rgba(0,255,229,0.1), transparent 70%); }
.sync-page .app-card.apple::before { background: radial-gradient(circle at 50% 0%, rgba(255,0,255,0.1), transparent 70%); }
.sync-page .app-card.outlook::before { background: radial-gradient(circle at 50% 0%, rgba(57,255,20,0.1), transparent 70%); }
.sync-page .app-card:hover { transform: translateY(-2px); }
.sync-page .app-card:hover::before { opacity: 1; }
.sync-page .app-card.google:hover { border-color: var(--cyan); }
.sync-page .app-card.apple:hover { border-color: var(--magenta); }
.sync-page .app-card.outlook:hover { border-color: var(--acid); }

.sync-page .app-icon { width: 48px; height: 48px; margin: 0 auto 12px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; position: relative; z-index: 1; }
.sync-page .app-icon.google { background: rgba(0,255,229,0.1); }
.sync-page .app-icon.apple { background: rgba(255,0,255,0.1); }
.sync-page .app-icon.outlook { background: rgba(57,255,20,0.1); }

.sync-page .app-name { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; margin-bottom: 4px; position: relative; z-index: 1; }
.sync-page .app-sub { font-size: 11px; color: var(--muted); font-family: 'Space Mono', monospace; position: relative; z-index: 1; }
.sync-page .app-card.google .app-name { color: var(--cyan); }
.sync-page .app-card.apple .app-name { color: var(--magenta); }
.sync-page .app-card.outlook .app-name { color: var(--acid); }

.sync-page .download-row {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 64px;
  text-decoration: none;
  transition: border-color 0.2s;
  color: inherit;
}

.sync-page .download-row:hover { border-color: #333; }
.sync-page .download-left { display: flex; align-items: center; gap: 12px; }
.sync-page .download-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.sync-page .download-text { font-size: 14px; color: var(--text); font-weight: 500; }
.sync-page .download-sub { font-size: 11px; color: var(--muted); margin-top: 2px; font-family: 'Space Mono', monospace; }
.sync-page .download-arrow { color: var(--muted); font-size: 18px; transition: color 0.2s; }
.sync-page .download-row:hover .download-arrow { color: var(--cyan); }

.sync-page .steps { display: flex; flex-direction: column; margin-bottom: 64px; }
.sync-page .step { display: flex; gap: 20px; align-items: flex-start; padding: 24px 0; border-bottom: 1px solid var(--border); }
.sync-page .step:last-child { border-bottom: none; }
.sync-page .step-num { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: #444; line-height: 1; min-width: 48px; transition: color 0.2s; }
.sync-page .step:hover .step-num { color: var(--magenta); }
.sync-page .step-content h3 { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; margin: 0 0 6px 0; color: var(--text); }
.sync-page .step-content p { font-size: 14px; color: #777; line-height: 1.6; margin: 0; }

.sync-page .playlist-section { margin-bottom: 64px; }
.sync-page .playlist-header { text-align: center; margin-bottom: 32px; }
.sync-page .playlist-header h2 { font-family: 'Bebas Neue', sans-serif; font-size: 40px; letter-spacing: 2px; margin: 0 0 8px 0; color: var(--text); }
.sync-page .playlist-header h2 span { color: var(--magenta); }
.sync-page .playlist-header p { font-size: 12px; color: var(--muted); font-family: 'Space Mono', monospace; letter-spacing: 1px; margin: 0; }

.sync-page .playlist-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.sync-page .playlist-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px 24px;
  text-decoration: none;
  display: block;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  color: inherit;
}

.sync-page .playlist-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; }
.sync-page .playlist-card.spotify::before { background: radial-gradient(circle at 0% 100%, rgba(29,185,84,0.12), transparent 60%); }
.sync-page .playlist-card.apple-music::before { background: radial-gradient(circle at 0% 100%, rgba(255,45,85,0.12), transparent 60%); }
.sync-page .playlist-card:hover { transform: translateY(-3px); }
.sync-page .playlist-card:hover::before { opacity: 1; }
.sync-page .playlist-card.spotify:hover { border-color: #1DB954; }
.sync-page .playlist-card.apple-music:hover { border-color: #FC3C44; }

.sync-page .playlist-platform { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sync-page .platform-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.sync-page .playlist-card.spotify .platform-icon { background: rgba(29,185,84,0.15); }
.sync-page .playlist-card.apple-music .platform-icon { background: rgba(252,60,68,0.15); }
.sync-page .platform-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; }
.sync-page .playlist-card.spotify .platform-name { color: #1DB954; }
.sync-page .playlist-card.apple-music .platform-name { color: #FC3C44; }

.sync-page .playlist-title { font-size: 15px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
.sync-page .playlist-desc { font-size: 12px; color: var(--muted); line-height: 1.5; margin-bottom: 16px; }

.sync-page .playlist-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.sync-page .playlist-tag { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); border: 1px solid var(--border); border-radius: 4px; padding: 3px 8px; letter-spacing: 1px; }

.sync-page .playlist-cta { display: inline-flex; align-items: center; gap: 6px; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 1px; margin-top: 16px; transition: gap 0.2s; }
.sync-page .playlist-card.spotify .playlist-cta { color: #1DB954; }
.sync-page .playlist-card.apple-music .playlist-cta { color: #FC3C44; }
.sync-page .playlist-card:hover .playlist-cta { gap: 10px; }

.sync-page .coming-soon-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; border-radius: 16px; z-index: 5; }
.sync-page .coming-soon-badge { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: var(--magenta); border: 1px solid var(--magenta); padding: 8px 20px; border-radius: 4px; }

.sync-page .inside-section { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; margin-bottom: 64px; }
.sync-page .inside-section h2 { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; margin: 0 0 24px 0; color: var(--cyan); }
.sync-page .inside-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.sync-page .inside-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #aaa; line-height: 1.5; }
.sync-page .inside-item::before { content: '→'; color: var(--magenta); font-family: 'Space Mono', monospace; flex-shrink: 0; }

.sync-page footer.sync-footer { border-top: 1px solid var(--border); padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
.sync-page .footer-brand { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 2px; color: var(--muted); }
.sync-page .footer-copy { font-size: 12px; color: var(--muted); font-family: 'Space Mono', monospace; }
.sync-page .footer-tagline { font-size: 12px; color: var(--magenta); font-family: 'Space Mono', monospace; }

@media (max-width: 700px) {
  .sync-page .hero { grid-template-columns: 1fr; padding: 40px 20px; }
  .sync-page .hero-left { padding-right: 0; margin-bottom: 40px; }
  .sync-page .apps-grid { grid-template-columns: 1fr; }
  .sync-page .stats-strip { flex-wrap: wrap; }
  .sync-page .stat { width: 50%; border-right: none; border-bottom: 1px solid var(--border); }
  .sync-page .playlist-cards { grid-template-columns: 1fr; }
  .sync-page .inside-grid { grid-template-columns: 1fr; }
  .sync-page footer.sync-footer { flex-direction: column; gap: 8px; text-align: center; }
}
`;

export default function SyncClient({ conventionCount = 0 }: { conventionCount?: number }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500&display=swap"
      />
      <style dangerouslySetInnerHTML={{ __html: SYNC_CSS }} />

      <div className="sync-page">
        <div className="sync-grid-bg" />

        <nav className="sync-nav">
          <a href="/" className="nav-brand">
            <div className="nav-logo">NC</div>
            <span className="nav-name">NEKO CIRCUIT</span>
          </a>
          <span className="nav-tag">CALENDAR SYNC</span>
        </nav>

        <div className="hero">
          <div className="laser laser-1" />
          <div className="laser laser-2" />
          <div className="laser laser-3" />

          <div className="hero-left">
            <div className="badge">Live Feed — Auto Updates</div>
            <h1>
              <span className="line-white">STAY ON</span>
              <br />
              <span className="line-magenta">THE</span>
              <br />
              <span className="line-cyan">CIRCUIT.</span>
            </h1>
            <p>
              {conventionCount} confirmed Midwest anime cons — live in your calendar. Never miss a badge drop, vendor
              deadline, or panel announcement again.
            </p>
          </div>

          <div className="dj-neko-wrap">
            <svg
              className="dj-neko-svg"
              viewBox="0 0 200 200"
              xmlns="https://cdn.pixabay.com/photo/2024/01/15/10/54/cat-8509944_960_720.png"
              aria-label="DJ Neko mascot — cyberpunk cat with glowing ears behind a DJ turntable"
            >
              <defs>
                <linearGradient id="catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF00FF" />
                  <stop offset="100%" stopColor="#00FFE5" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <polygon points="55,60 70,20 85,55" fill="url(#catGrad)" filter="url(#glow)" />
              <polygon points="115,55 130,20 145,60" fill="url(#catGrad)" filter="url(#glow)" />
              <ellipse cx="100" cy="80" rx="50" ry="40" fill="url(#catGrad)" filter="url(#glow)" />
              <path
                d="M 50 75 Q 50 35, 100 30 Q 150 35, 150 75"
                stroke="#00FFE5"
                strokeWidth="4"
                fill="none"
                filter="url(#glow)"
              />
              <ellipse cx="48" cy="78" rx="14" ry="18" fill="#00FFE5" opacity="0.9" filter="url(#glow)" />
              <ellipse cx="152" cy="78" rx="14" ry="18" fill="#00FFE5" opacity="0.9" filter="url(#glow)" />
              <ellipse cx="82" cy="78" rx="8" ry="10" fill="#080808" />
              <ellipse cx="118" cy="78" rx="8" ry="10" fill="#080808" />
              <ellipse cx="84" cy="75" rx="3" ry="4" fill="#fff" />
              <ellipse cx="120" cy="75" rx="3" ry="4" fill="#fff" />
              <polygon points="97,88 103,88 100,92" fill="#FF00FF" />
              <line x1="60" y1="85" x2="30" y2="80" stroke="#FF00FF" strokeWidth="1.5" opacity="0.8" />
              <line x1="60" y1="90" x2="28" y2="92" stroke="#FF00FF" strokeWidth="1.5" opacity="0.8" />
              <line x1="140" y1="85" x2="170" y2="80" stroke="#FF00FF" strokeWidth="1.5" opacity="0.8" />
              <line x1="140" y1="90" x2="172" y2="92" stroke="#FF00FF" strokeWidth="1.5" opacity="0.8" />
              <path
                d="M 65 115 Q 60 100, 70 95 Q 100 85, 130 95 Q 140 100, 135 115 L 140 165 Q 100 175, 60 165 Z"
                fill="url(#catGrad)"
                filter="url(#glow)"
              />
              <ellipse cx="100" cy="160" rx="55" ry="15" fill="none" stroke="#00FFE5" strokeWidth="2" opacity="0.7" />
              <ellipse cx="100" cy="160" rx="35" ry="10" fill="none" stroke="#FF00FF" strokeWidth="1.5" opacity="0.6" />
              <circle cx="100" cy="160" r="5" fill="#FF00FF" opacity="0.9" />
              <ellipse cx="75" cy="152" rx="10" ry="6" fill="url(#catGrad)" opacity="0.9" />
              <ellipse cx="125" cy="152" rx="10" ry="6" fill="url(#catGrad)" opacity="0.9" />
              <line x1="10" y1="130" x2="40" y2="130" stroke="#39FF14" strokeWidth="2" opacity="0.6" />
              <line x1="160" y1="130" x2="190" y2="130" stroke="#39FF14" strokeWidth="2" opacity="0.6" />
              <line x1="15" y1="140" x2="35" y2="140" stroke="#FF00FF" strokeWidth="1" opacity="0.5" />
              <line x1="165" y1="140" x2="185" y2="140" stroke="#FF00FF" strokeWidth="1" opacity="0.5" />
            </svg>
            <div className="neko-label">DJ Neko — 313 Circuit</div>
          </div>
        </div>

        <div className="stats-strip">
          <div className="stat">
            <div className="stat-number">{conventionCount}</div>
            <div className="stat-label">Conventions</div>
          </div>
          <div className="stat">
            <div className="stat-number">9</div>
            <div className="stat-label">States</div>
          </div>
          <div className="stat">
            <div className="stat-number">2026</div>
            <div className="stat-label">Season</div>
          </div>
        </div>

        <div className="sync-container">
          <div className="section-label">Choose your calendar</div>
          <div className="apps-grid">
            <a
              href="https://calendar.google.com/calendar/r?cid=webcal://dateanime.com/api/calendar/neko-circuit-2026.ics"
              className="app-card google"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="app-icon google">📅</div>
              <div className="app-name">Google</div>
              <div className="app-sub">One-tap subscribe</div>
            </a>
            <a href="webcal://dateanime.com/api/calendar/neko-circuit-2026.ics" className="app-card apple">
              <div className="app-icon apple">🍎</div>
              <div className="app-name">Apple</div>
              <div className="app-sub">Opens natively</div>
            </a>
            <a
              href="https://outlook.live.com/calendar/0/addfromweb?url=https://dateanime.com/api/calendar/neko-circuit-2026.ics"
              className="app-card outlook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="app-icon outlook">📊</div>
              <div className="app-name">Outlook</div>
              <div className="app-sub">One-tap subscribe</div>
            </a>
          </div>

          <a
            href="https://dateanime.com/api/calendar/neko-circuit-2026.ics"
            className="download-row"
            download
          >
            <div className="download-left">
              <div className="download-icon">⬇</div>
              <div>
                <div className="download-text">Download .ics file</div>
                <div className="download-sub">For manual import — any calendar app</div>
              </div>
            </div>
            <span className="download-arrow">→</span>
          </a>

          <div className="section-label">How it works</div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-content">
                <h3>Pick your calendar app</h3>
                <p>Google, Apple, or Outlook — tap once. The circuit loads automatically.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-content">
                <h3>All {conventionCount} cons appear instantly</h3>
                <p>
                  Every confirmed Midwest anime convention populates with full dates, venue, and
                  location mapped to your phone.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-content">
                <h3>Your phone reminds you</h3>
                <p>
                  Native calendar reminders fire before every event. Badge drops, hotel blocks,
                  vendor deadlines — all automatic.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">04</div>
              <div className="step-content">
                <h3>Updates sync automatically</h3>
                <p>
                  When new cons get confirmed or dates change, your calendar updates without you
                  doing anything.
                </p>
              </div>
            </div>
          </div>

          <div className="playlist-section">
            <div className="playlist-header">
              <div className="section-label" style={{ marginBottom: '12px' }}>
                The circuit has a soundtrack
              </div>
              <h2>
                TUNE INTO <span>THE FREQUENCY</span>
              </h2>
              <p>Detroit techno · Anime con energy · 313 Circuit vibes</p>
            </div>
            <div className="playlist-cards">
              <a href="#" className="playlist-card spotify">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-badge">COMING SOON</div>
                </div>
                <div className="playlist-platform">
                  <div className="platform-icon">🟢</div>
                  <div className="platform-name">Spotify</div>
                </div>
                <div className="playlist-title">313 Circuit — Official Playlist</div>
                <div className="playlist-desc">
                  Detroit techno, phonk, and the frequencies that power the Midwest anime scene.
                </div>
                <div className="playlist-tags">
                  <span className="playlist-tag">Detroit Techno</span>
                  <span className="playlist-tag">Phonk</span>
                  <span className="playlist-tag">Con Energy</span>
                </div>
                <div className="playlist-cta">Listen on Spotify →</div>
              </a>
              <a href="#" className="playlist-card apple-music">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-badge">COMING SOON</div>
                </div>
                <div className="playlist-platform">
                  <div className="platform-icon">🎵</div>
                  <div className="platform-name">Apple Music</div>
                </div>
                <div className="playlist-title">313 Circuit — Official Playlist</div>
                <div className="playlist-desc">
                  The same frequency, tuned for Apple Music listeners. Stay on the circuit wherever
                  you stream.
                </div>
                <div className="playlist-tags">
                  <span className="playlist-tag">Detroit Techno</span>
                  <span className="playlist-tag">Phonk</span>
                  <span className="playlist-tag">Con Energy</span>
                </div>
                <div className="playlist-cta">Listen on Apple Music →</div>
              </a>
            </div>
          </div>

          <div className="inside-section">
            <h2>What&apos;s in every event</h2>
            <div className="inside-grid">
              <div className="inside-item">Convention name + dates</div>
              <div className="inside-item">Full venue address</div>
              <div className="inside-item">City + state</div>
              <div className="inside-item">Maps-ready location</div>
              <div className="inside-item">ACen · Gen Con · Youmacon</div>
              <div className="inside-item">Colossalcon · Anime Midwest</div>
              <div className="inside-item">9 states covered</div>
              <div className="inside-item">Updates automatically</div>
            </div>
          </div>
        </div>

        <footer className="sync-footer">
          <div className="footer-brand">NEKO CIRCUIT</div>
          <div className="footer-tagline">Stay on the circuit.</div>
          <div className="footer-copy">Detroit, MI · dateanime.com</div>
        </footer>
      </div>
    </>
  );
}
