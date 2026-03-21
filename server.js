const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      email TEXT,
      genre TEXT,
      age TEXT,
      prenom TEXT,
      nom TEXT,
      reponses TEXT,
      texte_libre TEXT,
      date_inscription TEXT
    )
  `);
  console.log('✦ Base de données prête');
}
initDB();

app.post('/sauvegarder', async (req, res) => {
  const { email, genre, age, prenom, nom, reponses, texteLibre } = req.body;
  if (!email || !reponses || reponses.length < 7) return res.status(400).json({ erreur: 'Données incomplètes.' });
  const id = Date.now().toString();
  const date = new Date().toLocaleString('fr-BE');
  await pool.query(
    'INSERT INTO clients (id, email, genre, age, prenom, nom, reponses, texte_libre, date_inscription) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id, email, genre, age, prenom, nom, JSON.stringify(reponses), texteLibre, date]
  );
  try {
    await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + Buffer.from(process.env.MAILJET_API_KEY + ':' + process.env.MAILJET_SECRET_KEY).toString('base64') },
      body: JSON.stringify({ Messages: [{ From: { Email: process.env.SENDER_EMAIL, Name: 'Lechemin' }, To: [{ Email: 'assistantdevente@gmail.com' }], Subject: '🔔 Nouveau client : ' + prenom + ' ' + nom, HTMLPart: '<div style="font-family:Georgia,serif;background:#1a1a1a;padding:40px;color:#e8e0d0;"><h2 style="color:#d4af37;">Nouveau client</h2><p><strong style="color:#d4af37;">Nom :</strong> ' + prenom + ' ' + nom + '</p><p><strong style="color:#d4af37;">Email :</strong> ' + email + '</p><a href="' + process.env.SITE_URL + '/admin" style="color:#d4af37;">Aller sur admin
J'ai été trop pressé... j'ai fait copie colle avant que tout le code ne soit edit cat > server.js << 'EOF'
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      email TEXT,
      genre TEXT,
      age TEXT,
      prenom TEXT,
      nom TEXT,
      reponses TEXT,
      texte_libre TEXT,
      date_inscription TEXT
    )
  `);
  console.log('✦ Base de données prête');
}
initDB();

app.post('/sauvegarder', async (req, res) => {
  const { email, genre, age, prenom, nom, reponses, texteLibre } = req.body;
  if (!email || !reponses || reponses.length < 7) return res.status(400).json({ erreur: 'Données incomplètes.' });
  const id = Date.now().toString();
  const date = new Date().toLocaleString('fr-BE');
  await pool.query(
    'INSERT INTO clients (id, email, genre, age, prenom, nom, reponses, texte_libre, date_inscription) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id, email, genre, age, prenom, nom, JSON.stringify(reponses), texteLibre, date]
  );
  try {
    await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + Buffer.from(process.env.MAILJET_API_KEY + ':' + process.env.MAILJET_SECRET_KEY).toString('base64') },
      body: JSON.stringify({ Messages: [{ From: { Email: process.env.SENDER_EMAIL, Name: 'Lechemin' }, To: [{ Email: 'assistantdevente@gmail.com' }], Subject: '🔔 Nouveau client : ' + prenom + ' ' + nom, HTMLPart: '<div style="font-family:Georgia,serif;background:#1a1a1a;padding:40px;color:#e8e0d0;"><h2 style="color:#d4af37;">Nouveau client</h2><p><strong style="color:#d4af37;">Nom :</strong> ' + prenom + ' ' + nom + '</p><p><strong style="color:#d4af37;">Email :</strong> ' + email + '</p><a href="' + process.env.SITE_URL + '/admin" style="color:#d4af37;">Aller sur admin</a></div>' }] })
    });
  } catch(err) { console.error('Notif:', err); }
  res.json({ succes: true, id });
});

app.get('/admin/clients', async (req, res) => {
  const result = await pool.query('SELECT * FROM clients ORDER BY date_inscription DESC');
  const clients = result.rows.map(r => ({
    id: r.id, email: r.email, genre: r.genre, age: r.age,
    prenom: r.prenom, nom: r.nom,
    reponses: JSON.parse(r.reponses),
    texteLibre: r.texte_libre,
    date: r.date_inscription
  }));
  res.json({ clients });
});

