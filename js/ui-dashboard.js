// js/ui-dashboard.js
import { 
    appData, addVerseToState, updateVerseInState, deleteVerseFromState, restoreVerseToState,
    editingVerseId, setEditingVerseId, pendingVerseData, setPendingVerseData 
} from './core.js';
import { saveToStorage } from './storage.js';
// [ATUALIZADO] Importando findNextLightDay para uso na função de Resgate
import { calculateSRSDates, generateICSFile, findNextLightDay } from './srs-engine.js';
import { getLocalDateISO, showToast, getLevelInfo } from './utils.js';
import { startFlashcardFromDash } from './flashcard.js';

// --- LOGICA DO ACCORDION (INPUT SECTION) ---
export function toggleInputSection() {
    const section = document.getElementById('inputSection');
    if(section) section.classList.toggle('collapsed');
}

// --- RADAR & CALENDÁRIO ---
export function updateRadar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    const startDateEl = document.getElementById('startDate');
    const startDateInput = startDateEl ? startDateEl.value : null;
    const currentPreviewDates = startDateInput ? calculateSRSDates(startDateInput) : [];
    const loadMap = {};

    appData.verses.forEach(v => {
        v.dates.forEach(d => {
            loadMap[d] = (loadMap[d] || 0) + 1;
        });
    });

    const refEl = document.getElementById('ref');
    const isPreviewActive = refEl && refEl.value.trim() !== "";
    
    if (isPreviewActive) {
        currentPreviewDates.forEach(d => {
            loadMap[d] = (loadMap[d] || 0) + 1;
        });
    }

    const todayStr = getLocalDateISO(new Date());
    const todayLoad = loadMap[todayStr] || 0;
    
    const radarBtn = document.getElementById('btnRadar');
    if (radarBtn) {
        if (todayLoad > 0) {
            radarBtn.classList.add('has-alert');
            radarBtn.title = `Atenção: ${todayLoad} revisões para hoje!`;
        } else {
            radarBtn.classList.remove('has-alert');
        }
    }

    const today = new Date();
    for (let i = 0; i < 63; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = getLocalDateISO(d);
        const count = loadMap[dateStr] || 0;

        const cell = document.createElement('div');
        cell.className = 'day-cell';
        
        if (count > 0) {
            cell.style.cursor = 'pointer';
            cell.onclick = () => {
                if(window.closeRadarModal) window.closeRadarModal();
                if(window.openDailyReview) window.openDailyReview(dateStr);
            };
            cell.title = `${count} versículos`;
        }
        
        if (count === 0) cell.classList.add('load-0');
        else if (count <= 2) cell.classList.add('load-low');
        else if (count <= 5) cell.classList.add('load-med');
        else cell.classList.add('load-high');

        if (isPreviewActive && currentPreviewDates.includes(dateStr)) {
            cell.classList.add('is-preview');
        }

        const dayLabel = d.getDate().toString().padStart(2, '0');
        cell.innerHTML = `<span>${dayLabel}</span><strong>${count > 0 ? count : ''}</strong>`;
        grid.appendChild(cell);
    }
}

