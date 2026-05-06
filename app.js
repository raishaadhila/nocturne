// ── Supabase config ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://txopyfaazghcjxxynssc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4b3B5ZmFhemdoY2p4eHluc3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTI1NTQsImV4cCI6MjA5MzYyODU1NH0.SDS_XTJ3fsMiMpxO3wqlkcOpjqf3teVVQgkzSXRmKuM';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function thoughtCard(t) {
  const loved = (JSON.parse(localStorage.getItem('loved') || '[]')).includes(t.id);
  return `
    <article class="flex flex-col gap-4 px-6" data-id="${t.id}">
      <p class="font-headline text-2xl italic leading-snug text-on-surface">${escapeHtml(t.content)}</p>
      <div class="flex items-center gap-4 text-on-surface-variant text-sm">
        <button onclick="loveThought('${t.id}')" class="flex items-center gap-1.5 hover:text-tertiary transition-colors ${loved ? 'text-tertiary' : ''}">
          <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' ${loved ? 1 : 0},'wght' 300,'GRAD' 0,'opsz' 20">favorite</span>
          <span id="loves-${t.id}">${t.loves}</span>
        </button>
        <span class="text-outline text-xs">${timeAgo(t.created_at)}</span>
      </div>
      <div class="h-px bg-outline-variant/20 mt-4"></div>
    </article>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── API ───────────────────────────────────────────────────────────────────────
async function createThought(content) {
  const { error } = await db.from('thoughts').insert({ content });
  if (error) console.error('createThought error:', error);
  return !error;
}

async function loadRecentThoughts() {
  const el = document.getElementById('recentThoughts');
  if (!el) return;
  const { data } = await db.from('thoughts').select('*').order('created_at', { ascending: false }).limit(5);
  el.innerHTML = data?.length ? data.map(thoughtCard).join('') : '<p class="text-center text-outline italic">No echoes yet.</p>';

  // Real-time: prepend new thoughts and keep only 5
  db.channel('recent').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'thoughts' }, ({ new: t }) => {
    el.insertAdjacentHTML('afterbegin', thoughtCard(t));
    const cards = el.querySelectorAll('article');
    if (cards.length > 5) cards[5].remove();
  }).subscribe();
}

async function loadAllThoughts() {
  const el = document.getElementById('allThoughts');
  if (!el) return;
  const { data } = await db.from('thoughts').select('*').order('created_at', { ascending: false });
  el.innerHTML = data?.length ? data.map(thoughtCard).join('') : '<p class="text-center text-outline italic">The night is silent.</p>';

  // Real-time: prepend new thoughts as they arrive
  db.channel('thoughts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'thoughts' }, ({ new: t }) => {
    el.insertAdjacentHTML('afterbegin', thoughtCard(t));
  }).subscribe();
}

async function loveThought(id) {
  const loved = JSON.parse(localStorage.getItem('loved') || '[]');
  if (loved.includes(id)) return;

  const { data } = await db.from('thoughts').select('loves').eq('id', id).single();
  await db.from('thoughts').update({ loves: data.loves + 1 }).eq('id', id);

  loved.push(id);
  localStorage.setItem('loved', JSON.stringify(loved));

  // Update UI
  document.getElementById(`loves-${id}`).textContent = data.loves + 1;
  const btn = document.querySelector(`[data-id="${id}"] button`);
  btn.classList.add('text-tertiary');
  btn.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 20";
}
