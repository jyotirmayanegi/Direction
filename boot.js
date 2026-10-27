/* ================= BOOT: final wiring, then first render ================= */
if (ROLE.grcan) ROLE.grcan.need.automation = 1;
if (ROLE.platcons) ROLE.platcons.need.automation = 2;
if (ROLE.consult) ROLE.consult.need.automation = 1;


/* ---------- profile photo: resize on the device, then upload (works for large phone photos) ---------- */
function loadImageFile(file){
  return new Promise((resolve, reject) => {
    if (window.createImageBitmap) { createImageBitmap(file, {imageOrientation:"from-image"}).then(resolve).catch(() => viaImg()); } else viaImg();
    function viaImg(){ const url = URL.createObjectURL(file), img = new Image(); img.onload = () => { resolve(img); setTimeout(() => URL.revokeObjectURL(url), 1000); }; img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode")); }; img.src = url; }
  });
}
function squareCanvas(src, size){
  const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight, s = Math.min(w, h), c = document.createElement("canvas");
  c.width = c.height = Math.min(size, s); const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(src, (w - s) / 2, (h - s) / 2, s, s, 0, 0, c.width, c.height); return c;
}
async function avatarUpload(file){
  const msg = document.getElementById("avMsg"), say = t => { if (msg) msg.textContent = t; };
  if (!/^image\//.test(file.type || "") && !/\.(jpe?g|png|webp|heic|heif|gif)$/i.test(file.name || "")) { say("That file isn't a photo. Choose a JPG, PNG or phone photo."); return; }
  say("Preparing your photo…");
  let src; try { src = await loadImageFile(file); } catch(e) { say("Your browser can't open this photo format (often HEIC on Android or desktop). Choose 'Most compatible' or JPEG in your camera settings, or pick a screenshot of the photo."); return; }
  const big = squareCanvas(src, 512), small = squareCanvas(src, 160);
  const blob = await new Promise(r => big.toBlob(r, "image/jpeg", 0.86));
  if (cap.assets && blob) {
    try { const r = await cap.assets.upload(blob); S.profile.avatarId = r.id; S.profile.avatarUrl = r.url || ""; S.profile.avatarData = ""; save("profile"); render(); return; }
    catch(e) { /* fall through to the compact copy */ }
  }
  try { S.profile.avatarData = small.toDataURL("image/jpeg", 0.8); S.profile.avatarId = ""; S.profile.avatarUrl = ""; save("profile"); render(); const m = document.getElementById("avMsg"); if (m) m.textContent = "Photo saved with your profile (compact copy)."; }
  catch(e) { say("Couldn't save the photo. Try a different picture."); }
}

/* ---------- late loads once the account database is connected ---------- */
(function waitForDb(n){ if (cap.db && cap.user) { accessInit(); loadAiIdeas(); if (current === "mentors") loadMentors(); return; } if (n < 20) setTimeout(() => waitForDb(n + 1), 500); else accessInit(); })(0);

render();
