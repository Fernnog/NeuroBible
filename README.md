# 🧠 NeuroBible: Sistema de Engenharia de Memória & Gestão Cognitiva

> **"A diferença entre ler e reter é a arquitetura do processo."**

O **NeuroBible** é uma Aplicação Progressiva (PWA) desenhada sob princípios rigorosos de neurociência para transformar dados de curto prazo em sabedoria de longo prazo.

Diferente de métodos passivos, este sistema atua como um "Personal Trainer Cognitivo". Ele calcula matematicamente o momento exato em que seu cérebro está prestes a esquecer uma informação (Curva do Esquecimento) e intervém com desafios ativos, garantindo a consolidação neural.

**Versão Atual:** v1.2.8 — *"Precisão de Métricas & Ciclo Real"*

---

## 🧬 Os 5 Pilares da Neuroaprendizagem

O sistema não se baseia em "decoreba", mas em **Engenharia de Retenção**. A arquitetura do código reflete cinco estágios cognitivos distintos:

### 1. Consciência Temporal & Gamificação (Atualizado v1.2.7)
Para combater a procrastinação invisível e motivar a constância:
* **Cápsula de Ritmo:** Monitora simultaneamente sua **Constância** (Ícone de Fogo 🔥) e seu **Atraso** (Ícone de Relógio 🕒).
* **Feedback de Atraso Real:** O sistema calcula se sua última revisão cobriu a data agendada. Se você revisou ontem e cobriu a pendência, o item não é cobrado hoje (Lógica Inteligente v1.2.6).
* **Badge de Intensidade:** Um indicador visual (Dourado/Roxo) na borda do cartão exibe o volume de repetições diárias, separando a "conclusão" da "intensidade".

### 2. Dual Coding (Codificação Dupla - v1.2.2)
Baseado na teoria de Paivio, o sistema ataca por duas vias sensoriais simultâneas:
* **Via Visual:** Leitura ativa, mnemônicas e feedback visual de cores.
* **Via Auditiva (TTS Neural):** O sistema lê os versículos utilizando a síntese de voz nativa do dispositivo, criando uma segunda trilha de memória independente. O áudio pausa automaticamente ao interagir com o cartão (Smart Stop).

### 3. Scaffolding Inverso (O "Andaime" Mental)
O cérebro aprende melhor quando desafiado progressivamente. As etapas de ajuda **não contam como revisão completa** (v1.2.8):
* **Estágio -1 (Visualização Mnemônica):** O texto é ocultado. O usuário evoca a imagem mental.
* **Estágio 0 (Ancoragem Hard):** Apenas as iniciais (Acrônimo) são exibidas.
* **Estágio 1 (Preenchimento / Cloze):** Texto com lacunas estratégicas.

### 4. Algoritmo de Repetição Espaçada (SRS) & Ciclo Real
Utilizamos uma variação otimizada do algoritmo *SuperMemo*, agora com métricas rigorosas (v1.2.8):
* **Ciclo Padrão:** 0, 1, 3, 7, 14, 21, 30, 60 dias.
* **Contagem Justa:** O contador de repetições **só incrementa** ao clicar em "Fácil/Acertei" na etapa final. Consultar dicas ou errar não infla seus números.
* **Correção de Rota:** Feedback "Difícil" reinicia o ciclo (Reset para Dia 0) e remove o item da lista de atrasados, mas **não** conta como vitória no painel.

### 5. Gestão de Carga & "Burnout Shield"
* **Radar de Carga (63 Dias):** Um mapa de calor permite visualizar "tsunamis" de revisões futuras.
* **Válvula de Escape:** Bloqueio preventivo de novos cadastros em dias congestionados (> 5 revisões).

---

## 🚀 Guia de Uso Rápido

### Passo 1: Plantio (Input)
1.  **Mnemônica (Opcional):** Crie uma cena visual absurda para a referência.
2.  **Previsão:** O painel inferior mostra o impacto futuro no calendário para evitar sobrecarga.

### Passo 2: Monitoramento (Dashboard)
Observe a **Cápsula de Ritmo** no topo:
* **🔥 (Direita):** Dias seguidos de estudo (Streak).
* **🕒 (Esquerda):** Dias de atraso acumulado. Mantenha este número zerado.

### Passo 3: O Treino (Flashcards)
Acesse o **Dashboard Diário**.
* **Áudio:** Use o botão de som para ouvir enquanto lê (Dual Coding).
* **Progresso:** Avance pelas dicas (Mnemônica -> Iniciais -> Lacunas).
* **Julgamento (Crucial):**
    * **Difícil/Errei:** Reinicia o ciclo para hoje. O contador **não** sobe.
    * **Fácil/Acertei:** Único gatilho que confirma o ciclo e **incrementa** o contador de interações.

---

## 🛠️ Ficha Técnica & Arquitetura

* **Core:** Single Page Application (SPA) em Vanilla JS (ES6 Modules).
* **Offline Engine:** Service Workers customizados (PWA Instalável) com Sync Queue para dados.
* **Backend:** Google Firebase (Firestore para DB, Auth para identidade).
* **Design System:** CSS3 Moderno (Variables, Flexbox, Keyframes) com Dark Mode nativo e ícones SVG.

### Estrutura de Arquivos (Modular)
* `index.html`: Orquestração da UI e Splash Screen.
* `style.css`: Estilização, animações, layouts responsivos e Badges.
* `js/main.js`: Ponto de entrada, orquestração de módulos e ponte de Sync.
* `js/core.js`: Estado global da aplicação (Model) e Sanity Checks.
* `js/ui-dashboard.js`: Lógica de renderização do painel, radar, tabelas e inputs.
* `js/flashcard.js`: Lógica de treino, estados do cartão, áudio (TTS) e métricas rigorosas.
* `js/srs-engine.js`: Matemática dos agendamentos e datas.
* `js/storage.js`: Camada de persistência local (LocalStorage).
* `js/firebase.js`: Camada de sincronização com a nuvem (Firestore + Auth).
* `js/changelog.js`: Registro de versões e novidades do sistema.
* `js/utils.js`: Helpers, formatação e Toasts.

---

## 📦 Instalação e Desenvolvimento

Devido ao uso de **ES Modules** (`import/export`), esta aplicação precisa ser servida via HTTP, não funciona abrindo o arquivo direto (`file://`).

1.  Clone o repositório.
2.  Na pasta raiz, rode um servidor local simples:
    * Python: `python -m http.server 8000`
    * Node/NPM: `npx http-server`
    * VSCode: Extensão "Live Server".
3.  Acesse `http://localhost:8000`.

---

> *"O NeuroBible não guarda o que você quer ler. Ele constrói quem você quer ser."*
