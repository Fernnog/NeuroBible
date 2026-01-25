// js/changelog.js

export const systemChangelog = [
    {
        version: "1.3.4",
        date: "2026-01-06",
        title: "Resgate Tático & Alerta Crítico",
        changes: [
            "🆘 <b>Resgate Tático:</b> Nova ferramenta de emergência. Ao detectar sobrecarga crítica (muitos itens com atraso longo), o sistema oferece um botão para redistribuir inteligentemente esses versículos em dias futuros livres.",
            "🎨 <b>Identidade de Alerta:</b> O painel de 'Atrasados' recebeu um tratamento visual exclusivo (fundo avermelhado e bordas de alerta) para diferenciar claramente a dívida técnica da missão diária.",
            "🧠 <b>Gestão de Frustração:</b> Implementação de lógica para evitar a 'Falência de Revisão'. O sistema agora prioriza o recomeço do ciclo em vez de forçar o acúmulo infinito de tarefas atrasadas.",
            "📅 <b>Chips de Data:</b> Visualização aprimorada nos cards de atraso, mostrando exatamente quantos dias o versículo está pendente e a data original que foi perdida."
        ]
    },
    {
        version: "1.3.3",
        date: "2026-01-05",
        title: "Arquitetura de Painéis & Reset de Fluxo",
        changes: [
            "📦 <b>Independência de Painéis:</b> O painel de 'Atrasados' agora é um container físico independente, separado da 'Missão de Hoje' para melhor organização mental.",
            "🔵 <b>Identidade Prioritária:</b> Implementação de uma nova borda azulada e fundo gradiente suave para destacar versículos em atraso como prioridade máxima.",
            "♻️ <b>Reset Diário de Esforço:</b> Os contadores de interação agora zeram fisicamente a cada novo dia, garantindo que o número exibido reflita apenas o seu trabalho do dia atual.",
            "📏 <b>Safe Padding:</b> Ajuste de layout nos cards para garantir que o badge de interações nunca sobreponha os textos de status ('Recuperando' ou 'Feito').",
            "🧹 <b>Clean UI:</b> Remoção da linha tracejada legada, substituída por uma separação baseada em blocos de conteúdo."
        ]
    },
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
    }
];

export function initChangelog() {
    window.neuroChangelog = systemChangelog;

    const versionEl = document.getElementById('currentVersion');
    if (versionEl && systemChangelog.length > 0) {
        versionEl.innerText = `v${systemChangelog[0].version}`;
    }
}
