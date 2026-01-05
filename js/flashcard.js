// js/flashcard.js
import { 
    appData, currentReviewId, setCurrentReviewId, 
    cardStage, setCardStage, 
    isExplanationActive, setIsExplanationActive 
} from './core.js';
import { saveToStorage } from './storage.js';
import { getAcronym, generateClozeText, getLocalDateISO, showToast, getLevelInfo } from './utils.js';
import { renderDashboard, updateRadar } from './ui-dashboard.js';
import { calculateSRSDates, findNextLightDay } from './srs-engine.js';

// --- GESTÃO DE ÁUDIO ---
let currentUtterance = null; 

export function stopAudio() {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
    }
    resetAudioUI();
}

function resetAudioUI() {
    const btn = document.getElementById('btnAudioToggle');
    const iconSpeaker = document.getElementById('iconSpeaker');
    const iconStop = document.getElementById('iconStop');
    const label = document.getElementById('labelAudio');

    if (btn) {
        btn.classList.remove('is-playing');
        if(iconSpeaker) iconSpeaker.style.display = 'block';
        if(iconStop) iconStop.style.display = 'none';
        if(label) label.innerText = "Ouvir Versículo";
    }
}

export function toggleAudio() {
    if (window.speechSynthesis.speaking) {
        stopAudio();
        return;
    }

    const textElement = document.getElementById('cardFullText');
    if (!textElement) return;
    
    const textToRead = textElement.innerText.trim();
    if (!textToRead) return;

    currentUtterance = new SpeechSynthesisUtterance(textToRead);
    currentUtterance.lang = 'pt-BR'; 
    currentUtterance.rate = 0.9;     
    currentUtterance.pitch = 1.0;

    currentUtterance.onstart = () => {
        const btn = document.getElementById('btnAudioToggle');
        const iconSpeaker = document.getElementById('iconSpeaker');
        const iconStop = document.getElementById('iconStop');
        const label = document.getElementById('labelAudio');
        
        if(btn) {
            btn.classList.add('is-playing');
            iconSpeaker.style.display = 'none';
            iconStop.style.display = 'block';
            label.innerText = "Parar Leitura";
        }
    };

    currentUtterance.onend = () => {
        resetAudioUI();
    };

    currentUtterance.onerror = (e) => {
        console.warn("Erro TTS:", e);
        resetAudioUI();
    };

    window.speechSynthesis.speak(currentUtterance);
}

// --- ÍCONES SVG ---
const ICONS = {
    target: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    bulb: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6"/><path d="M9 21v-4h6v4"/><path d="M12 3a9 9 0 0 0-9 9c0 4.97 9 13 9 13s9-8.03 9-13a9 9 0 0 0-9-9z"/></svg>`,
    next: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>`,
    back: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>`
};

// --- FLASHCARD LOGIC ---

export function openDailyReview(dateStr) {
    let versesToReview = appData.verses.filter(v => v.dates.includes(dateStr));
    
    if (versesToReview.length === 0) return;

    versesToReview = versesToReview.sort(() => Math.random() - 0.5);

    const modal = document.getElementById('reviewModal');
    const listContainer = document.getElementById('reviewList');
    const title = document.getElementById('reviewTitle');
    
    document.getElementById('reviewListContainer').style.display = 'block';
    document.getElementById('flashcardContainer').style.display = 'none';
    document.getElementById('flashcardInner').classList.remove('is-flipped');
    
    const dateObj = new Date(dateStr + 'T00:00:00');
    title.innerText = `Revisão: ${dateObj.toLocaleDateString('pt-BR')}`;

    listContainer.innerHTML = versesToReview.map(v => `
        <div class="verse-item" onclick="startFlashcard(${v.id})">
            <strong>${v.ref}</strong>
            <span>▶ Treinar</span>
        </div>
    `).join('');

    modal.style.display = 'flex';
}

export function startFlashcard(verseId) {
    setCurrentReviewId(verseId);
    const verse = appData.verses.find(v => v.id === verseId);
    if (!verse) return;

    document.getElementById('reviewListContainer').style.display = 'none';
    document.getElementById('flashcardContainer').style.display = 'block';
    document.getElementById('flashcardInner').classList.remove('is-flipped');
    
    document.getElementById('cardRef').innerText = verse.ref; 
    document.getElementById('cardRefBack').innerText = verse.ref; 
    document.getElementById('cardFullText').innerText = verse.text;
    
    const hasMnemonic = verse.mnemonic && verse.mnemonic.trim().length > 0;
    setCardStage(hasMnemonic ? -1 : 0); 
    setIsExplanationActive(false); 
    
    renderCardContent(verse);
    updateHintButtonUI(); 
    resetAudioUI(); 
}