// --- DASHBOARD RENDER (REESTRUTURADO v1.3.4 + RESGATE TÁTICO) ---
export function renderDashboard() {
    const todayDash = document.getElementById('todayDashboard');
    const todayList = document.getElementById('todayList');
    const todayCount = document.getElementById('todayCount');
    const overduePanel = document.getElementById('overduePanel');
    const overdueList = document.getElementById('overdueList');
    const overdueCount = document.getElementById('overdueCount');
    
    const delayBadge = document.getElementById('delayBadge');
    const delayCount = document.getElementById('delayCount');

    if(!todayDash || !todayList) return;

    const todayStr = getLocalDateISO(new Date());
    const todayDateObj = new Date(todayStr + 'T00:00:00');
    
    let maxDelayDays = 0;
    
    // Variável para contar itens críticos para o Resgate Tático
    let criticalOverdueCount = 0;

    // 1. Processamento de Atrasados (Lógica Corrigida v1.3.4)
    const overdueVerses = appData.verses.filter(v => {
        // Verifica se existem datas no passado estrito (menores que hoje)
        const pastDates = v.dates.filter(d => d < todayStr);
        if (pastDates.length === 0) return false;

        const lastInt = v.lastInteraction || '0000-00-00';
        
        // Verifica prazos não cumpridos no passado
        const unmetDeadlines = pastDates.filter(scheduledDate => scheduledDate > lastInt);
        
        // Lógica de "Recuperado Hoje":
        const isScheduledForToday = v.dates.includes(todayStr);
        const isRecoveredLegacy = (v.lastInteraction === todayStr) && !isScheduledForToday;

        if (unmetDeadlines.length > 0 || isRecoveredLegacy) {
            // Define qual data exibir (a mais antiga pendente ou a última passada)
            const referenceDateStr = unmetDeadlines.length > 0 ? unmetDeadlines[0] : pastDates[pastDates.length - 1];
            const missedDateObj = new Date(referenceDateStr + 'T00:00:00');
            const diffTime = Math.abs(todayDateObj - missedDateObj);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > maxDelayDays) maxDelayDays = diffDays;

            // [NOVO] Lógica do Resgate Tático: Conta itens com mais de 3 dias de atraso não recuperados hoje
            if (diffDays > 3 && !isRecoveredLegacy) {
                criticalOverdueCount++;
            }

            v._displayMissedDate = referenceDateStr.split('-').reverse().join('/');
            v._displayDelayDays = diffDays;
            v._isRecoveredToday = (unmetDeadlines.length === 0 && isRecoveredLegacy); // Status visual
            return true;
        }
        return false;
    }).sort((a, b) => b._displayDelayDays - a._displayDelayDays);

    // 2. Atualiza Badge Global de Atraso
    if (delayBadge && delayCount) {
        if (maxDelayDays > 0) {
            delayBadge.style.display = 'flex';
            delayCount.innerText = `${maxDelayDays}d`;
        } else {
            delayBadge.style.display = 'none';
        }
    }

    // 3. Processamento de Versículos de Hoje
    const todayVerses = appData.verses.filter(v => v.dates.includes(todayStr));

    // --- RENDER PAINEL ATRASADOS (Cor Vermelha de Alerta) ---
    if (overdueVerses.length > 0 && overduePanel) {
        overduePanel.style.display = 'block';
        
        // [NOVO] Logica de Injeção do Botão de Resgate Tático
        let headerActionsHTML = `<div class="dash-count" id="overdueCount" style="background: #c0392b;">${overdueVerses.length}</div>`;
        
        // CONDIÇÃO: > 3 itens com > 3 dias de atraso
        if (overdueVerses.length > 3 && criticalOverdueCount > 3) {
            headerActionsHTML = `
                <div class="rescue-header-actions">
                    <button class="btn-rescue" onclick="window.handleRescueOperation()" title="Redistribuir atrasos críticos nos próximos dias livres">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
                        Reiniciar Ciclo
                    </button>
                    <div class="dash-count" id="overdueCount" style="background: #c0392b;">${overdueVerses.length}</div>
                </div>
            `;
        }

        // Atualiza o Header com o botão se necessário
        const headerEl = overduePanel.querySelector('.dash-header');
        if (headerEl) {
             headerEl.innerHTML = `
                <div style="color: #c0392b;">
                    <h2 style="color: #c0392b;">Atrasados</h2>
                    <small style="color: #e74c3c; font-weight: bold;">Recupere estes versículos primeiro!</small>
                </div>
                ${headerActionsHTML}
             `;
        }

        if(overdueCount) overdueCount.innerText = overdueVerses.length; // Fallback caso header acima não exista
        
        const overdueIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

        if(overdueList) {
            overdueList.innerHTML = overdueVerses.map(v => {
                // RESET VISUAL: Contador só aparece se a interação foi HOJE
                const count = v.lastInteraction === todayStr ? (v.interactionCount || 0) : 0;
                const hasBadge = count > 0;
                
                const itemClass = `dash-item ${v._isRecoveredToday ? 'overdue-completed' : ''} ${hasBadge ? 'has-badge' : ''}`;
                // IDENTIDADE VISUAL VERMELHA (Alerta)
                const borderColor = v._isRecoveredToday ? '#27ae60' : '#c0392b';
                const statusTextColor = v._isRecoveredToday ? '#27ae60' : '#c0392b';

                let badgeHTML = '';
                if (hasBadge) {
                    let badgeClass = 'interaction-badge';
                    if (count >= 10) badgeClass += ' purple'; 
                    else if (count >= 5) badgeClass += ' gold';   
                    badgeHTML = `<div class="${badgeClass}" title="${count} interações de recuperação hoje">${count}</div>`;
                }

                return `
                    <div class="${itemClass}" onclick="startFlashcardFromDash(${v.id})" style="border-left: 4px solid ${borderColor}; flex-direction: column; align-items: flex-start; position: relative;">
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center;">
                            <strong>${v.ref}</strong>
                            <small style="color:${statusTextColor}; font-weight:bold;">${v._isRecoveredToday ? 'Recuperado' : '-' + v._displayDelayDays + ' dias'}</small>
                        </div>
                        
                        <div style="display:flex; align-items:center; width:100%; margin-top:8px;">
                            <span class="overdue-date-chip" title="Data original">
                                ${calendarIcon} ${v._displayMissedDate}
                            </span>
                            <div style="margin-left:auto; display:flex; align-items:center; color:${borderColor}; font-size:0.8rem; font-weight:bold;">
                                ${v._isRecoveredToday ? checkIcon + ' Reforço' : overdueIcon + ' Recuperar'}
                            </div>
                        </div>
                        ${badgeHTML}
                    </div>
                `;
            }).join('');
        }
    } else if (overduePanel) {
        overduePanel.style.display = 'none';
    }

    // --- RENDER PAINEL MISSÃO HOJE ---
    todayDash.style.display = 'block';
    todayCount.innerText = todayVerses.length;
    
    if(todayVerses.length === 0) {
        todayList.innerHTML = `<div class="dash-empty-state">Tudo em dia! Nenhuma nova missão para hoje.</div>`;
    } else {
        todayList.innerHTML = todayVerses.map(v => {
            const isDone = v.lastInteraction === todayStr;
            const count = isDone ? (v.interactionCount || 0) : 0; // Reset visual diário
            const hasBadge = count > 0;
            
            let itemClass = `dash-item ${isDone ? 'completed' : ''} ${hasBadge ? 'has-badge' : ''}`;
            const borderColor = isDone ? '#2ecc71' : 'var(--accent)';

            let statusIcon = isDone ? 
                `<small style="color:#27ae60; font-weight:bold;">✓ Feito</small>` : 
                `<small style="color:var(--accent)">▶ Treinar</small>`;

            let badgeHTML = '';
            if (hasBadge) {
                let badgeClass = 'interaction-badge';
                if (count >= 10) badgeClass += ' purple'; 
                else if (count >= 5) badgeClass += ' gold';   
                badgeHTML = `<div class="${badgeClass}" title="${count} interações hoje">${count}</div>`;
            }

            return `
            <div class="${itemClass}" onclick="startFlashcardFromDash(${v.id})" style="border-left: 4px solid ${borderColor}; position: relative;">
                <strong>${v.ref}</strong>
                ${statusIcon}
                ${badgeHTML}
            </div>
            `;
        }).join('');
    }
}

