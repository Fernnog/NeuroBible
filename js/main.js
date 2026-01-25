// js/main.js

// 1. Importações de Módulos (Core & Utils)
import { runSanityCheck, appData, setAppData } from './core.js';
import { loadFromStorage, saveToStorage } from './storage.js';
// ATUALIZADO: Importando systemChangelog para versionamento automático
import { initChangelog, systemChangelog } from './changelog.js'; 
import { getLocalDateISO, showToast } from './utils.js';

// 2. Importações de Funcionalidades
import * as uiDashboard from './ui-dashboard.js';
import * as flashcardLogic from './flashcard.js';
import * as srsEngine from './srs-engine.js'; 

// --- 3. EXPOSIÇÃO GLOBAL (PONTE PARA O HTML) ---

// [CORREÇÃO HOTFIX] Expondo showToast para o firebase.js e outros módulos globais
window.showToast = showToast;

// Funções de UI e Dashboard
window.openPlanModal = uiDashboard.openPlanModal;
window.closePlanModal = uiDashboard.closePlanModal;
window.selectPlan = uiDashboard.selectPlan;
window.openRadarModal = uiDashboard.openRadarModal;
window.closeRadarModal = uiDashboard.closeRadarModal;
window.updateRadar = uiDashboard.updateRadar; 
window.toggleHistory = uiDashboard.toggleHistory;
window.filterHistory = uiDashboard.filterHistory;
window.openChangelog = uiDashboard.openChangelog;
window.closeChangelog = uiDashboard.closeChangelog;

// --- NOVO: GAMIFICAÇÃO & MODAIS SEPARADOS (v1.2.9) ---
window.openGamificationModal = uiDashboard.openGamificationModal;
window.closeGamificationModal = uiDashboard.closeGamificationModal;
// -----------------------------------------------------

// NOVA FUNÇÃO v1.2.0: Toggle do Painel de Cadastro
window.toggleInputSection = uiDashboard.toggleInputSection;

// [NOVO] Exposição da função de Resgate Tático (Correção do nome da função)
window.handleRescueOperation = uiDashboard.handleRescueOperation;

// Funções de CRUD e Processamento
window.processAndGenerate = uiDashboard.processAndGenerate; 
window.startEdit = uiDashboard.startEdit;
window.saveEdit = uiDashboard.saveEdit;
window.cancelEdit = uiDashboard.cancelEdit;
window.deleteVerse = uiDashboard.deleteVerse;
window.handleUndo = uiDashboard.handleUndo;
window.clearData = uiDashboard.clearData;
window.confirmSmartReschedule = uiDashboard.confirmSmartReschedule;
window.closeConflictModal = uiDashboard.closeConflictModal;

// Funções de Flashcard (Treino)
window.openDailyReview = flashcardLogic.openDailyReview;
window.startFlashcard = flashcardLogic.startFlashcard;
window.startFlashcardFromDash = flashcardLogic.startFlashcardFromDash;
window.flipCard = flashcardLogic.flipCard;
window.showHintStage = flashcardLogic.showHintStage; // Mantido para compatibilidade
window.handleDifficulty = flashcardLogic.handleDifficulty;
window.backToList = flashcardLogic.backToList;
window.closeReview = flashcardLogic.closeReview;
window.rescheduleDailyLoad = flashcardLogic.rescheduleDailyLoad; 

// Funções de Treino (Fluxo Bifurcado v1.1.7+)
window.toggleExplanation = flashcardLogic.toggleExplanation;
window.advanceStage = flashcardLogic.advanceStage;

// NOVA FUNÇÃO v1.2.2 (Áudio)
window.toggleAudio = flashcardLogic.toggleAudio;

// Funções de Auth (Firebase)
window.openAuthModal = window.openAuthModal || function(){ document.getElementById('authModal').style.display='flex'; };
window.closeAuthModal = window.closeAuthModal || function(){ document.getElementById('authModal').style.display='none'; };

// --- 4. PONTE DE SINCRONIZAÇÃO (CLOUD -> UI) ---
// Esta função é chamada pelo firebase.js ou pelo onload quando dados chegam

// CONTROLE DE LOCK: Evita que o sync rode duas vezes seguidas (ex: Login + onload)
let isSyncing = false;

