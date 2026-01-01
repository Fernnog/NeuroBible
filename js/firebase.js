// js/firebase.js - Conexão Nuvem e Autenticação (v1.2.7 - Diagnóstico & Trace)

// 1. CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBcwdrOVkKdM9wCNXIH-G-wM7D07vpBJIQ",
    authDomain: "neurobible-5b44f.firebaseapp.com",
    projectId: "neurobible-5b44f",
    storageBucket: "neurobible-5b44f.firebasestorage.app",
    messagingSenderId: "1050657162706",
    appId: "1:1050657162706:web:03d8101b6b6e15d92bf40b",
    measurementId: "G-P92Z7DFW7N"
};

// Inicialização segura
let db, auth;
let currentUser = null;

try {
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("Firebase inicializado com sucesso.");
} catch (error) {
    console.error("Erro ao inicializar Firebase. Verifique suas chaves de API.", error);
}

// --- GESTÃO DE FILA OFFLINE (SYNC QUEUE) ---

// Adiciona item à fila local quando falha a rede
function addToSyncQueue(action, collection, docId, data) {
    const queue = JSON.parse(localStorage.getItem('neuroBibleSyncQueue') || '[]');
    // Adiciona nova pendência com timestamp
    queue.push({ action, collection, docId, data, timestamp: Date.now() });
    localStorage.setItem('neuroBibleSyncQueue', JSON.stringify(queue));
    
    if (window.showToast) window.showToast("Sem rede. Salvo localmente para sync posterior.", "warning");
}

// Processa a fila (chamado quando volta online ou ao iniciar)
window.processSyncQueue = function() {
    const queue = JSON.parse(localStorage.getItem('neuroBibleSyncQueue') || '[]');
    if (queue.length === 0) return;

    console.log(`[Sync] Processando ${queue.length} itens pendentes...`);
    
    // Limpa a fila do storage para evitar loops, processa a cópia em memória
    localStorage.setItem('neuroBibleSyncQueue', '[]');

    queue.forEach(item => {
        if (item.action === 'set') {
            if (item.collection === 'verses') {
                window.saveVerseToFirestore(item.data, true, 'SyncQueue_Retry'); // true = isRetry (sem toast)
            } else if (item.collection === 'settings') {
                window.saveSettingsToFirestore(item.data, true);
            } else if (item.collection === 'stats') {
                window.saveStatsToFirestore(item.data, true);
            }
        } else if (item.action === 'delete') {
            window.handleCloudDeletion(item.docId, true);
        }
    });
};

// Listeners de Rede (Feedback Visual & Gatilhos)
window.addEventListener('online', () => {
    if (window.showToast) window.showToast("Conexão restaurada. Sincronizando...", "success");
    
    // Atualiza indicador visual para Verde se estiver logado
    const dot = document.getElementById('authStatusDot');
    if(dot && currentUser) dot.style.backgroundColor = "#2ecc71"; 

    window.processSyncQueue();
    
    // Tenta puxar dados atualizados ao reconectar
    if(window.loadVersesFromFirestore && window.handleCloudData) {
        window.loadVersesFromFirestore(window.handleCloudData);
    }
});

window.addEventListener('offline', () => {
    if (window.showToast) window.showToast("Você está offline. Alterações salvas localmente.", "warning");
    
    // Atualiza indicador visual para Vermelho
    const dot = document.getElementById('authStatusDot');
    if(dot) dot.style.backgroundColor = "#e74c3c"; 
});


// --- 2. GESTÃO DE AUTENTICAÇÃO (Auth) ---