// [NOVO] FUNÇÃO: Lógica de Redistribuição Inteligente (Resgate Gradual)
export function handleRescueOperation() {
    // 1. Confirmação do Usuário
    if (!confirm("O Resgate Tático irá redistribuir seus atrasos GRADUALMENTE nos próximos dias livres para evitar sobrecarga. Deseja continuar?")) return;

    const todayStr = getLocalDateISO(new Date());
    let processedCount = 0;

    // 2. Preparação do Mapa de Carga em Tempo Real
    // Criamos um mapa local para saber quantos agendamentos JÁ existem em cada dia
    const liveLoadMap = {};
    appData.verses.forEach(v => {
        v.dates.forEach(d => {
            liveLoadMap[d] = (liveLoadMap[d] || 0) + 1;
        });
    });

    // Configuração do Cursor de Data (Começa a procurar a partir de AMANHÃ)
    let searchDateObj = new Date();
    searchDateObj.setDate(searchDateObj.getDate() + 1);

    // Limite de Segurança (Radar de Carga)
    const MAX_DAILY_LOAD = 5; 

    // 3. Iteração e Redistribuição Inteligente
    appData.verses.forEach(v => {
        // Verifica se é um versículo elegível para resgate (Atrasado pendente)
        const pastDates = v.dates.filter(d => d < todayStr);
        const lastInt = v.lastInteraction || '0000-00-00';
        const isPending = pastDates.some(d => d > lastInt);
        const isDoneToday = v.lastInteraction === todayStr;

        if (isPending && !isDoneToday) {
            let slotFound = false;
            
            // Loop para encontrar a próxima vaga, dia após dia
            while (!slotFound) {
                const isoDate = getLocalDateISO(searchDateObj);
                const currentLoad = liveLoadMap[isoDate] || 0;

                if (currentLoad < MAX_DAILY_LOAD) {
                    // --- VAGA ENCONTRADA ---
                    
                    // 1. Remove datas antigas do mapa (limpeza virtual)
                    v.dates.forEach(oldD => {
                        if(liveLoadMap[oldD]) liveLoadMap[oldD]--;
                    });

                    // 2. Aplica nova data de início
                    v.startDate = isoDate;
                    
                    // 3. Recalcula ciclo SRS [0, 1, 3, 7...]
                    v.dates = calculateSRSDates(isoDate);
                    
                    // 4. Reseta status de interação (Novo começo)
                    v.lastInteraction = null;
                    v.interactionCount = 0;

                    // 5. Atualiza o Mapa de Carga com as NOVAS datas
                    // Isso garante que o próximo versículo do loop já saiba que este dia encheu
                    v.dates.forEach(newD => {
                        liveLoadMap[newD] = (liveLoadMap[newD] || 0) + 1;
                    });

                    slotFound = true;
                    processedCount++;
                } else {
                    // --- DIA CHEIO ---
                    // Avança para o dia seguinte e tenta novamente na próxima iteração do while
                    searchDateObj.setDate(searchDateObj.getDate() + 1);
                }
            }
        }
    });

    // 4. Finalização e Persistência
    if (processedCount > 0) {
        saveToStorage();
        if (window.saveVerseToFirestore) {
            // Salva em lote simulado através de cada versículo
            appData.verses.forEach(v => window.saveVerseToFirestore(v, true, 'Rescue_Smart_Dist'));
        }
        
        window.updateRadar();
        renderDashboard();
        window.showToast(`Alívio Tático: ${processedCount} versículos distribuídos suavemente!`, "success");
    } else {
        window.showToast("Nenhum versículo elegível para resgate.", "warning");
    }
}

