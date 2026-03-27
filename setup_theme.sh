#!/bin/bash
set -e


# Remove old frontend (optional – backup if you want)
rm -rf frontend

# Create new frontend structure
mkdir -p frontend/public

# Copy the CSS/JS theme into all pages
cat > frontend/public/style.css << 'EOF'
/* ── Phantom Sans (Hack Club's actual font) ── */
@font-face {
  font-family:'Phantom Sans';
  src:url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff2') format('woff2'),
      url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff') format('woff');
  font-weight:400;font-style:normal;font-display:swap;
}
@font-face {
  font-family:'Phantom Sans';
  src:url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Bold.woff2') format('woff2'),
      url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Bold.woff') format('woff');
  font-weight:700;font-style:normal;font-display:swap;
}

:root{
  --bp-lighter:#344b6a;
  --bp-dark:#0e305b;
  --bp-darker:#081c35;
  --bp-light:#dbe4ee;
  --bp-danger:#fe8e86;
  --bp-danger-darker:#bd4c44;
  --bp-warning:#ffc857;
  --bp-success:#a8f0ae;
  --f:'Phantom Sans','Poppins',sans-serif;
  --fh:'Poppins',sans-serif;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:16px;}
body{
  font-family:var(--f);
  background:var(--bp-dark);
  color:#fff;
  min-height:100vh;
  overscroll-behavior:none;
  -webkit-font-smoothing:antialiased;
  background-image:
    linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
  background-size:50px 50px;
  background-position:0 0,0 0;
  background-color:var(--bp-dark);
  position:relative;
}
body::after{
  content:"";
  position:fixed;inset:0;
  background:radial-gradient(ellipse,#000000b1,transparent);
  opacity:.4;
  filter:url(#grainy);
  mix-blend-mode:multiply;
  pointer-events:none;
  z-index:0;
}
.z1{position:relative;z-index:1;}
.view{display:none;min-height:100vh;flex-direction:column;align-items:center;justify-content:center;padding:24px 16px;}
.view.active{display:flex;}
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  font-family:var(--fh);font-weight:700;font-size:15px;
  padding:9px 22px;cursor:pointer;border:none;
  transition:background .15s,border-color .15s;line-height:1.4;
}
.btn-primary{border:2px solid #fff;background:#fff;color:#111827;}
.btn-primary:hover{background:var(--bp-light);border-color:var(--bp-light);}
.btn-outline{border:2px solid #fff;background:transparent;color:#fff;}
.btn-outline:hover{background:rgba(255,255,255,.1);}
.btn-block{width:100%;}
.card{
  width:100%;max-width:440px;
  background:var(--bp-darker);
  border:2px solid rgba(255,255,255,.14);
  padding:40px 36px;
  animation:rise .4s cubic-bezier(.16,1,.3,1) both;
}
@keyframes rise{
  from{opacity:0;transform:translateY(22px);}
  to{opacity:1;transform:translateY(0);}
}
.card-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--bp-warning);margin-bottom:10px;}
.card-h1{font-family:var(--fh);font-size:28px;font-weight:800;line-height:1.15;margin-bottom:6px;}
.card-sub{font-size:14px;color:rgba(255,255,255,.55);line-height:1.65;margin-bottom:28px;}
.field{margin-bottom:14px;}
.field label{
  display:block;font-size:10px;font-weight:700;
  letter-spacing:.13em;text-transform:uppercase;
  color:rgba(255,255,255,.48);margin-bottom:6px;
}
.field input{
  width:100%;font-family:var(--f);font-size:15px;
  padding:11px 14px;
  background:var(--bp-dark);
  border:2px solid rgba(255,255,255,.18);
  color:#fff;outline:none;
  transition:border-color .15s;
}
.field input:focus{border-color:rgba(255,255,255,.6);}
.msg{font-size:13px;margin-top:10px;padding:10px 14px;border:2px solid;display:none;line-height:1.5;}
.msg.err{color:var(--bp-danger);border-color:var(--bp-danger-darker);background:rgba(254,142,134,.07);}
.msg.ok {color:var(--bp-success);border-color:rgba(168,240,174,.3);background:rgba(168,240,174,.06);}
.toast{
  position:fixed;bottom:20px;right:20px;z-index:999;
  font-family:var(--fh);font-size:13px;font-weight:700;
  padding:12px 18px;border:2px solid;
  transform:translateY(60px);opacity:0;
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
  pointer-events:none;max-width:280px;
}
.toast.show{transform:translateY(0);opacity:1;}
.toast.t-ok  {background:rgba(168,240,174,.1);color:var(--bp-success);border-color:rgba(168,240,174,.35);}
.toast.t-err {background:rgba(254,142,134,.1);color:var(--bp-danger);border-color:var(--bp-danger-darker);}
.toast.t-info{background:var(--bp-darker);color:var(--bp-warning);border-color:var(--bp-warning);}
.hint-box{
  margin-top:18px;padding:12px 14px;
  background:rgba(255,200,87,.06);
  border:1px solid rgba(255,200,87,.25);
  font-size:12px;color:rgba(255,255,255,.55);line-height:1.6;
}
@media(max-width:480px){
  .card{padding:28px 18px;}
}
EOF

# Create the grain SVG filter (shared)
cat > frontend/public/grain.svg << 'EOF'
<svg width="0" height="0" style="position:fixed">
  <filter id="grainy" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
</svg>
EOF

# Registration page (index.html)
cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Guild Kochi — Register</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <svg width="0" height="0" style="position:fixed">
    <filter id="grainy" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
  </svg>

  <div class="view active z1">
    <div class="card">
      <div class="card-eyebrow">Build Guild Kochi · April 2025</div>
      <div class="card-h1">Get your <span style="color:var(--bp-warning)">QR Pass</span></div>
      <div class="card-sub">Register with your name and email. You'll receive a QR code to check in at the event.</div>

      <div class="field">
        <label>Full Name</label>
        <input type="text" id="name" placeholder="Arjun Menon" autocomplete="name">
      </div>
      <div class="field">
        <label>Email Address</label>
        <input type="email" id="email" placeholder="arjun@email.com" autocomplete="email">
      </div>
      <div class="field">
        <label>Phone (optional)</label>
        <input type="tel" id="phone" placeholder="+91 98765 43210">
      </div>

      <button class="btn btn-primary btn-block" onclick="register()">Register →</button>
      <div class="msg err" id="err-msg"></div>
      <div class="msg ok" id="ok-msg"></div>

      <div class="hint-box">
        <strong>Already registered?</strong> <a href="resend.html" style="color:var(--bp-warning)">Resend your QR</a> or go to the <a href="admin.html" style="color:var(--bp-warning)">admin panel</a>.
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    function toast(msg, type='info') {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = `toast show t-${type}`;
      setTimeout(() => t.classList.remove('show'), 3400);
    }

    async function register() {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();

      const errDiv = document.getElementById('err-msg');
      const okDiv = document.getElementById('ok-msg');
      errDiv.style.display = 'none';
      okDiv.style.display = 'none';

      if (!name || !email) {
        errDiv.textContent = 'Name and email are required.';
        errDiv.style.display = 'block';
        return;
      }

      try {
        const res = await fetch('/api/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone })
        });
        const data = await res.json();
        if (res.ok) {
          okDiv.textContent = data.msg + ' Redirecting to your pass...';
          okDiv.style.display = 'block';
          // Store email to retrieve QR later
          localStorage.setItem('qrEmail', email);
          setTimeout(() => {
            window.location.href = `/pass.html?email=${encodeURIComponent(email)}`;
          }, 2000);
        } else {
          errDiv.textContent = data.msg || 'Registration failed';
          errDiv.style.display = 'block';
        }
      } catch (err) {
        errDiv.textContent = 'Network error. Please try again.';
        errDiv.style.display = 'block';
      }
    }
  </script>