function renderCardContent(verse) {
    const contentEl = document.getElementById('cardTextContent');
    const mnemonicBox = document.getElementById('mnemonicContainer');
    const refEl = document.getElementById('cardRef');
    const explContainer = document.getElementById('explanationContainer');
    const explText = document.getElementById('cardExplanationText');
    const mnemonicText = document.getElementById('cardMnemonicText');

    contentEl.classList.remove('blur-text');
    mnemonicBox.style.display = 'none';
    explContainer.style.display = 'none';
    contentEl.style.display = 'block';

    if (cardStage.value === -1) {
        refEl.style.display = 'none';
        
        if (isExplanationActive.value) {
            explContainer.style.display = 'flex';
            explText.innerText = verse.explanation || "Sem explicação cadastrada.";
            mnemonicBox.style.display = 'none'; 
        } else {
            mnemonicBox.style.display = 'flex';
            explContainer.style.display = 'none';
            mnemonicText.innerText = verse.mnemonic;
        }

        contentEl.innerText = getAcronym(verse.text);
        contentEl.className = 'cloze-text first-letter-mode blur-text'; 
    } 
    else if (cardStage.value === 0) {
        refEl.style.display = 'block';
        contentEl.innerText = getAcronym(verse.text);
        contentEl.className = 'cloze-text first-letter-mode'; 
    } 
    else if (cardStage.value === 1) {
        refEl.style.display = 'block';
        const clozeHTML = generateClozeText(verse.text).replace(/\n/g, '<br>');
        contentEl.innerHTML = `"${clozeHTML}"`;
        contentEl.className = 'cloze-text';
    }
}

function updateHintButtonUI() {
    const controlsArea = document.getElementById('hintControlsArea');
    const tapIcon = document.getElementById('tapHintIcon'); 
    
    controlsArea.innerHTML = ''; 
    
    const verse = appData.verses.find(v => v.id === currentReviewId.value);
    if (!verse) return;

    if (cardStage.value === -1) {
        if(tapIcon) tapIcon.style.display = 'none';

        if (verse.explanation && verse.explanation.trim().length > 0) {
            const btnExpl = document.createElement('button');
            btnExpl.className = 'btn-ghost-accent';
            
            if (isExplanationActive.value) {
                btnExpl.innerHTML = `${ICONS.back} Voltar para Cena Mnemônica`;
            } else {
                btnExpl.innerHTML = `${ICONS.bulb} Esqueci a cena (Ver Contexto)`;
            }
            
            btnExpl.onclick = (e) => { e.stopPropagation(); toggleExplanation(); };
            controlsArea.appendChild(btnExpl);
        }

        const btnNext = document.createElement('button');
        btnNext.className = 'btn-hint';
        btnNext.innerHTML = isExplanationActive.value 
            ? `${ICONS.next} <span>Entendi! Ir para Iniciais</span>`
            : `${ICONS.next} <span>Lembrei! Ir para Iniciais</span>`;
            
        btnNext.onclick = (e) => { e.stopPropagation(); advanceStage(); };
        controlsArea.appendChild(btnNext);
    } 
    else if (cardStage.value === 0) {
        if(tapIcon) tapIcon.style.display = 'flex';

        const btnHint = document.createElement('button');
        btnHint.className = 'btn-hint';
        btnHint.innerHTML = `${ICONS.bulb} <span>Preciso de uma Dica (Lacunas)</span>`;
        btnHint.onclick = (e) => { e.stopPropagation(); advanceStage(); };
        controlsArea.appendChild(btnHint);
    } 
    else {
        if(tapIcon) tapIcon.style.display = 'flex';
    }
}

export function toggleExplanation() {
    const newVal = !isExplanationActive.value;
    setIsExplanationActive(newVal);
    
    const verse = appData.verses.find(v => v.id === currentReviewId.value);
    renderCardContent(verse);
    updateHintButtonUI();
}

export function advanceStage() {
    const current = cardStage.value;
    
    if (current === -1) {
        setCardStage(0); 
        setIsExplanationActive(false); 
    } else if (current === 0) {
        setCardStage(1); 
    }
    
    const verse = appData.verses.find(v => v.id === currentReviewId.value);
    renderCardContent(verse);
    updateHintButtonUI();
}

export function startFlashcardFromDash(id) {
    document.getElementById('reviewModal').style.display = 'flex';
    startFlashcard(id);
}