// --- CRUD & FORM LOGIC ---
export function processAndGenerate() {
    const btn = document.getElementById('btnPacing');
    if (btn && btn.classList.contains('is-blocked')) {
        btn.style.transform = "scale(1.1)";
        setTimeout(() => btn.style.transform = "scale(1)", 200);
        showToast(`Respeite o intervalo do ciclo.`, 'warning');
        return; 
    }

    const ref = document.getElementById('ref').value.trim();
    const text = document.getElementById('text').value.trim();
    const startDate = document.getElementById('startDate').value;

    if (!ref || !startDate) {
        showToast("Preencha Referência e Data.", "error");
        return;
    }

    const reviewDates = calculateSRSDates(startDate);
    const overloadLimit = 5;
    const loadMap = getCurrentLoadMap();
    const congestedDates = reviewDates.filter(d => (loadMap[d] || 0) >= overloadLimit);

    if (congestedDates.length > 0) {
        setPendingVerseData({ ref, text, startDate, dates: reviewDates });
        const modal = document.getElementById('conflictModal');
        const msg = document.getElementById('conflictMsg');
        msg.innerHTML = `Datas congestionadas: <b>${congestedDates.map(d=>d.split('-').reverse().slice(0,2).join('/')).join(', ')}</b>. Deseja otimizar?`;
        modal.style.display = 'flex';
        return;
    }

    finalizeSave(ref, text, startDate, reviewDates);
}

function finalizeSave(ref, text, startDate, reviewDates) {
    const mnemonic = document.getElementById('mnemonic').value.trim();
    const explanation = document.getElementById('explanation').value.trim();

    const newVerse = {
        id: Date.now(),
        ref: ref,
        text: text,
        mnemonic: mnemonic,
        explanation: explanation, 
        startDate: startDate,
        dates: reviewDates,
        lastInteraction: null,
        interactionCount: 0
    };
    
    addVerseToState(newVerse);
    saveToStorage();

    if (window.saveVerseToFirestore) window.saveVerseToFirestore(newVerse);

    updateTable();
    updateRadar();
    updatePacingUI();
    renderDashboard();
    generateICSFile(newVerse, reviewDates);

    document.getElementById('ref').value = '';
    document.getElementById('text').value = '';
    document.getElementById('mnemonic').value = '';
    document.getElementById('explanation').value = '';
    updatePreviewPanel();
    
    showToast(`"${ref}" agendado com sucesso!`, 'success');
}