</body>
</html>
EOF

# QR Pass page (pass.html)
cat > frontend/public/pass.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Guild Kochi — Your Pass</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    .pass-wrap{width:100%;max-width:420px;animation:rise .4s cubic-bezier(.16,1,.3,1) both;}
    .pass-hero{
      background:var(--bp-darker);
      border:2px solid rgba(255,255,255,.14);border-bottom:none;
      padding:28px 28px 22px;text-align:center;
    }
    .avatar{
      width:58px;height:58px;
      background:var(--bp-warning);color:var(--bp-darker);
      font-family:var(--fh);font-size:21px;font-weight:800;
      display:flex;align-items:center;justify-content:center;
      margin:0 auto 12px;border:2px solid #fff;
    }
    .p-name{font-family:var(--fh);font-size:20px;font-weight:800;}
    .p-email{font-size:13px;color:rgba(255,255,255,.5);margin-top:3px;}
    .p-ticket{
      display:inline-block;margin-top:10px;padding:4px 14px;
      font-size:11px;font-weight:700;letter-spacing:.18em;
      border:2px solid var(--bp-warning);color:var(--bp-warning);
    }
    .status-pill{
      display:inline-flex;align-items:center;gap:6px;margin-top:11px;
      padding:5px 14px;border:2px solid;
      font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    }
    .status-pill.waiting{color:rgba(255,255,255,.5);border-color:rgba(255,255,255,.18);}
    .status-pill.done{color:var(--bp-success);border-color:rgba(168,240,174,.35);background:rgba(168,240,174,.06);}
    .ev-bar{display:flex;border:2px solid rgba(255,255,255,.1);border-top:1px solid rgba(255,255,255,.07);margin-top:14px;}
    .ev-cell{flex:1;padding:10px 6px;text-align:center;border-right:1px solid rgba(255,255,255,.1);}
    .ev-cell:last-child{border-right:none;}
    .ev-lbl{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.36);}
    .ev-val{font-family:var(--fh);font-size:12px;font-weight:700;color:var(--bp-warning);margin-top:3px;}
    .qr-section{
      background:var(--bp-dark);
      border:2px solid rgba(255,255,255,.14);border-top:none;
      padding:26px 28px 28px;text-align:center;
    }
    .qr-lbl{font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:16px;}
    #qr-wrap{display:inline-block;background:#fff;padding:12px;border:2px solid rgba(255,255,255,.22);}
    .qr-cap{font-size:12px;color:rgba(255,255,255,.4);margin-top:13px;line-height:1.65;}
    .pass-actions{display:flex;flex-direction:column;gap:9px;margin-top:18px;}
  </style>