app.post('/admin/envoyer/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ erreur: 'Client introuvable.' });
  const r = result.rows[0];
  const email = r.email, genre = r.genre, age = r.age, prenom = r.prenom, nom = r.nom;
  const reponses = JSON.parse(r.reponses);
  const texteLibre = r.texte_libre;
  const superPrompt = 'Tu es un psychanalyste de renommée mondiale. Style chirurgical et élégant.\n\nPROFIL: Genre: ' + genre + ' | Âge: ' + age + ' | Prénom: ' + prenom + '\n\nRÉPONSES:\n' + reponses.map((r,i) => 'Q'+(i+1)+': '+r).join('\n') + '\n\nTEXTE LIBRE: "' + texteLibre + '"\n\nRédige 15 paragraphes numérotés. Vouvoie le sujet. Utilise le prénom ' + prenom + '. Ton luxueux et mystérieux. Chaque paragraphe commence par un titre en gras. Termine par une phrase mémorable entre guillemets.';
  let analyseTexte = '';
  try {
    const gr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model: 'meta-llama/llama-4-scout-17b-16e-instruct', max_tokens: 3000, temperature: 0.85, messages: [{ role: 'user', content: superPrompt }] })
    });
    const gd = await gr.json();
    analyseTexte = gd.choices?.[0]?.message?.content || '';
  } catch(err) { return res.status(500).json({ erreur: 'Erreur IA.' }); }
  if (!analyseTexte) return res.status(500).json({ erreur: 'Analyse vide.' });
  const analyseHTML = analyseTexte.split('\n').filter(l=>l.trim()).map(l=>'<p style="margin:0 0 16px;line-height:1.8;">'+l+'</p>').join('');
  try {
    const mj = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + Buffer.from(process.env.MAILJET_API_KEY + ':' + process.env.MAILJET_SECRET_KEY).toString('base64') },
      body: JSON.stringify({ Messages: [{ From: { Email: process.env.SENDER_EMAIL, Name: 'Lechemin' }, To: [{ Email: email }], Subject: '✦ ' + prenom + ', votre Analyse — Lechemin', HTMLPart: '<!DOCTYPE html><html><body style="background:#1a1a1a;font-family:Georgia,serif;padding:40px;color:#e8e0d0;"><h1 style="color:#d4af37;">Lechemin</h1><p>Cher(e) ' + prenom + ',</p>' + analyseHTML + '</body></html>' }] })
    });
    const mjd = await mj.json();
    if (mjd.Messages?.[0]?.Status !== 'success') return res.status(500).json({ erreur: 'Erreur Mailjet.' });
  } catch(err) { return res.status(500).json({ erreur: 'Erreur Mailjet.' }); }
  await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
  res.json({ succes: true });
});

app.get('/admin', (req, res) => {
  const mdp = process.env.ADMIN_PASSWORD || 'admin123';
  res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Admin Lechemin</title></head><body style="background:#1a1a1a;color:#e8e0d0;font-family:Georgia,serif;padding:40px;"><div id="lp"><div style="max-width:400px;margin:100px auto;background:#2c2c2c;border:1px solid #d4af37;padding:40px;text-align:center;"><h2 style="color:#d4af37;font-weight:normal;margin-bottom:24px;">✦ Admin</h2><input type="password" id="mdp" placeholder="Mot de passe" style="width:100%;background:#1a1a1a;border:1px solid #4a4030;color:#e8e0d0;font-size:15px;padding:14px;margin-bottom:16px;"><button onclick="go()" style="width:100%;background:transparent;border:1px solid #d4af37;color:#d4af37;font-size:12px;letter-spacing:3px;text-transform:uppercase;padding:14px;cursor:pointer;">Entrer</button><p id="ml" style="color:#a09070;margin-top:10px;font-style:italic;"></p></div></div><div id="ap" style="display:none;max-width:700px;margin:0 auto;"><h1 style="color:#d4af37;font-weight:normal;margin-bottom:30px;">✦ Clients en attente</h1><button onclick="load()" style="background:transparent;border:1px solid #3a3020;color:#5a5040;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:10px 20px;cursor:pointer;margin-bottom:30px;">↻ Rafraîchir</button><div id="lc"></div></div><script>const M="' + mdp + '";function go(){if(document.getElementById("mdp").value===M){document.getElementById("lp").style.display="none";document.getElementById("ap").style.display="block";load();}else document.getElementById("ml").textContent="Mot de passe incorrect.";}async function load(){const r=await fetch("/admin/clients");const d=await r.json();const l=document.getElementById("lc");if(!d.clients.length){l.innerHTML="<p style=\'color:#5a5040;font-style:italic;\'>Aucun client.</p>";return;}l.innerHTML=d.clients.map(c=>`<div style="background:#2c2c2c;border:1px solid #3a3020;padding:24px;margin-bottom:16px;"><div style="color:#d4af37;font-size:18px;margin-bottom:8px;">${c.prenom} ${c.nom}</div><div style="color:#a09070;font-size:13px;margin-bottom:16px;line-height:1.8;">📧 ${c.email}<br>👤 ${c.genre} · ${c.age}<br>📅 ${c.date}</div><button id="b${c.id}" onclick="send(\'${c.id}\')" style="background:transparent;border:1px solid #d4af37;color:#d4af37;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:12px 24px;cursor:pointer;">✦ Envoyer</button><p id="m${c.id}" style="color:#a09070;font-style:italic;font-size:13px;margin-top:10px;"></p></div>`).join("");}async function send(id){const b=document.getElementById("b"+id);const m=document.getElementById("m"+id);b.disabled=true;m.textContent="✦ Génération...";const r=await fetch("/admin/envoyer/"+id,{method:"POST"});const d=await r.json();if(d.succes){m.textContent="✅ Envoyée !";}else{m.textContent="❌ "+(d.erreur||"erreur");b.disabled=false;}}</script></body></html>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('✦ Lechemin lancé sur le port ' + PORT));