export function startEdit(id) {
    const verse = appData.verses.find(v => v.id === id);
    if(!verse) return;

    setEditingVerseId(id);
    const inputSection = document.getElementById('inputSection');
    if(inputSection) inputSection.classList.remove('collapsed');

    const formFields = ['ref', 'startDate', 'mnemonic', 'explanation', 'text'];
    formFields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if(el) {
            el.value = verse[fieldId] || '';
            el.classList.add('editing-highlight');
        }
    });

    const btnCreate = document.getElementById('btnCreate');
    const btnControls = document.getElementById('editControls');
    if(btnCreate) btnCreate.style.display = 'none';
    if(btnControls) btnControls.style.display = 'flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    updatePreviewPanel();
}

export function saveEdit() {
    if(!editingVerseId.value) return;
    
    const verseIndex = appData.verses.findIndex(v => v.id === editingVerseId.value);
    if(verseIndex === -1) return;

    const ref = document.getElementById('ref').value.trim();
    const text = document.getElementById('text').value.trim();
    const mnemonic = document.getElementById('mnemonic').value.trim();
    const explanation = document.getElementById('explanation').value.trim();
    const startDate = document.getElementById('startDate').value;

    if (!ref || !startDate) return showToast("Dados incompletos.", "error");

    let dates = appData.verses[verseIndex].dates;
    if(startDate !== appData.verses[verseIndex].startDate) {
        dates = calculateSRSDates(startDate);
    }

    const updatedVerse = {
        ...appData.verses[verseIndex],
        ref, text, mnemonic, explanation, startDate, dates
    };
    
    updateVerseInState(updatedVerse);
    saveToStorage();
    if (window.saveVerseToFirestore) window.saveVerseToFirestore(updatedVerse);

    cancelEdit(); 
    updateTable();
    renderDashboard();
    updateRadar();
    showToast('Versículo atualizado!', 'success');
}

export function cancelEdit() {
    setEditingVerseId(null);
    const formFields = ['ref', 'startDate', 'mnemonic', 'explanation', 'text'];
    formFields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if(el) {
            el.value = '';
            el.classList.remove('editing-highlight');
        }
    });
    
    const startDateInput = document.getElementById('startDate');
    if(startDateInput) startDateInput.value = getLocalDateISO(new Date());

    const btnCreate = document.getElementById('btnCreate');
    const btnControls = document.getElementById('editControls');
    if(btnCreate) btnCreate.style.display = 'flex';
    if(btnControls) btnControls.style.display = 'none';
    
    updatePreviewPanel();
}

let undoTimer = null;
let verseBackup = null;
let verseIndexBackup = -1;

export function deleteVerse(id) {
    if (undoTimer) clearTimeout(undoTimer);
    if (editingVerseId.value === id) cancelEdit();

    const result = deleteVerseFromState(id);
    if(!result) return;
    
    verseBackup = result.item;
    verseIndexBackup = result.index;

    updateTable();
    updateRadar();
    updatePacingUI();
    renderDashboard();
    
    showUndoToast(id);

    undoTimer = setTimeout(() => {
        finalizeDeletion(id);
    }, 5000);
}

export function handleUndo() {
    if (!verseBackup) return;
    clearTimeout(undoTimer);
    undoTimer = null;

    restoreVerseToState(verseIndexBackup, verseBackup);
    
    updateTable();
    updateRadar();
    updatePacingUI();
    renderDashboard();
    verseBackup = null;
    
    const box = document.getElementById('toastBox');
    if(box) box.innerHTML = ''; 
    showToast('Ação desfeita!', 'success');
}

function finalizeDeletion(id) {
    saveToStorage(); 
    if (window.handleCloudDeletion) window.handleCloudDeletion(id);
    verseBackup = null;
}