</head>
<body>
  <svg width="0" height="0" style="position:fixed">
    <filter id="grainy" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
  </svg>

  <div class="view active z1">
    <div class="pass-wrap">
      <div class="pass-hero">
        <div class="avatar" id="p-av">—</div>
        <div class="p-name"   id="p-name">—</div>
        <div class="p-email"  id="p-email">—</div>
        <div class="p-ticket" id="p-ticket">—</div>
        <span class="status-pill waiting" id="p-status">⏳ &nbsp;Awaiting check-in</span>
        <div class="ev-bar">
          <div class="ev-cell"><div class="ev-lbl">Event</div><div class="ev-val">Build Guild</div></div>
          <div class="ev-cell"><div class="ev-lbl">Location</div><div class="ev-val">Kochi, India</div></div>
          <div class="ev-cell"><div class="ev-lbl">Dates</div><div class="ev-val">Apr 13–19</div></div>
        </div>
      </div>

      <div class="qr-section">
        <div class="qr-lbl">Your Check-In QR Code</div>
        <div id="qr-wrap"></div>
        <div class="qr-cap">Show this to the organiser at the entrance.<br/>They will scan it to confirm your attendance.</div>
        <div class="pass-actions">
          <button class="btn btn-outline btn-block" onclick="dlQR()">⬇ &nbsp;Save QR as Image</button>
          <button class="btn btn-danger-ghost btn-block" onclick="window.location.href='/'">← Register with another email</button>
        </div>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let currentUser = null;

    async function fetchUserByEmail(email) {
      const res = await fetch(`/api/user/by-email?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('User not found');
      return await res.json();
    }

    async function loadPass() {
      const urlParams = new URLSearchParams(window.location.search);
      let email = urlParams.get('email');
      if (!email) email = localStorage.getItem('qrEmail');
      if (!email) {
        window.location.href = '/';
        return;
      }
      try {
        const user = await fetchUserByEmail(email);
        currentUser = user;
        renderPass(user);
        localStorage.setItem('qrEmail', email);
        // Poll check-in status every 5 seconds
        setInterval(async () => {
          try {
            const updated = await fetchUserByEmail(email);
            if (updated.checkedIn !== currentUser.checkedIn) {
              currentUser = updated;
              updateStatus(updated.checkedIn);
              toast(updated.checkedIn ? '✨ Checked in! ✨' : '', 'ok');
            }
          } catch(e) { console.log(e); }
        }, 5000);
      } catch (err) {
        toast('Could not load your pass. Please register again.', 'err');
        setTimeout(() => window.location.href = '/', 2000);
      }
    }

    function renderPass(user) {
      const initials = user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2);
      document.getElementById('p-av').textContent = initials;
      document.getElementById('p-name').textContent = user.name;
      document.getElementById('p-email').textContent = user.email;
      document.getElementById('p-ticket').textContent = user._id.slice(-6).toUpperCase();
      updateStatus(user.checkedIn);

      const wrap = document.getElementById('qr-wrap');
      wrap.innerHTML = '';
      new QRCode(wrap, {
        text: user.qrToken,
        width: 216,
        height: 216,
        colorDark: '#081c35',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    }

    function updateStatus(checkedIn) {
      const statusSpan = document.getElementById('p-status');
      if (checkedIn) {
        statusSpan.className = 'status-pill done';
        statusSpan.innerHTML = '✅ &nbsp;Checked in';
      } else {
        statusSpan.className = 'status-pill waiting';
        statusSpan.innerHTML = '⏳ &nbsp;Awaiting check-in';
      }
    }

    function dlQR() {
      const img = document.querySelector('#qr-wrap img');
      if (!img) { toast('QR not ready yet.', 'err'); return; }
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `BuildGuild-${currentUser.name.replace(/\s/g,'')}.png`;
      a.click();
      toast('QR saved!', 'ok');
    }

    function toast(msg, type='info') {
      const t = document.getElementById('toast');
      if (!msg) return;
      t.textContent = msg;
      t.className = `toast show t-${type}`;
      setTimeout(() => t.classList.remove('show'), 3400);
    }

    loadPass();
  </script>
</body>
</html>
EOF

# Resend QR page (resend.html)
cat > frontend/public/resend.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resend QR — Build Guild Kochi</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <svg width="0" height="0" style="position:fixed">
    <filter id="grainy" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
  </svg>

  <div class="view active z1">
    <div class="card">
      <div class="card-eyebrow">Resend your QR</div>
      <div class="card-h1">Didn’t get your <span style="color:var(--bp-warning)">QR code?</span></div>
      <div class="card-sub">Enter the email you registered with, and we’ll send it again.</div>

      <div class="field">
        <label>Email Address</label>
        <input type="email" id="email" placeholder="arjun@email.com">
      </div>

      <button class="btn btn-primary btn-block" onclick="resend()">Resend QR →</button>
      <div class="msg err" id="err-msg"></div>
      <div class="msg ok" id="ok-msg"></div>

      <div class="hint-box">
        <a href="/" style="color:var(--bp-warning)">← Back to registration</a>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    async function resend() {
      const email = document.getElementById('email').value.trim();
      const errDiv = document.getElementById('err-msg');
      const okDiv = document.getElementById('ok-msg');
      errDiv.style.display = 'none';
      okDiv.style.display = 'none';

      if (!email) {
        errDiv.textContent = 'Please enter your email.';
        errDiv.style.display = 'block';
        return;
      }

      try {
        const res = await fetch('/api/user/resend-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          okDiv.textContent = data.msg + ' Redirecting to your pass...';
          okDiv.style.display = 'block';
          localStorage.setItem('qrEmail', email);
          setTimeout(() => {
            window.location.href = `/pass.html?email=${encodeURIComponent(email)}`;
          }, 2000);
        } else {
          errDiv.textContent = data.msg || 'Email not found. Please register first.';
          errDiv.style.display = 'block';
        }
      } catch (err) {
        errDiv.textContent = 'Network error. Please try again.';
        errDiv.style.display = 'block';
      }
    }
  </script>
</body>
</html>
EOF

# Admin login (admin.html)
cat > frontend/public/admin.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Build Guild Kochi</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <svg width="0" height="0" style="position:fixed">
    <filter id="grainy" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
  </svg>

  <div class="view active z1">
    <div class="card">
      <div class="card-eyebrow">Admin Login</div>
      <div class="card-h1">Organiser <span style="color:var(--bp-warning)">Dashboard</span></div>
      <div class="card-sub">Enter your admin credentials to manage check‑ins.</div>

      <div class="field">
        <label>Email</label>
        <input type="email" id="email" placeholder="admin@example.com">
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" id="password">
      </div>

      <button class="btn btn-primary btn-block" onclick="login()">Login →</button>
      <div class="msg err" id="err-msg"></div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    async function login() {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const errDiv = document.getElementById('err-msg');
      errDiv.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('adminToken', data.token);
          window.location.href = '/dashboard.html';
        } else {
          errDiv.textContent = data.msg || 'Invalid credentials';
          errDiv.style.display = 'block';
        }
      } catch (err) {
        errDiv.textContent = 'Network error.';
        errDiv.style.display = 'block';
      }
    }
  </script>
</body>
</html>
EOF

# Admin dashboard (dashboard.html)
cat > frontend/public/dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>Admin Dashboard — Build Guild Kochi</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
  <style>
    .stats-grid { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-card { background: var(--bp-darker); border: 2px solid rgba(255,255,255,.14); padding: 16px 24px; flex: 1; text-align: center; }
    .stat-number { font-size: 32px; font-weight: 800; color: var(--bp-warning); }
    .stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: .1em; }
    .section { background: var(--bp-darker); border: 2px solid rgba(255,255,255,.14); padding: 20px; margin-bottom: 24px; }
    .section h2 { font-size: 18px; margin-bottom: 16px; }
    .user-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .user-table th, .user-table td { border: 1px solid rgba(255,255,255,.2); padding: 8px; text-align: left; }
    .user-table th { background: rgba(0,0,0,.3); }
    .btn-small { padding: 4px 12px; font-size: 12px; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .scan-area { margin-bottom: 20px; }
    #reader { width: 100%; max-width: 400px; margin: 0 auto; }
    @media (max-width: 600px) { .stats-grid { flex-direction: column; } .stat-card { margin-bottom: 10px; } }
  </style>
</head>
<body>
  <svg width="0" height="0" style="position:fixed">
    <filter id="grainy" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
  </svg>

  <div class="view active z1" style="padding-top: 40px;">
    <div style="width:100%; max-width: 1100px;">
      <div class="flex-between" style="margin-bottom: 20px;">
        <h1 style="font-size: 28px;">📋 Admin Dashboard</h1>
        <button class="btn btn-outline btn-small" onclick="logout()">Logout</button>
      </div>

      <div class="stats-grid" id="stats">
        <div class="stat-card"><div class="stat-number" id="total-reg">-</div><div class="stat-label">Total Registered</div></div>
        <div class="stat-card"><div class="stat-number" id="total-checked">-</div><div class="stat-label">Checked In</div></div>
      </div>

      <div class="section">
        <h2>📷 Scan QR Code</h2>
        <div class="scan-area">
          <div id="reader"></div>
          <div id="scan-result" class="msg" style="margin-top: 12px;"></div>
        </div>
      </div>

      <div class="section">
        <h2>✍️ Manual Walk‑in Registration</h2>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <input type="text" id="man-name" placeholder="Full Name" style="flex:1; padding: 8px; background: var(--bp-dark); border:1px solid rgba(255,255,255,.2); color:#fff;">
          <input type="email" id="man-email" placeholder="Email" style="flex:1; padding: 8px; background: var(--bp-dark); border:1px solid rgba(255,255,255,.2); color:#fff;">
          <input type="tel" id="man-phone" placeholder="Phone (optional)" style="flex:1; padding: 8px; background: var(--bp-dark); border:1px solid rgba(255,255,255,.2); color:#fff;">
          <button class="btn btn-primary" onclick="manualRegister()">Register</button>
        </div>
        <div id="man-msg" class="msg" style="margin-top: 12px;"></div>
      </div>

      <div class="section">
        <div class="flex-between">
          <h2>👥 Attendees</h2>
          <button class="btn btn-outline btn-small" onclick="exportCSV()">Export CSV</button>
        </div>
        <div style="overflow-x: auto;">
          <table class="user-table" id="user-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Checked In At</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let token = localStorage.getItem('adminToken');
    if (!token) window.location.href = '/admin.html';

    const headers = { 'x-auth-token': token };

    // Stats
    async function loadStats() {
      const res = await fetch('/api/admin/stats', { headers });
      const data = await res.json();
      document.getElementById('total-reg').innerText = data.total;
      document.getElementById('total-checked').innerText = data.checkedIn;
    }

    // Users list
    async function loadUsers() {
      const res = await fetch('/api/admin/users', { headers });
      const users = await res.json();
      const tbody = document.querySelector('#user-table tbody');
      tbody.innerHTML = '';
      users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.phone || '-'}</td>
          <td>${u.checkedIn ? '✅ Checked In' : '❌ Not Checked In'}</td>
          <td>${u.checkedInAt ? new Date(u.checkedInAt).toLocaleString() : '-'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Manual registration
    async function manualRegister() {
      const name = document.getElementById('man-name').value.trim();
      const email = document.getElementById('man-email').value.trim();
      const phone = document.getElementById('man-phone').value.trim();
      const msgDiv = document.getElementById('man-msg');
      msgDiv.style.display = 'none';
      if (!name || !email) {
        msgDiv.textContent = 'Name and email are required.';
        msgDiv.className = 'msg err';
        msgDiv.style.display = 'block';
        return;
      }
      try {
        const res = await fetch('/api/admin/manual-register', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone })
        });
        const data = await res.json();
        if (res.ok) {
          msgDiv.textContent = data.msg + ' QR sent to email.';
          msgDiv.className = 'msg ok';
          msgDiv.style.display = 'block';
          document.getElementById('man-name').value = '';
          document.getElementById('man-email').value = '';
          document.getElementById('man-phone').value = '';
          loadStats();
          loadUsers();
        } else {
          msgDiv.textContent = data.msg || 'Registration failed';
          msgDiv.className = 'msg err';
          msgDiv.style.display = 'block';
        }
      } catch (err) {
        msgDiv.textContent = 'Network error.';
        msgDiv.className = 'msg err';
        msgDiv.style.display = 'block';
      }
    }

    // QR Scanner
    let scanner;
    function startScanner() {
      const reader = document.getElementById('reader');
      scanner = new Html5Qrcode("reader");
      scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (decoded) => {
        handleScan(decoded);
      }, (err) => { console.log(err); });
    }

    async function handleScan(token) {
      try {
        const res = await fetch('/api/admin/scan', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        const resultDiv = document.getElementById('scan-result');
        if (res.ok) {
          resultDiv.textContent = `✅ ${data.msg}`;
          resultDiv.className = 'msg ok';
          resultDiv.style.display = 'block';
          loadStats();
          loadUsers();
          setTimeout(() => resultDiv.style.display = 'none', 3000);
        } else {
          resultDiv.textContent = `❌ ${data.msg}`;
          resultDiv.className = 'msg err';
          resultDiv.style.display = 'block';
          setTimeout(() => resultDiv.style.display = 'none', 3000);
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Export CSV
    async function exportCSV() {
      const res = await fetch('/api/admin/users', { headers });
      const users = await res.json();
      const headersCSV = ['Name','Email','Phone','Checked In','Checked In At','Registered At'];
      const rows = users.map(u => [
        u.name, u.email, u.phone || '',
        u.checkedIn ? 'Yes' : 'No',
        u.checkedInAt ? new Date(u.checkedInAt).toLocaleString() : '',
        new Date(u.createdAt).toLocaleString()
      ]);
      const csv = [headersCSV, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'attendees.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    }

    function logout() {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin.html';
    }

    function toast(msg, type='info') {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = `toast show t-${type}`;
      setTimeout(() => t.classList.remove('show'), 3400);
    }

    // Initial load
    loadStats();
    loadUsers();
    startScanner();
  </script>
</body>
</html>
EOF

# Add a new API endpoint to get user by email (for the pass page)
# We'll add this to routes/user.js
cat >> backend/routes/user.js << 'EOF'

// Get user by email (for pass retrieval)
router.get('/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ msg: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
EOF

# Modify backend/server.js to serve static files from frontend/public
# We'll create a backup first, then edit
cp backend/server.js backend/server.js.bak
sed -i '1a const path = require("path");' backend/server.js
sed -i '/app.use(cors());/a app.use(express.static(path.join(__dirname, "../frontend/public")));' backend/server.js
# Add fallback for SPA routing (any unknown route serves index.html)
cat >> backend/server.js << 'EOF'

// Serve frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});
EOF

# Done
echo "✅ Theme integration complete!"
echo ""
echo "Next steps:"
echo "1. Ensure MongoDB is running (or use Atlas)."
echo "2. Start the backend: cd backend && node server.js"
echo "3. Open http://localhost:5000 in your browser."
echo ""
echo "Your app is now using the Build Guild theme. Users can register, get QR codes by email, and admins can scan QR codes from the dashboard."
EOF