window.handleCloudData = function(payload) {
    // 1. PROTEÇÃO CONTRA SYNC DUPLO
    if (isSyncing) {
        console.warn("[SYNC_BLOCK] 🛡️ Ignorando chamada de sync duplicada/simultânea.");
        return;
    }
    isSyncing = true;

    // INÍCIO DO BLOCO DE DIAGNÓSTICO
    console.group("[MAIN_SYNC] 🔄 Processando Merge Nuvem -> Local");

    // payload agora contém { verses, settings, stats }
    const cloudVerses = Array.isArray(payload) ? payload : payload.verses;
    const cloudSettings = payload.settings;
    const cloudStats = payload.stats;

    // DIAGNÓSTICO: LOG DE COMPARAÇÃO
    console.log("Versículos na memória antes do sync:", appData.verses.length);
    if (cloudVerses) console.log("Versículos chegando da nuvem:", cloudVerses.length);

    // Verificação de Sobrescrita Perigosa (Diagnóstico Visual)
    if (appData.verses.length > 0 && cloudVerses && cloudVerses.length > 0) {
        // Tenta achar um item em comum para comparar timestamps
        const localSample = appData.verses.find(v => v.id === cloudVerses[0].id);
        if (localSample) {
            console.log("Comparação de Conflito (Amostra ID " + localSample.id + "):");
            console.log("   LOCAL (Memória):", { lastInteraction: localSample.lastInteraction, dates: localSample.dates });
            console.log("   NUVEM (Chegando):", { lastInteraction: cloudVerses[0].lastInteraction, dates: cloudVerses[0].dates });
        }
    }

    if (cloudVerses) {
        console.log('[Sync] Recebendo pacote completo da nuvem (Dados validados).');
        
        // 1. Prepara o novo estado mesclando com o atual
        const newState = { 
            ...appData, 
            verses: cloudVerses 
        };

        // 2. Se vieram configurações da nuvem, aplica (prioridade nuvem)
        if (cloudSettings) {
            newState.settings = cloudSettings;
        }

        // 3. Se vieram stats da nuvem, aplica (PERSISTÊNCIA BLINDADA XP)
        if (cloudStats) {
            // Mesclagem Inteligente: Prioriza a nuvem para o XP e Streak
            newState.stats = {
                streak: (typeof cloudStats.streak !== 'undefined') ? cloudStats.streak : (appData.stats.streak || 0),
                lastLogin: cloudStats.lastLogin || null,
                // CRÍTICO: Garante que o XP da nuvem seja carregado e não sobrescrito por 0 local
                currentXP: (typeof cloudStats.currentXP !== 'undefined') ? cloudStats.currentXP : 0
            };
        }
        
        // 4. Atualiza Estado Global na Memória
        setAppData(newState);
        
        // 5. Persiste no LocalStorage (para funcionar offline na próxima vez)
        saveToStorage();
        
        // 6. Força a renderização completa da UI
        uiDashboard.updateTable();
        uiDashboard.updateRadar();
        uiDashboard.updatePacingUI(); // Agora refletirá o Perfil correto
        uiDashboard.checkStreak();   // Agora refletirá o Streak e XP corretos
        uiDashboard.renderDashboard();
        
        // Feedback visual discreto
        if(window.showToast) window.showToast("Sincronizado com sucesso!", "success");
    } else {
        console.log('[Sync] Conectado, mas nenhum dado na nuvem.');
    }

    console.groupEnd(); // Fim do grupo de logs

    // Libera para novo sync após 2 segundos (tempo de segurança)
    setTimeout(() => { isSyncing = false; }, 2000);
};

// --- 5. INICIALIZAÇÃO DO SISTEMA ---

window.onload = function() {
    // ATUALIZADO v1.2.1: Versionamento automático via Changelog
    const currentVersion = systemChangelog.length > 0 ? systemChangelog[0].version : 'Dev';
    console.log(`[System] Inicializando NeuroBible v${currentVersion} Modular...`);

    // A. Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('[SW] Service Worker registrado:', reg.scope))
            .catch(err => console.error('[SW] Falha ao registrar:', err));
    }

    // B. Carregar Dados Locais
    initChangelog();
    loadFromStorage();
    
    // [NOVO v1.3.0] DETECÇÃO DE NOVO DIA (Antes de atualizar o estado)
    // Captura o estado atual para comparar se houve virada de dia desde o último acesso
    const todayISO = getLocalDateISO(new Date());
    const previousLoginDate = appData.stats ? appData.stats.lastLogin : null;
    const isNewDay = previousLoginDate && previousLoginDate !== todayISO;

    // C. Sanity Check e Correção (Inclui Limpeza Diária de Contadores)
    const dataWasFixed = runSanityCheck();
    if (dataWasFixed) {
        saveToStorage(); 
    }

    // D. Inicialização de UI
    const today = new Date();
    const startDateInput = document.getElementById('startDate');
    if(startDateInput) startDateInput.value = getLocalDateISO(today);

    // Listeners Reativos (Inputs)
    const refInput = document.getElementById('ref');
    if(startDateInput) startDateInput.addEventListener('change', uiDashboard.updatePreviewPanel);
    if(refInput) refInput.addEventListener('input', uiDashboard.updatePreviewPanel);

    // Renderização Inicial
    uiDashboard.checkStreak(); // CUIDADO: Esta função ATUALIZA appData.stats.lastLogin para hoje
    uiDashboard.updateTable();
    uiDashboard.updateRadar();
    uiDashboard.updatePacingUI();
    uiDashboard.renderDashboard();
    
    // --- NOVO v1.2.9: Força renderização do Ícone de Nível no topo ---
    if(uiDashboard.updateLevelUI) uiDashboard.updateLevelUI();

    // E. Splash Screen
    const splash = document.getElementById('splashScreen');
    const versionLabel = document.getElementById('splashVersion');
    
    if(versionLabel && window.neuroChangelog && window.neuroChangelog.length > 0) {
        versionLabel.innerText = `v${window.neuroChangelog[0].version}`;
    }

    setTimeout(() => {
        if(splash) splash.classList.add('hidden');
        setTimeout(() => { if(splash) splash.style.display = 'none'; }, 600);
        
        // [NOVO v1.3.0] FEEDBACK DE NOVO DIA
        // Exibe o Toast somente após o Splash sumir para garantir visibilidade
        if (isNewDay) {
            setTimeout(() => {
                if(window.showToast) window.showToast("☀️ Novo dia iniciado! Contadores diários resetados.", "info");
            }, 800);
        }

    }, 1500);
    
    // F. Sync Inicial com Firebase & Fila Offline
    // Adicionado delay para garantir que auth.currentUser esteja pronto
    setTimeout(() => {
        // Tenta buscar da nuvem se estiver logado
        if (window.loadVersesFromFirestore) {
            window.loadVersesFromFirestore((cloudPayload) => {
                // CHAMA A PONTE PARA ATUALIZAR A TELA (Payload Completo)
                window.handleCloudData(cloudPayload);
            });
        }

        // Processa Fila de Offline (Sync Queue)
        if (window.processSyncQueue) {
            window.processSyncQueue();
        }

    }, 2000);
};