function showUndoToast(id) {
    const box = document.getElementById('toastBox');
    if(!box) return;
    const el = document.createElement('div');
    el.className = `toast warning`;
    const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
    
    el.innerHTML = `${trashIcon} Item excluído. <button onclick="handleUndo()" class="toast-undo-btn">Desfazer</button>`;
    box.innerHTML = '';
    box.appendChild(el);
    setTimeout(() => { if(el.parentNode) el.remove(); }, 5000);
}

export function updateTable() {
    const tbody = document.getElementById('historyTableBody');
    if(!tbody) return;
    
    const countEl = document.getElementById('countDisplay');
    if(countEl) countEl.innerText = appData.verses.length;
    
    tbody.innerHTML = '';

    [...appData.verses].reverse().forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${v.ref}</strong></td>
            <td>${v.startDate.split('-').reverse().join('/')}</td>
            <td>
                <button class="edit-btn" onclick="startEdit(${v.id})">✎</button>
                <button class="delete-btn" onclick="deleteVerse(${v.id})">x</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function updatePreviewPanel() {
    const dateEl = document.getElementById('startDate');
    const refEl = document.getElementById('ref');
    
    if(!dateEl || !refEl) return;

    const dateInput = dateEl.value;
    const refInput = refEl.value.trim();
    const panel = document.getElementById('previewPanel');
    const container = document.getElementById('previewChips');

    if (!dateInput || (refInput.length < 3 && !editingVerseId.value)) {
        if(panel) panel.style.display = 'none';
        updateRadar();
        return;
    }

    const futureDates = calculateSRSDates(dateInput);
    const currentLoadMap = getCurrentLoadMap();
    
    if(panel) panel.style.display = 'block';
    if(container) {
        container.innerHTML = futureDates.map((dateStr, index) => {
            const d = new Date(dateStr + 'T00:00:00');
            const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
            const formattedDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const load = currentLoadMap[dateStr] || 0;
            const isOverloaded = load >= 5; 
            return `<span class="date-chip ${isOverloaded ? 'is-overloaded' : ''}">Rev ${index+1}: ${dayName} ${formattedDate}</span>`;
        }).join('');
    }
    updateRadar();
}

function getCurrentLoadMap() {
    const map = {};
    appData.verses.forEach(v => {
        v.dates.forEach(d => {
            map[d] = (map[d] || 0) + 1;
        });
    });
    return map;
}

export function checkStreak() {
    const today = getLocalDateISO(new Date());
    if (!appData.stats) appData.stats = { streak: 0, lastLogin: null, currentXP: 0 };
    const lastInteraction = appData.stats.lastLogin;

    if (!lastInteraction) {
        updateLevelUI();
        renderStreakUI();
        return;
    }

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalDateISO(yesterdayDate);

    if (lastInteraction === today || lastInteraction === yesterdayStr) {
        updateLevelUI();
        renderStreakUI();
        return;
    }

    if (lastInteraction < yesterdayStr) {
        appData.stats.streak = 0;
        appData.stats.currentXP = 0; 
        saveToStorage();
        if(window.saveStatsToFirestore) window.saveStatsToFirestore(appData.stats);
        updateLevelUI();
        renderStreakUI();
    }
}

function renderStreakUI() {
    const badge = document.getElementById('streakBadge');
    if (badge && appData.stats) {
        const flameIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0 1.1.2 2.2.5 3z"/></svg>`;
        badge.innerHTML = `${flameIcon} ${appData.stats.streak || 0}`;
    }
}

export function updateLevelUI() {
    const iconEl = document.getElementById('lvlIcon');
    if (!appData.stats) appData.stats = { currentXP: 0 };
    const currentXP = appData.stats.currentXP || 0;
    const info = getLevelInfo(currentXP); 

    if (iconEl) {
        iconEl.innerText = info.icon;
        const pill = document.getElementById('levelBadge');
        if(pill) pill.title = `${info.title}: ${currentXP} XP`;
    }

    const xpCurrentEl = document.getElementById('xpCurrentDisplay');
    const xpNextEl = document.getElementById('xpNextDisplay');
    const barFill = document.getElementById('xpBarFill');

    if (barFill) {
        let percentage = 0;
        let range = info.next - info.min;
        if (info.next === Infinity) percentage = 100;
        else percentage = Math.floor(((currentXP - info.min) / range) * 100);
        
        barFill.style.width = `${percentage}%`;
        if(xpCurrentEl) xpCurrentEl.innerText = `${currentXP} XP`;
        if(xpNextEl) xpNextEl.innerText = info.next === Infinity ? "Nível Máximo" : `Próx: ${info.next} XP`;
    }
}

export function openGamificationModal() {
    updateLevelUI(); 
    document.getElementById('gamificationModal').style.display = 'flex';
}

export function closeGamificationModal() {
    document.getElementById('gamificationModal').style.display = 'none';
}

export function updatePacingUI() {
    const btn = document.getElementById('btnPacing');
    if(!btn) return;
    const interval = appData.settings?.planInterval || 1;
    const indicatorEl = document.getElementById('activePlanIcon');
    
    const icons = {
        1: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        2: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
        3: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>'
    };

    if(indicatorEl) indicatorEl.innerHTML = icons[interval] || icons[1];

    document.querySelectorAll('.plan-card-option').forEach(el => el.classList.remove('is-selected'));
    const activeCard = document.getElementById(`planOption${interval}`);
    if (activeCard) activeCard.classList.add('is-selected');

    let lastDate = null;
    if (appData.verses.length > 0) {
        const sorted = [...appData.verses].sort((a,b) => new Date(b.startDate) - new Date(a.startDate));
        lastDate = new Date(sorted[0].startDate + 'T00:00:00');
    }

    if (!lastDate) { setPacingState(btn, 'ready'); return; }
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays >= interval) setPacingState(btn, 'ready');
    else setPacingState(btn, 'blocked');
}

