// README Crafter — zero-dependency client app
const $ = (id) => document.getElementById(id);

const state = {
  profile: { displayName: "Jack", githubUser: "", headline: "Tech tinkerer. Builder of shiny things.", bio: "I like building fun tools and shipping quick." },
  links: { website: "", email: "", twitter: "", linkedin: "", youtube: "" },
  tech: ["React", "Node.js", "Python"],
  projects: [{ name: "File Master", url: "https://github.com/yourname/file-master", description: "Open-source file conversion and streaming tool." }],
  options: { viewCount: true, stats: true, topLangs: true, trophies: false, theme: "radical", coffee: "" }
};

function save(){ localStorage.setItem("rc-state", JSON.stringify(state)); }
function load(){ try { const s = JSON.parse(localStorage.getItem("rc-state")); if(s) Object.assign(state, s); } catch{} }

function esc(s){ return encodeURIComponent(s); }
function badge(t){ return `![${t}](https://img.shields.io/badge/${esc(t)}-%23000000.svg?style=for-the-badge)`; }

function renderMarkdown(){
  const p = state.profile, l = state.links, o = state.options;
  const shields = {
    views: (o.viewCount && p.githubUser) ? `![Profile views](https://komarev.com/ghpvc/?username=${esc(p.githubUser)}&label=Profile%20views&color=0e75b6&style=flat)` : "",
    stats: (o.stats && p.githubUser) ? `![GitHub Stats](https://github-readme-stats.vercel.app/api?username=${esc(p.githubUser)}&show_icons=true&theme=${o.theme})` : "",
    langs: (o.topLangs && p.githubUser) ? `![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=${esc(p.githubUser)}&layout=compact&theme=${o.theme})` : "",
    trophies: (o.trophies && p.githubUser) ? `![trophy](https://github-profile-trophy.vercel.app/?username=${esc(p.githubUser)}&theme=${o.theme})` : "",
    coffee: o.coffee ? `[☕ Buy me a coffee](${o.coffee})` : ""
  };

  const header = `# ${p.displayName}\n\n${p.headline}`;
  const views = shields.views ? `\n\n${shields.views}` : "";
  const about = `\n\n## About Me\n${p.bio}`;

  const contactLines = [
    l.website && `🌐 **Website:** ${l.website}`,
    l.email && `✉️ **Email:** ${l.email}`,
    l.twitter && `🐦 **Twitter:** ${l.twitter}`,
    l.linkedin && `💼 **LinkedIn:** ${l.linkedin}`,
    l.youtube && `📺 **YouTube:** ${l.youtube}`,
  ].filter(Boolean).join("\n");
  const contact = contactLines ? `\n\n## Links\n${contactLines}` : "";

  const stack = state.tech.length ? `\n\n## Tech Stack\n${state.tech.map(badge).join(" ")}` : "";
  const proj = state.projects.length ? `\n\n## Projects\n${state.projects.map(p => `- **[${p.name}](${p.url})** — ${p.description}`).join("\n")}` : "";
  const stats = [shields.stats, shields.langs, shields.trophies].filter(Boolean).map(s => `\n\n${s}`).join("");
  const coffee = shields.coffee ? `\n\n${shields.coffee}` : "";

  const md = [header, views, about, contact, stack, proj, stats, coffee].join("");
  $("markdown").value = md;
  renderPreview(md);
}

function renderPreview(md){
  // very light markdown to HTML (headings, bold, links, lists, paragraphs)
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
    .replace(/\* (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
  html = `<p>${html}</p>`
    .replace(/<p>\s*<li>/g, '<ul><li>')
    .replace(/<\/li>\s*<p>/g, '</li></ul><p>');
  $("render").innerHTML = html;
}

function connectInputs(){
  const binds = [
    ["displayName", v => state.profile.displayName = v],
    ["githubUser", v => state.profile.githubUser = v],
    ["headline", v => state.profile.headline = v],
    ["bio", v => state.profile.bio = v],
    ["website", v => state.links.website = v],
    ["email", v => state.links.email = v],
    ["twitter", v => state.links.twitter = v],
    ["linkedin", v => state.links.linkedin = v],
    ["youtube", v => state.links.youtube = v],
    ["viewCount", v => state.options.viewCount = v, true],
    ["stats", v => state.options.stats = v, true],
    ["topLangs", v => state.options.topLangs = v, true],
    ["trophies", v => state.options.trophies = v, true],
    ["theme", v => state.options.theme = v],
    ["coffee", v => state.options.coffee = v],
  ];
  binds.forEach(([id, fn, isBool]) => {
    const el = $(id);
    if(!el) return;
    el.addEventListener('input', () => { fn(isBool ? el.checked : el.value); save(); renderMarkdown(); });
  });

  // tech tags
  $("addTech").addEventListener('click', () => {
    const val = $("techInput").value.trim();
    if(!val) return;
    if(!state.tech.includes(val)) state.tech.push(val);
    $("techInput").value = "";
    save(); drawTech(); renderMarkdown();
  });

  // projects
  $("addProject").addEventListener('click', () => {
    const name = $("projName").value.trim();
    const url = $("projUrl").value.trim();
    const desc = $("projDesc").value.trim();
    if(!name || !url) return;
    state.projects.push({ name, url, description: desc });
    $("projName").value = $("projUrl").value = $("projDesc").value = "";
    save(); drawProjects(); renderMarkdown();
  });

  // toolbar
  $("copyBtn").addEventListener('click', async () => {
    await navigator.clipboard.writeText($("markdown").value);
    alert('README copied to clipboard');
  });
  $("downloadBtn").addEventListener('click', () => {
    const blob = new Blob([$("markdown").value], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'README.md'; a.click();
    URL.revokeObjectURL(url);
  });
  $("resetBtn").addEventListener('click', () => { localStorage.removeItem('rc-state'); location.reload(); });
}

function drawTech(){
  const root = $("techList");
  root.innerHTML = "";
  state.tech.forEach((t, idx) => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.innerHTML = `<span>${t}</span> <button aria-label="Remove">✕</button>`;
    el.querySelector('button').addEventListener('click', () => { state.tech.splice(idx,1); save(); drawTech(); renderMarkdown(); });
    root.appendChild(el);
  });
}

function drawProjects(){
  const list = $("projList");
  list.innerHTML = "";
  state.projects.forEach((p, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span><b>${p.name}</b> — <a href="${p.url}" target="_blank" rel="noreferrer noopener">link</a><br/><span class="muted">${p.description||''}</span></span><button class="btn btn-ghost">Delete</button>`;
    li.querySelector('button').addEventListener('click', () => { state.projects.splice(idx,1); save(); drawProjects(); renderMarkdown(); });
    list.appendChild(li);
  });
}

function init(){
  load();
  connectInputs();
  drawTech();
  drawProjects();
  // preload UI from state
  $("displayName").value = state.profile.displayName;
  $("githubUser").value  = state.profile.githubUser;
  $("headline").value    = state.profile.headline;
  $("bio").value         = state.profile.bio;
  $("website").value     = state.links.website;
  $("email").value       = state.links.email;
  $("twitter").value     = state.links.twitter;
  $("linkedin").value    = state.links.linkedin;
  $("youtube").value     = state.links.youtube;
  $("viewCount").checked = state.options.viewCount;
  $("stats").checked     = state.options.stats;
  $("topLangs").checked  = state.options.topLangs;
  $("trophies").checked  = state.options.trophies;
  $("theme").value       = state.options.theme;
  $("coffee").value      = state.options.coffee;
  renderMarkdown();
}
init();