// --- INTERACTION & GAMIFICATION LOGIC (PERSISTÊNCIA v1.3.1) ---

export function registerInteraction(verse, autoSave = true, isSuccess = false) {
    const todayISO = getLocalDateISO(new Date());
    
    let dataUpdated = false;

    // --- BLOCO 1: ATUALIZAÇÃO DO VERSÍCULO E XP ---
    if (isSuccess) {
        if (!appData.stats) appData.stats = { streak: 0, lastLogin: todayISO, currentXP: 0 };
        if (typeof appData.stats.currentXP === 'undefined') appData.stats.currentXP = 0;
        
        const oldLevel = getLevelInfo(appData.stats.currentXP).title;
        
        // PADRÃO ÉTICO: XP é sempre +1, sem recompensar o erro/atraso.
        appData.stats.currentXP += 1; 
        
        const newLevelInfo = getLevelInfo(appData.stats.currentXP);
        
        // Persistência Imediata de XP
        if (window.saveStatsToFirestore) {
            window.saveStatsToFirestore(appData.stats);
        }

        // Feedback de Nível
        if (newLevelInfo.title !== oldLevel) {
            showToast(`🎉 LEVEL UP! Agora você é: ${newLevelInfo.title}`, "success");
            const badge = document.getElementById('levelBadge');
            if(badge) {
                badge.classList.remove('levelup');
                void badge.offsetWidth; 
                badge.classList.add('levelup');
            }
        }
    }

    // Atualiza metadados do versículo (Sempre incrementa interação em caso de sucesso)
    const interactionUpdated = (verse.lastInteraction !== todayISO || isSuccess);
    if (interactionUpdated) {
        verse.interactionCount = (verse.interactionCount || 0) + (isSuccess ? 1 : 0);
        verse.lastInteraction = todayISO;
        dataUpdated = true;
    }

    // Persistência do Versículo na Nuvem
    if (dataUpdated && autoSave && window.saveVerseToFirestore) {
        window.saveVerseToFirestore(verse, false, 'Interaction_Register');
    }

    // --- BLOCO 2: ATUALIZAÇÃO DO STREAK ---
    if (appData.stats.lastLogin !== todayISO) {
        appData.stats.streak = (appData.stats.streak || 0) + 1;
        appData.stats.lastLogin = todayISO;
        
        if(window.showToast) showToast(`🔥 Streak: ${appData.stats.streak} dias!`, "success");
        
        if (window.saveStatsToFirestore) {
            window.saveStatsToFirestore(appData.stats);
        }
    }

    saveToStorage();
    renderDashboard(); 
}

export function handleDifficulty(level) {
    stopAudio();

    const verseIndex = appData.verses.findIndex(v => v.id === currentReviewId.value);
    if (verseIndex === -1) return;
    const verse = appData.verses[verseIndex];

    const isSuccess = (level === 'easy');

    // Registra interação e lida com XP/Streak
    registerInteraction(verse, false, isSuccess);

    // Lógica de SRS
    if (level === 'hard') {
        const today = new Date();
        const start = new Date(verse.startDate + 'T00:00:00');
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isEndCycle = diffDays >= 50;

        if (isEndCycle) {
            const todayISO = getLocalDateISO(new Date());
            verse.startDate = todayISO; 
            verse.dates = calculateSRSDates(todayISO);
            showToast('Ciclo final falhou. Reiniciando para consolidar.', 'warning');
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = getLocalDateISO(tomorrow);
            const recoveryDate = findNextLightDay(tomorrowStr, appData);

            if (!verse.dates.includes(recoveryDate)) {
                verse.dates.push(recoveryDate);
                verse.dates.sort();
                showToast(`Revisão extra agendada. Sem estresse!`, 'success');
            } else {
                showToast('Reforço já estava agendado.', 'warning');
            }
        }
    } else {
        showToast('Ótimo! Segue o plano.', 'success');
    }

    saveToStorage(); 
    if (window.saveVerseToFirestore) {
        window.saveVerseToFirestore(verse, false, `Difficulty_${level}`); 
    }
    
    updateRadar();
    renderDashboard();
    backToList();
}

export function flipCard() {
    stopAudio();
    document.getElementById('flashcardInner').classList.toggle('is-flipped');
}

export function backToList() {
    stopAudio();
    document.getElementById('reviewListContainer').style.display = 'block';
    document.getElementById('flashcardContainer').style.display = 'none';
    document.getElementById('flashcardInner').classList.remove('is-flipped');
}

export function closeReview() {
    stopAudio();
    document.getElementById('reviewModal').style.display = 'none';
}
