/* Bind everything without relying on inline onclicks */
let outputText = '';

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.querySelector('.button-container > button:first-child');
  const copyBtn = document.getElementById('copyButton');
  const clearBtn = document.getElementById('clearHistoryButton');

  if (generateBtn) generateBtn.addEventListener('click', generateList);
  if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
  if (clearBtn) clearBtn.addEventListener('click', clearHistory);

  displayHistory();
});

/* Utils */
const $ = (id) => document.getElementById(id);

function parseNames(id){
  const raw = $(id).value || '';
  return raw
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

function showToast(msg){
  let tc = document.querySelector('.toast-container');
  if (!tc){
    tc = document.createElement('div');
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}

/* Core features (same logic/format as your original) */
function generateList(){
  const timestampInput = $('timestamp').value;
  const timestamp = timestampInput ? new Date(timestampInput).toISOString() : new Date().toISOString();

  const firstPraise   = parseNames('firstPraise');
  const firstSpecial  = parseNames('firstSpecial');
  const secondPraise  = parseNames('secondPraise');
  const secondSpecial = parseNames('secondSpecial');

  outputText = '';

  if (firstPraise.length){
    outputText += 'FIRST SERVICE PRAISE AND WORSHIP:\n';
    firstPraise.forEach(n => outputText += `  - ${n}\n`);
    outputText += '\n';
  }
  if (firstSpecial.length){
    outputText += 'FIRST SERVICE SPECIAL NO:\n';
    firstSpecial.forEach(n => outputText += `  - ${n}\n`);
    outputText += '\n';
  }
  if (secondPraise.length){
    outputText += 'SECOND SERVICE PRAISE AND WORSHIP:\n';
    secondPraise.forEach(n => outputText += `  - ${n}\n`);
    outputText += '\n';
  }
  if (secondSpecial.length){
    outputText += 'SECOND SERVICE SPECIAL NO:\n';
    secondSpecial.forEach(n => outputText += `  - ${n}\n`);
  }

  $('output').textContent = outputText || 'No names entered.';
  $('copyButton').disabled = !outputText;
  $('manualCopy').style.display = 'none';

  if (outputText){
    saveToHistory(outputText, timestamp);
  }
  displayHistory();
}

async function copyToClipboard(){
  if (!outputText) return;

  $('manualCopy').style.display = 'none';

  try{
    if (navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(outputText);
      showToast('✅ List copied to clipboard');
      return;
    }
  }catch(e){
    console.warn('Clipboard API failed:', e);
  }

  // Fallback
  try{
    const ta = document.createElement('textarea');
    ta.value = outputText;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok){
      showToast('✅ List copied to clipboard');
    }else{
      showManualCopy(outputText);
    }
  }catch(e){
    console.error('Fallback copy failed:', e);
    showManualCopy(outputText);
  }
}

function showManualCopy(text){
  $('manualCopyText').value = text;
  $('manualCopy').style.display = 'block';
  showToast('⚠️ Please copy manually below');
}

/* History: keep 14 days, limit 2 entries */
function saveToHistory(text, timestamp){
  let history = JSON.parse(localStorage.getItem('singerHistory') || '[]');
  history.unshift({ timestamp, text });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  history = history.filter(e => new Date(e.timestamp) >= cutoff);

  history = history.slice(0, 2);
  localStorage.setItem('singerHistory', JSON.stringify(history));
}

function displayHistory(){
  const history = JSON.parse(localStorage.getItem('singerHistory') || '[]');
  const container = $('history');
  container.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.textContent = 'History (Last 2 Weeks)';
  container.appendChild(h2);

  if (!history.length){
    const p = document.createElement('p');
    p.textContent = 'No history available.';
    container.appendChild(p);
    $('clearHistoryButton').disabled = true;
    return;
  }

  history.forEach(entry => {
    const wrap = document.createElement('div');
    wrap.className = 'history-entry';

    const d = new Date(entry.timestamp).toLocaleString('en-GB', {
      year:'numeric', month:'short', day:'2-digit',
      hour:'2-digit', minute:'2-digit', hour12:false
    });

    const h3 = document.createElement('h3');
    h3.textContent = `Generated on ${d}`;
    const pre = document.createElement('pre');
    pre.textContent = entry.text; // Safe: textContent escapes HTML

    wrap.appendChild(h3);
    wrap.appendChild(pre);
    container.appendChild(wrap);
  });

  $('clearHistoryButton').disabled = false;
}

function clearHistory(){
  if (confirm('Are you sure you want to clear the history?')){
    localStorage.removeItem('singerHistory');
    displayHistory();
    showToast('🗑️ History cleared');
  }
}

/* Optional: press Ctrl/Cmd+Enter to Generate */
document.addEventListener('keydown', (e) => {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'Enter'){
    generateList();
  }
});