function setPacingState(btn, state) {
    btn.classList.remove('is-ready', 'is-blocked');
    btn.classList.add(`is-${state}`);
}

export function openPlanModal() { document.getElementById('planModal').style.display = 'flex'; updatePacingUI(); }
export function closePlanModal() { document.getElementById('planModal').style.display = 'none'; }
export function selectPlan(days) {
    appData.settings.planInterval = days;
    saveToStorage();
    if(window.saveSettingsToFirestore) window.saveSettingsToFirestore(appData.settings);
    updatePacingUI();
    closePlanModal();
}

export function openRadarModal() { updateRadar(); document.getElementById('radarModal').style.display = 'flex'; }
export function closeRadarModal() { document.getElementById('radarModal').style.display = 'none'; }

export function toggleHistory() {
    const section = document.getElementById('historySection');
    section.classList.toggle('collapsed');
    const searchBox = document.getElementById('historySearchBox');
    if(searchBox) searchBox.style.display = section.classList.contains('collapsed') ? 'none' : 'block';
}

export function filterHistory() {
    const term = document.getElementById('searchHistory').value.toLowerCase();
    const rows = document.querySelectorAll('#historyTable tbody tr');
    rows.forEach(row => {
        row.style.display = row.cells[0].innerText.toLowerCase().includes(term) ? '' : 'none';
    });
}

export function clearData() {
    if(confirm('Limpar TUDO?')) {
        appData.verses = [];
        appData.settings = { planInterval: 1 };
        appData.stats = { streak: 0, lastLogin: null, currentXP: 0 };
        saveToStorage();
        updateTable();
        updateRadar();
        updatePacingUI();
        renderDashboard();
        checkStreak(); 
    }
}

export function confirmSmartReschedule() {
    const data = pendingVerseData.value;
    if(!data) return;
    const optimizedDates = data.dates.map(dateStr => findNextLightDay(dateStr, appData));
    finalizeSave(data.ref, data.text, data.startDate, optimizedDates);
    closeConflictModal();
}

export function closeConflictModal() {
    document.getElementById('conflictModal').style.display = 'none';
    setPendingVerseData(null);
}

export function openChangelog() {
    const modal = document.getElementById('changelogModal');
    const body = document.getElementById('changelogBody');
    if (!window.neuroChangelog) return;
    body.innerHTML = window.neuroChangelog.map(log => `
        <div class="changelog-item">
            <span class="changelog-date">${log.date}</span>
            <span class="changelog-title">v${log.version} - ${log.title}</span>
            <ul class="changelog-ul">${log.changes.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
    `).join('');
    modal.style.display = 'flex';
}

export function closeChangelog() {
    document.getElementById('changelogModal').style.display = 'none';
}