if (auth) {
    auth.onAuthStateChanged((user) => {
        const loginState = document.getElementById('loginState');
        const userState = document.getElementById('userState');
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        const dot = document.getElementById('authStatusDot');

        if (user) {
            // --- USUÁRIO LOGADO ---
            currentUser = user;
            console.log("Usuário conectado:", user.email);
            
            if(loginState) loginState.style.display = 'none';
            if(userState) userState.style.display = 'block';
            if(userEmailDisplay) userEmailDisplay.innerText = user.email;
            
            // Indicador visual no header (Verde se online)
            if (dot) dot.style.backgroundColor = navigator.onLine ? "#2ecc71" : "#e74c3c";

            // CRÍTICO: Carrega dados e passa para a PONTE no main.js
            if (window.loadVersesFromFirestore) {
                window.loadVersesFromFirestore((data) => {
                   if(window.handleCloudData && data) {
                       window.handleCloudData(data);
                   } else {
                       console.log('Dados baixados, mas UI ainda não pronta.');
                   }
                });
            }
            
            // Tenta processar fila pendente ao logar
            if (window.processSyncQueue) window.processSyncQueue();

        } else {
            // --- USUÁRIO DESLOGADO ---
            currentUser = null;
            console.log("Usuário desconectado.");
            
            if(loginState) loginState.style.display = 'block';
            if(userState) userState.style.display = 'none';
            
            if (dot) dot.style.backgroundColor = "#ccc"; // Cinza
        }
    });
}

window.openAuthModal = function() {
    document.getElementById('authModal').style.display = 'flex';
};

window.closeAuthModal = function() {
    document.getElementById('authModal').style.display = 'none';
};

window.handleLogin = function() {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPassword').value;

    if (!email || !pass) return showToast("Preencha e-mail e senha.", "error");

    auth.signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            window.showToast("Login realizado!", "success");
            window.closeAuthModal();
        })
        .catch((error) => {
            console.error(error);
            let msg = error.message;
            if (error.code === 'auth/wrong-password') msg = "Senha incorreta.";
            if (error.code === 'auth/user-not-found') msg = "E-mail não cadastrado.";
            window.showToast("Erro: " + msg, "error");
        });
};

window.handleLogout = function() {
    auth.signOut().then(() => {
        window.showToast("Você saiu da conta.", "warning");
        // Opcional: Limpar dados locais ao sair
        // window.clearData(); 
    });
};


// --- 3. INTEGRAÇÃO COM FIRESTORE (Database) ---

// Salvar Versículo (Com Sanitização, Logs Detalhados e Rastreabilidade de Origem)
window.saveVerseToFirestore = function(verse, isRetry = false, source = 'unknown') {
    if (!currentUser || !db) {
        console.warn(`[CLOUD_WARN] ⚠️ Tentativa de salvar sem usuário logado. Fonte: ${source}`);
        return; 
    }

    // 1. Snapshot do estado antes da sanitização
    console.group(`[CLOUD_TRACE] 📡 Iniciando Save (Fonte: ${source}) | ID: ${verse.id}`);
    console.log("1. Estado Original (Memória):", JSON.parse(JSON.stringify(verse)));

    // 2. Sanitização: Cria uma cópia limpa para não enviar lixo de UI (_display...)
    const cleanVerse = { ...verse };
    const removedKeys = [];
    Object.keys(cleanVerse).forEach(key => {
        // Remove chaves privadas de UI (iniciadas com _) ou valores undefined
        if (key.startsWith('_') || cleanVerse[key] === undefined) {
            delete cleanVerse[key];
            removedKeys.push(key);
        }
    });

    // 3. Adiciona Timestamp de atualização (CRÍTICO para resolver conflitos futuros)
    cleanVerse.updatedAt = new Date().toISOString();

    console.log("2. Payload Sanitizado (Para Envio):", cleanVerse);
    if(removedKeys.length > 0) console.log("   Chaves removidas:", removedKeys);

    db.collection('users').doc(currentUser.uid).collection('verses').doc(String(cleanVerse.id))
        .set(cleanVerse)
        .then(() => {
            // LOG DE SUCESSO DETALHADO
            console.log(`[CLOUD_SUCCESS] ✅ SUCESSO: ID ${cleanVerse.id} persistido na nuvem.`);
            console.log(`   Ref: ${cleanVerse.ref} | Next Reviews: ${cleanVerse.dates.length}`);
            console.groupEnd();
            
            // Feedback Visual: Apenas se não for retry automático
            if (!isRetry && window.showToast) window.showToast("☁️ Sincronizado com a nuvem", "success");
        })
        .catch((err) => {
            console.error(`[CLOUD_ERROR] ❌ FALHA ao salvar ID ${cleanVerse.id}:`, err);
            console.groupEnd();
            // Se falhar e não for retry, joga pra fila usando o objeto limpo
            if (!isRetry) addToSyncQueue('set', 'verses', cleanVerse.id, cleanVerse);
        });
};

