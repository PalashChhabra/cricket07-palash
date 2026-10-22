'use strict';

let currentPrompt = '';
const byId = id => document.getElementById(id);
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not load ' + url);
  return response.json();
}

async function setupTeams() {
  const teams = await getJSON('/teams.json');
  const picker = byId('team-picker');
  const buttons = teams.map((team, index) => {
    const button = node('button');
    button.type = 'button';
    button.className = 'team-button';
    button.style.setProperty('--team', team.colour);
    button.style.setProperty('--accent', team.accent);
    button.setAttribute('aria-pressed', String(index === 0));
    button.append(node('span', team.abbr === 'IN26' ? 'IND' : team.abbr, 'team-badge'), node('span', team.name), node('span', '↗'));
    button.lastChild.setAttribute('aria-hidden', 'true');
    button.addEventListener('click', () => selectTeam(index));
    picker.append(button);
    return button;
  });
  function selectTeam(index) {
    const team = teams[index];
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    byId('team-code').textContent = team.abbr === 'IN26' ? 'IND' : team.abbr;
    byId('team-code').style.setProperty('--team', team.colour);
    byId('team-code').style.setProperty('--accent', team.accent);
    byId('team-name').textContent = team.name;
    byId('team-count').textContent = team.players.length + ' PLAYERS';
    byId('team-captain').textContent = 'Captain · ' + team.captain;
    byId('player-list').replaceChildren(...team.players.slice(0, 11).map(name => node('li', name)));
    byId('reserve-count').textContent = '+ ' + (team.players.length - 11) + ' IN THE SQUAD';
    byId('kit-colour').style.setProperty('--kit', team.colour);
    byId('kit-accent').style.setProperty('--kit', team.accent);
  }
  selectTeam(0);
}

async function setupPrompts() {
  const prompts = await getJSON('/prompts.json');
  const tabs = [...document.querySelectorAll('[data-prompt]')];
  function selectTab(button) {
    currentPrompt = prompts[button.dataset.prompt];
    tabs.forEach(tab => { tab.setAttribute('aria-selected', String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; });
    byId('prompt-content').textContent = currentPrompt;
    byId('prompt-content').setAttribute('aria-labelledby', button.id);
  }
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => selectTab(button));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); selectTab(tabs[next]); tabs[next].focus();
    });
  });
  selectTab(tabs[0]);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* try selection fallback */ }
  }
  const field = node('textarea', text);
  field.style.cssText = 'position:fixed;left:-9999px;top:0';
  field.setAttribute('aria-hidden', 'true'); document.body.append(field); field.select();
  const copied = document.execCommand('copy'); field.remove();
  if (!copied) throw new Error('Copy unavailable');
}

byId('copy-prompt').addEventListener('click', async () => {
  const button = byId('copy-prompt');
  try {
    if (!currentPrompt) throw new Error('Prompt not loaded');
    await copyText(currentPrompt); button.textContent = 'Copied ✓'; byId('copy-status').textContent = 'Prompt copied. Edit the bracketed details before using it.';
  } catch {
    button.textContent = 'Select text to copy'; byId('copy-status').textContent = 'Automatic copying is unavailable. Select the prompt and copy it manually.';
    const range = document.createRange(); range.selectNodeContents(byId('prompt-content')); window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
  }
  setTimeout(() => { button.textContent = 'Copy prompt ⧉'; }, 2500);
});

byId('share-page').addEventListener('click', async () => {
  const url = location.origin + '/';
  const button = byId('share-page');
  try {
    if (navigator.share) await navigator.share({ title: 'One more over? Cricket 07 by Micky', text: 'OG Cricket 07, India 2026 and all ten IPL teams. Play and get the source.', url });
    else { await copyText(url); button.textContent = 'Link copied ✓'; byId('share-status').textContent = 'Page link copied.'; }
  } catch (error) {
    if (error.name !== 'AbortError') { button.textContent = 'Copy your address bar link'; byId('share-status').textContent = 'Sharing is unavailable. Copy this page’s address to share it.'; }
  }
  setTimeout(() => { button.textContent = 'Send the link ↗'; }, 3000);
});

setupTeams().catch(() => { byId('team-picker').textContent = 'The squad list could not load. Reload to try again.'; });
setupPrompts().catch(() => { byId('prompt-content').textContent = 'The prompts could not load. Use “Download all prompts” to get them as a file.'; });
