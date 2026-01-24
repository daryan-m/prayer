:root { --bg: #020617; --card: #0f172a; --cyan: #22d3ee; --green: #10b981; --white: #ffffff; }
* { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; }
body { background: var(--bg); color: var(--white); direction: rtl; overflow: hidden; font-size: 1.1rem; }

/* Navbar */
.navbar { position: fixed; top: 0; width: 100%; display: flex; justify-content: space-between; padding: 12px 15px; background: rgba(15, 23, 42, 0.95); z-index: 1000; border-bottom: 1px solid var(--cyan); }
.logo b { color: var(--cyan); font-size: 1.2rem; display: flex; align-items: center; }

/* Sidebar Header Adjustments */
.sidebar { position: fixed; top: 0; right: -100%; width: 280px; height: 100%; background: #0f172a; z-index: 2000; transition: 0.3s; padding: 20px; border-left: 1px solid var(--cyan); }
.sidebar.active { right: 0; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 15px; margin-bottom: 20px; }
.header-title { flex-grow: 1; text-align: center; font-size: 1.2rem; color: var(--cyan); }
.close-btn { color: #f43f5e; font-size: 1.8rem; cursor: pointer; }

/* YouTube Sidebar Style */
.youtube-link-custom { text-decoration: none; display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #1e293b; }
.yt-red { color: #ff0000; font-size: 1.5rem; margin-left: 10px; }
.yt-text { color: white; font-weight: bold; }

/* Main Layout */
.container { padding-top: 55px; display: flex; flex-direction: column; align-items: center; height: 100vh; gap: 8px; }
.clock { font-size: 2.6rem; font-weight: bold; margin-top: 15px; display: flex; justify-content: center; direction: ltr; min-width: 320px; }
.clock .suffix { font-size: 1.4rem; color: var(--cyan); margin-left: 15px; }

.primary-date.centered { text-align: center; width: 100%; color: var(--green); font-weight: bold; font-size: 1.2rem; margin-top: 5px; }
.secondary-dates { font-size: 0.95rem; display: flex; gap: 12px; align-items: center; }
.v-line { width: 1.5px; height: 16px; background: var(--cyan); opacity: 0.6; }

/* Countdown - White Text & Cyan Time */
.timer-tag.big-timer { min-width: 330px; font-size: 1.2rem; color: #ffffff; font-weight: bold; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 20px; border: 1px solid var(--cyan); text-align: center; }
.time-val { color: var(--cyan); font-size: 1.35rem; direction: ltr; display: inline-block; }

/* City Selector - Green Dark Lite */
.select-wrapper { position: relative; width: 92%; max-width: 450px; margin-bottom: 5px; }
.green-dark-dropdown { width: 100%; padding: 10px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.5); color: white; border-radius: 12px; font-size: 1.25rem; text-align: center; appearance: none; }
.green-dark-dropdown option { background: #0f172a; color: white; }
.select-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--green); pointer-events: none; }

/* Prayer Grid & Active Toggle */
.prayer-grid { width: 92%; max-width: 450px; display: flex; flex-direction: column; gap: 5px; }
.prayer-row { display: flex; justify-content: space-between; align-items: center; background: var(--card); padding: 10px 20px; border-radius: 12px; border-right: 6px solid var(--green); border-bottom: 2px solid rgba(16, 185, 129, 0.4); cursor: pointer; }
.prayer-row.deactive { border-right-color: #334155; opacity: 0.6; }
.p-name { display: flex; align-items: center; gap: 12px; }
.p-time { color: var(--cyan); font-weight: bold; font-size: 1.3rem; direction: ltr; }

.sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; z-index: 1500; }
.sidebar-overlay.active { display: block; }
