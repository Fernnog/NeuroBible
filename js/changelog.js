// js/changelog.js

export const systemChangelog = [
    {
        version: "1.3.2",
        date: "2026-01-05",
        title: "Padronização Visual & Feedback de Recuperação",
        changes: [
            "🎨 <b>Coerência Visual:</b> Os cartões da 'Missão de Hoje' agora possuem bordas laterais coloridas (Azul para pendente, Verde para concluído), unificando a identidade visual com o painel de atrasados.",
            "🔢 <b>Contador de Recuperação:</b> O badge de interações (bolinha com o número de repetições) foi ativado para os versículos Atrasados. Agora você vê claramente seu esforço de 'Reforço Ativo'.",
            "🚨 <b>Alerta Persistente:</b> O texto 'Reforço Ativo' agora é exibido em vermelho, lembrando que o item, mesmo revisado hoje, ainda faz parte da dívida técnica de memória."
        ]
    },
    {
        version: "1.3.1",
        date: "2026-01-05",
        title: "Reforço Ativo & Inteligência de Atrasos",
        changes: [
            "🧠 <b>Reforço Ativo:</b> Versículos do painel de atrasados agora permanecem visíveis durante todo o dia após a recuperação, permitindo treinos múltiplos para consolidar o que foi esquecido.",
            "⚖️ <b>Ética na Gamificação:</b> Padronização de XP (+1) para todas as interações. Removemos incentivos que poderiam premiar o atraso, focando o bônus apenas na retenção neural.",
            "📊 <b>Priorização por Gravidade:</b> O painel de atrasados agora organiza os versículos automaticamente, colocando no topo aqueles com maior tempo de atraso acumulado.",
            "✅ <b>Feedback de Recuperação:</b> Implementação do selo visual 'Recuperado' e bordas verdes para itens atrasados que já receberam atenção no dia atual."
        ]
    },
    {
        version: "1.3.0",
        date: "2026-01-04",
        title: "Performance & Organização",
        changes: [
            "🧹 <b>Limpeza Diária Real:</b> O sistema agora reseta fisicamente os contadores de interação ao iniciar um novo dia, garantindo integridade total dos dados.",
            "🎨 <b>Refatoração CSS:</b> Divisão da folha de estilos em módulos de Estrutura e Componentes para carregamento mais eficiente.",
            "☀️ <b>Boas-vindas:</b> Feedback visual automático ao iniciar a jornada de estudos em um novo dia."
        ]
    },
    {
        version: "1.2.9",
        date: "2026-01-04",
        title: "Refinamento Visual & Lógica Diária",
        changes: [
            "🔄 <b>Novo Dia, Nova Meta:</b> O contador de interações no painel 'Sua Missão' agora zera visualmente a cada amanhecer. Se a última interação não foi hoje, o indicador mostra 0, garantindo clareza sobre o esforço atual.",
            "🖥️ <b>Layout Desktop:</b> Correção de espaçamento no cabeçalho para evitar que o ícone de Nível (Semente) sobreponha a etiqueta de versão em monitores.",
            "✨ <b>Splash Limpo:</b> A tela de abertura foi simplificada, removendo o número da versão para destacar a marca NeuroBible."
        ]
    },
    {
        version: "1.2.8",
        date: "2026-01-03",
        title: "Precisão de Métricas & Ciclo Real",
        changes: [
            "🎯 <b>Contagem Justa:</b> O contador de interações agora é rigoroso. Apenas o clique final em 'Fácil/Acertei' incrementa o número de repetições no painel.",
            "🚫 <b>Fim da Inflação:</b> Visualizar dicas, mnemônicas, iniciais ou explicações não conta mais como 'estudo completo' nas estatísticas.",
            "📉 <b>Reset Transparente:</b> Marcar 'Difícil/Errei' atualiza a data (removendo o item dos atrasados), mas mantém o contador de sucessos estagnado, refletindo a realidade do reforço necessário."
        ]
    },
    {
        version: "1.2.7",
        date: "2026-01-02",
        title: "Contador de Interações & Clean UI",
        changes: [
            "🎨 <b>Badge de Intensidade:</b> Novo indicador visual (laranja) flutuante na borda do cartão. Agora, o número de repetições é exibido de forma elegante sem poluir o status de conclusão.",
            "✨ <b>Layout Seguro:</b> Implementação de uma 'Zona de Exclusão' no CSS que impede fisicamente que o texto 'Feito' seja atropelado pelo contador, independentemente do tamanho da tela.",
            "🧹 <b>Visual Unificado:</b> Fim da poluição visual de múltiplos 'checks'. O estado de conclusão agora é único e limpo, delegando a informação de quantidade exclusivamente ao novo Badge."
        ]
    },
    {
        version: "1.2.6",
        date: "2026-01-02",
        title: "Lógica de Atraso Inteligente",
        changes: [
            "🧠 <b>Correção de 'Falsos Atrasados':</b> Ajuste matemático crítico. O sistema agora verifica se sua última revisão cobriu a data agendada. Se você revisou ontem (ou antes) e cobriu a pendência, o item não será mais cobrado hoje.",
            "📅 <b>Limpeza do Painel:</b> Fim dos versículos 'fantasmas' no painel de atrasados. Apenas itens que realmente não foram revisados desde a data de agendamento aparecerão lá.",
            "⚡ <b>Cache Refresh:</b> Atualização forçada do Service Worker para garantir que a nova lógica substitua imediatamente a versão antiga em dispositivos móveis."
        ]
    },
    {
        version: "1.2.5",
        date: "2025-12-29",
        title: "Feedback Visual & Gestão de Atraso",
        changes: [
            "✅ <b>Conclusão Visual:</b> Sensação de dever cumprido! Versículos revisados no dia agora ganham destaque verde e ícone de 'check' na lista, confirmando a interação imediatamente.",
            "🕒 <b>Monitor de Atraso:</b> Novo indicador dedicado (vermelho) no botão de ritmo mostra claramente os dias de atraso acumulados, separado do contador de streak.",
            "🔥 <b>Sincronia de Interface:</b> Refinamento na atualização dos contadores para garantir que o número de dias consecutivos (fogo) esteja sempre preciso após as revisões."
        ]
    },
    {
        version: "1.2.4",
        date: "2025-12-29",
        title: "Transparência na Nuvem & Atraso",
        changes: [
            "☁️ <b>Feedback de Nuvem Explícito:</b> Fim da 'ansiedade de dados'. Agora o sistema exibe notificações visuais ('Sincronizado!') e logs técnicos detalhados sempre que salva um versículo ou estatística no Firebase.",
            "🕒 <b>Badge de Atraso (Restaurado):</b> O indicador vermelho de 'dias acumulados' voltou ao botão de ritmo (canto esquerdo), permitindo visualizar sua dívida de revisão num relance.",
            "🔥 <b>Sincronia de Streak Robusta:</b> O contador de constância agora força o salvamento na nuvem a cada recálculo, garantindo que seu progresso não seja perdido ao trocar de dispositivo."
        ]
    },
    {
        version: "1.2.3",
        date: "2025-12-29",
        title: "Consciência Temporal & UX",
        changes: [
            "⏰ <b>Monitor de Atraso:</b> Novo indicador visual (ícone de relógio) no menu superior alerta sobre sua 'dívida temporal' em dias.",
            "🎨 <b>Redesign do Botão de Ritmo:</b> O botão de perfil agora possui formato retangular (cápsula) para acomodar os indicadores de Streak e Atraso sem poluição visual.",
            "📅 <b>Data Precisa:</b> Os cards de versículos atrasados agora exibem a data original do agendamento (DD/MM/AAAA), facilitando a priorização da recuperação."
        ]
    },
    {
        version: "1.2.2",
        date: "2025-12-27",
        title: "Voz & Dupla Codificação",
        changes: [
            "🔊 <b>Leitura Neural (TTS):</b> Agora o NeuroBible lê os versículos para você! Adicionado o botão 'Ouvir' no verso dos cards para ativar a memória auditiva.",
            "🧠 <b>Dual Coding:</b> Aplicação prática de neurociência. Ler e ouvir ao mesmo tempo cria duas trilhas neurais distintas, aumentando drasticamente a retenção.",
            "🛑 <b>Smart Stop:</b> O sistema de áudio é inteligente e respeita seu foco. A leitura para automaticamente ao virar o cartão, avaliar o desempenho ou fechar a revisão.",
            "📱 <b>Nativo & Offline:</b> Utiliza a voz sintética do próprio dispositivo, garantindo privacidade, zero consumo de dados e funcionamento total sem internet."
        ]
    },
    {
        version: "1.2.1",
        date: "2025-12-26",
        title: "Sincronia & Robustez",
        changes: [
            "💾 <b>Memória Permanente:</b> As configurações de ritmo (Intenso/Equilibrado/Leve) agora são salvas e restauradas da nuvem corretamente.",
            "🔥 <b>Streak Real:</b> Correção no contador de dias consecutivos. A contagem agora é enviada para o servidor instantaneamente ao ser atualizada.",
            "☁️ <b>Sync Unificado:</b> Otimização profunda na comunicação com o banco de dados. Perfil, estatísticas e versículos são baixados em um único pacote sincronizado."
        ]
    },
    {
        version: "1.2.0",
        date: "2025-12-25",
        title: "Profissionalização & UX Limpa",
        changes: [
            "✨ <b>Interface Focada:</b> O formulário de cadastro agora fica recolhido em um painel 'Accordion', reduzindo a poluição visual.",
            "🎨 <b>Design System Sóbrio:</b> Substituição completa de emojis por ícones vetoriais (SVG) finos e elegantes em todo o sistema.",
            "🛡️ <b>Feedbacks Profissionais:</b> Mensagens de sistema (Toasts) com linguagem visual técnica.",
            "⚙️ <b>Fluxo de Edição:</b> O painel de cadastro se expande automaticamente ao editar um versículo."
        ]
    },
    {
        version: "1.1.9",
        date: "2025-12-25",
        title: "UX Premium & Sync Robusto",
        changes: [
            "🎨 <b>Visual Refinado:</b> Redesign total das janelas de 'Minha Conta' e 'Ritmo'.",
            "🆔 <b>Identidade:</b> Novo painel com avatar visual e destaque para status de login.",
            "👆 <b>Seleção Tátil:</b> Opções de ritmo agora são botões grandes e interativos.",
            "☁️ <b>Fila Offline:</b> Mecanismo de 'Sync Queue' implementado para salvar dados sem internet."
        ]
    },
    {
        version: "1.1.8",
        date: "2025-12-25",
        title: "Correções de Nuvem & UI",
        changes: [
            "☁️ <b>Sync Robusto:</b> Interações salvam progresso automaticamente no Firebase.",
            "🎨 <b>Visual Clean:</b> Tela de carregamento mais leve.",
            "⚙️ <b>Validação:</b> Auditoria no salvamento de perfil de ritmo."
        ]
    },
    {
        version: "1.1.7",
        date: "2025-12-24",
        title: "Fluxo de Decisão",
        changes: [
            "🔀 <b>Decisão Bifurcada:</b> Escolha explícita entre ver a Explicação ou Avançar na tela da Mnemônica.",
            "🛡️ <b>Proteção de Treino:</b> Ocultação estratégica da resposta completa nas etapas iniciais.",
            "✨ <b>UX:</b> Botões de ação mais claros e contextuais."
        ]
    },
    {
        version: "1.1.6",
        date: "2025-12-23",
        title: "Fluidez & Arquitetura",
        changes: [
            "🏗️ <b>Arquitetura Modular:</b> Reconstrução total do sistema em módulos ES6.",
            "⚡ <b>Fluxo Ágil:</b> Opção de pular a explicação da mnemônica.",
            "🌫️ <b>Transições Suaves:</b> Animações visuais no flashcard."
        ]
    },
    {
        version: "1.1.5",
        date: "2025-12-22",
        title: "Edição Completa",
        changes: ["Modo de edição e correções de layout."]
    }
];

export function initChangelog() {
    window.neuroChangelog = systemChangelog;

    const versionEl = document.getElementById('currentVersion');
    if (versionEl && systemChangelog.length > 0) {
        versionEl.innerText = `v${systemChangelog[0].version}`;
    }
}