// Salvar Configurações (Com Retry/Queue)
window.saveSettingsToFirestore = function(settings, isRetry = false) {
    if (!currentUser || !db) return;

    db.collection('users').doc(currentUser.uid)
        .set({ settings: settings }, { merge: true })
        .then(() => console.log("[CLOUD] Configurações sincronizadas."))
        .catch((err) => {
            console.warn("[CLOUD] Falha no settings, adicionando à fila:", err);
            if (!isRetry) addToSyncQueue('set', 'settings', null, settings);
        });
};

// Salvar Stats/Streak (Com Retry/Queue e Logs Explícitos)
window.saveStatsToFirestore = function(stats, isRetry = false) {
    if (!currentUser || !db) return;

    console.log(`[CLOUD] ☁️ Atualizando estatísticas/streak...`);

    db.collection('users').doc(currentUser.uid)
        .set({ stats: stats }, { merge: true })
        .then(() => console.log("[CLOUD] ✅ Stats sincronizados."))
        .catch((err) => {
            console.warn("[CLOUD] ❌ Falha no stats, adicionando à fila:", err);
            if (!isRetry) addToSyncQueue('set', 'stats', null, stats);
        });
};

// Carregar Dados (Versículos + Configurações + Stats) com Amostragem de Log
window.loadVersesFromFirestore = function(callback) {
    if (!currentUser || !db) return;

    // 1. Busca Dados do Usuário (Settings + Stats)
    const userDocPromise = db.collection('users').doc(currentUser.uid).get();
    
    // 2. Busca Versículos (Subcoleção)
    const versesCollectionPromise = db.collection('users').doc(currentUser.uid).collection('verses').get();

    Promise.all([userDocPromise, versesCollectionPromise])
        .then(([userDoc, versesSnapshot]) => {
            console.group("[CLOUD_SYNC] 📥 Recebendo dados da Nuvem");
            
            const userData = userDoc.exists ? userDoc.data() : {};
            
            const cloudVerses = [];
            versesSnapshot.forEach((doc) => {
                const data = doc.data();
                cloudVerses.push(data);
            });
            
            console.log(`Total baixado: ${cloudVerses.length} itens`);
    
            // Log de amostragem para verificar datas
            if(cloudVerses.length > 0) {
                const sample = cloudVerses[0];
                console.log("Amostra (Item 0):", { 
                    id: sample.id,
                    ref: sample.ref, 
                    lastInteraction: sample.lastInteraction, 
                    datesLength: sample.dates ? sample.dates.length : 0 
                });
            }
            console.groupEnd();

            // Retorna um objeto completo para o main.js processar
            callback({
                verses: cloudVerses,
                settings: userData.settings || null,
                stats: userData.stats || null
            });
        })
        .catch((error) => console.error("Erro ao baixar dados completos:", error));
};

// Deletar da Nuvem (Com Retry/Queue)
window.handleCloudDeletion = function(id, isRetry = false) {
    if (!currentUser || !db) return;

    db.collection('users').doc(currentUser.uid).collection('verses').doc(String(id))
        .delete()
        .then(() => {
            console.log("Item deletado da nuvem.");
            if (!isRetry && window.showToast) window.showToast("Removido da nuvem", "success");
        })
        .catch((error) => {
            console.error("Erro ao deletar na nuvem:", error);
            if (!isRetry) addToSyncQueue('delete', 'verses', id, null);
        });
};
