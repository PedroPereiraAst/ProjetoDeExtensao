// --- CONFIGURAÇÃO DOS NÍVEIS ---
let levels = [
    { // Nível 1
        title: "Nível 1: O Caminho Reto",
        gridSize: 5,
        robot: { x: 0, y: 4, dir: 0 },
        goal: { x: 0, y: 0 },
        hint: "O robô precisa se mover 4 casas para frente. Que tal usar mover(4) para fazer isso de uma só vez?"
    },
    { // Nível 2
        title: "Nível 2: Cuidado com a Parede!",
        gridSize: 5,
        robot: { x: 0, y: 4, dir: 0 },
        goal: { x: 4, y: 4 },
        walls: [{x: 2, y: 4}, {x: 2, y: 3}, {x: 2, y: 2}],
        hint: "Há uma parede no meio do caminho! Você precisa contorná-la para chegar ao seu destino."
    },
    { // Nível 3
        title: "Nível 3: O Labirinto",
        gridSize: 5,
        robot: { x: 0, y: 4, dir: 0 },
        goal: { x: 4, y: 0 },
        walls: [
            {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3},
            {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4},
        ],
        hint: "Este parece um labirinto. Planeje seus movimentos com cuidado para não bater nas paredes."
    },
    { // Nível 4
        title: "Nível 4: Atirar ou Desviar?",
        gridSize: 5,
        robot: { x: 0, y: 4, dir: 0 },
        goal: { x: 4, y: 4 },
        enemies: [{x: 2, y: 2}],
        walls: [{x: 2, y: 1}, {x: 2, y: 3}, {x: 2, y: 4}],
        hint: "Um inimigo bloqueia o caminho mais curto! Você pode usar atirarNaFrente() para eliminá-lo ou dar a volta. Em programação, sempre há mais de uma solução!"
    },
        { // Nível 5
        title: "Nível 5: Perigo Eminente!",
        gridSize: 5,
        robot: { x: 0, y: 4, dir: 0 },
        goal: { x: 4, y: 0 },
        enemies: [{x: 1, y: 0},{x: 3, y: 4}],
        walls: [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 1, y: 4},{x: 3, y: 0}, {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3}],
        hint: "Voce tera que juntar todos seu conhecimentos para conseguir passar por esse nivel. Use o atirarNaFrente() para eliminar os inimigos, mas cuidado com as paredes!"
    }
];
// Variáveis para controlar o estado atual do jogo.
let currentLevel = 0;
let activeEnemies = []; // Guarda os inimigos do nível que ainda não foram destruídos.

// --- MAPEAMENTO DOS ELEMENTOS DO DOM ---
// Pegamos referências para os elementos HTML que vamos manipular com o JavaScript.
const gridContainer = document.getElementById('grid-container');
const codeEditor = document.getElementById('code-editor');
const runButton = document.getElementById('run-button');
const resetButton = document.getElementById('reset-button');
const levelTitle = document.getElementById('level-title');
const hintButton = document.getElementById('hint-button');
const levelSelector = document.getElementById('level-selector');

// Elementos dos Modais (Pop-ups)
const messageBox = document.getElementById('message-box');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const nextLevelButton = document.getElementById('next-level-button');
const tryAgainButton = document.getElementById('try-again-button');
const hintBox = document.getElementById('hint-box');
const hintText = document.getElementById('hint-text');
const closeHintButton = document.getElementById('close-hint-button');

// --- ESTADO DO JOGO ---
let robotState = {}; // Guarda a posição (x, y) e direção (dir) do robô.
let goalState = {};  // Guarda a posição do objetivo.
let robotElement, goalElement; // Guarda os elementos HTML do robô e do objetivo.

// --- LÓGICA DO JOGO ---

/**
 * Prepara e desenha um nível específico no tabuleiro.
 * @param {number} levelIndex - O índice do nível no array `levels`.
 */
function setupLevel(levelIndex) {
    const level = levels[levelIndex];
    levelTitle.textContent = level.title;
    robotState = { ...level.robot };
    goalState = { ...level.goal };
    activeEnemies = level.enemies ? JSON.parse(JSON.stringify(level.enemies)) : [];
    
    // Limpa o grid e o recria com o tamanho certo para o nível.
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${level.gridSize}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${level.gridSize}, 1fr)`;

    for (let i = 0; i < level.gridSize * level.gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        gridContainer.appendChild(cell);
    }
    
    // Desenha as paredes, se existirem no nível.
    if (level.walls) {
        level.walls.forEach(wall => {
            const wallEl = createCharacter('wall', wall.x, wall.y);
            const cellIndex = wall.y * level.gridSize + wall.x;
            if(gridContainer.children[cellIndex]) gridContainer.children[cellIndex].appendChild(wallEl);
        });
    }
    
    // Desenha os inimigos, se existirem.
    activeEnemies.forEach(enemy => {
        const enemyEl = createCharacter('enemy', enemy.x, enemy.y);
        const cellIndex = enemy.y * level.gridSize + enemy.x;
        if(gridContainer.children[cellIndex]) gridContainer.children[cellIndex].appendChild(enemyEl);
    });

    // Cria os elementos do robô e do objetivo.
    robotElement = createCharacter('robot');
    goalElement = createCharacter('goal');
    
    // Desenha o estado inicial do jogo.
    render();
}

/**
 * Cria o elemento HTML para um personagem ou objeto do jogo.
 * @param {string} type - O tipo de personagem ('robot', 'goal', 'wall', 'enemy').
 * @param {number} x - A coordenada X (opcional).
 * @param {number} y - A coordenada Y (opcional).
 * @returns {HTMLElement} O elemento HTML criado.
 */
function createCharacter(type, x, y) {
    const el = document.createElement('div');
    el.classList.add(type);
    el.dataset.x = x;
    el.dataset.y = y;

    // Adiciona o ícone SVG correspondente ao tipo de personagem.
    switch(type) {
        case 'robot':
            el.id = 'robot';
            el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-blue-600"><path d="M12 2a2 2 0 0 1 2 2v2h-4V4a2 2 0 0 1 2-2zM6.75 8a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H6.75zM5 12a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5zm2 0v5h10v-5H7z"/></svg>`;
            break;
        case 'goal':
            el.id = 'goal';
            el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-400"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clip-rule="evenodd" /></svg>`;
            break;
        case 'wall':
            el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-slate-600"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v11A1.5 1.5 0 0 0 2.5 17h15a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 17.5 3h-15ZM9 12H5V9h4v3Zm2 0h4V9h-4v3Zm-2-5H5V4h4v3Zm2 0h4V4h-4v3Z" /></svg>`;
            break;
        case 'enemy':
            el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-red-600"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.648c1.295.743 1.295 2.545 0 3.288L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" /></svg>`;
            break;
    }
    return el;
}

/**
 * Atualiza a posição dos elementos no grid com base no estado atual do jogo.
 */
function render() {
    // Posiciona o robô e ajusta sua rotação.
    const robotCellIndex = robotState.y * levels[currentLevel].gridSize + robotState.x;
    if(gridContainer.children[robotCellIndex]) {
        gridContainer.children[robotCellIndex].appendChild(robotElement);
    }
    robotElement.style.transform = `rotate(${robotState.dir * 90}deg)`;

    // Posiciona o objetivo.
    const goalCellIndex = goalState.y * levels[currentLevel].gridSize + goalState.x;
     if(gridContainer.children[goalCellIndex] && !gridContainer.children[goalCellIndex].contains(goalElement)) {
        gridContainer.children[goalCellIndex].appendChild(goalElement);
    }
}

/**
 * Reseta o nível, limpando o código e recarregando o tabuleiro.
 */
function resetLevel() {
    codeEditor.value = '';
    setupLevel(currentLevel);
}

/**
 * Lê o código do editor, transforma em comandos e os executa um por um.
 */
function parseAndRunCommands() {
    runButton.disabled = true;
    resetButton.disabled = true;
    setupLevel(currentLevel); // Reseta o nível antes de rodar o código.

    const code = codeEditor.value;
    const lines = code.split('\n');
    const commands = [];
    
    // Expressão regular para encontrar o nome do comando e o número dentro dos parênteses.
    const commandRegex = /(\w+)\s*\(\s*(\d*)\s*\)/;

    // Itera sobre cada linha de código digitada.
    for(const line of lines) {
        const cleanedLine = line.trim().toLowerCase();
        if (cleanedLine === '') continue;

        const match = cleanedLine.match(commandRegex);

        if (match) {
            const commandName = match[1];
            const count = parseInt(match[2] || '1', 10); // Se não houver número, assume 1.

            let action = null;
            if (commandName === 'mover') action = 'move';
            if (commandName === 'virardireita') action = 'right';
            if (commandName === 'viraresquerda') action = 'left';
            if (commandName === 'atirarnafrente') action = 'shoot';

            // Adiciona a ação à lista de comandos a serem executados.
            if (action) {
                for (let i = 0; i < count; i++) {
                    commands.push(action);
                }
            }
        }
    }

    // Executa os comandos em sequência, com um pequeno intervalo entre eles.
    let i = 0;
    function executeNext() {
        if (i >= commands.length) {
            checkWinCondition(); // Verifica se o jogador venceu após o último comando.
            return;
        }
        const command = commands[i];
        let hitObstacle = false;

        // Calcula a posição alvo para os comandos 'mover' e 'atirar'.
        let targetX = robotState.x;
        let targetY = robotState.y;
        if (robotState.dir === 0) targetY--; // Cima
        if (robotState.dir === 1) targetX++; // Direita
        if (robotState.dir === 2) targetY++; // Baixo
        if (robotState.dir === 3) targetX--; // Esquerda

        switch (command) {
            case 'move':
                const walls = levels[currentLevel].walls || [];
                // Verifica se a casa alvo está bloqueada por uma parede ou inimigo.
                const isBlocked = walls.some(wall => wall.x === targetX && wall.y === targetY) ||
                                activeEnemies.some(enemy => enemy.x === targetX && enemy.y === targetY);
                
                if (isBlocked) {
                    hitObstacle = true;
                    break;
                }
                // Move o robô se o caminho estiver livre.
                if (targetX >= 0 && targetX < levels[currentLevel].gridSize && targetY >= 0 && targetY < levels[currentLevel].gridSize) {
                    robotState.x = targetX;
                    robotState.y = targetY;
                }
                break;
            
            case 'shoot':
                // Encontra e remove o inimigo na casa alvo.
                const enemyIndex = activeEnemies.findIndex(e => e.x === targetX && e.y === targetY);
                if (enemyIndex > -1) {
                    activeEnemies.splice(enemyIndex, 1);
                    const enemyEl = document.querySelector(`.enemy[data-x='${targetX}'][data-y='${targetY}']`);
                    if (enemyEl) {
                        enemyEl.style.opacity = '0';
                        setTimeout(() => enemyEl.remove(), 300);
                    }
                }
                break;

            case 'right':
                robotState.dir = (robotState.dir + 1) % 4;
                break;
            case 'left':
                robotState.dir = (robotState.dir + 3) % 4;
                break;
        }

        if (hitObstacle) {
            showMessageBox('wall'); // Mostra mensagem de colisão.
            runButton.disabled = false;
            resetButton.disabled = false;
            return;
        }

        render(); // Atualiza a tela.
        i++;
        setTimeout(executeNext, 400); // Chama o próximo comando após um intervalo.
    }
    
    executeNext();
}

/**
 * Verifica se o robô alcançou o objetivo.
 */
function checkWinCondition() {
    const isAtGoal = robotState.x === goalState.x && robotState.y === goalState.y;
    if (isAtGoal) {
        showMessageBox('success');
    } else {
        showMessageBox('fail');
    }
    runButton.disabled = false;
    resetButton.disabled = false;
}

/**
 * Mostra uma caixa de mensagem (modal) na tela.
 * @param {string} type - O tipo de mensagem ('success', 'fail', 'wall').
 */
// VERSÃO CORRIGIDA
function showMessageBox(type) {
    // Configura o título e o texto da mensagem com base no tipo.
    if (type === 'success') {
        messageTitle.textContent = 'Parabéns! 🎉';
        messageTitle.className = 'text-4xl font-black mb-2 text-green-500';
        messageText.textContent = 'Você completou o desafio com código!';
        nextLevelButton.style.display = 'inline-block';
        tryAgainButton.style.display = 'none';
        if (currentLevel >= levels.length - 1) {
            nextLevelButton.textContent = "Jogar Novamente";
        } else {
            nextLevelButton.textContent = "Próximo Nível";
        }
    } else if (type === 'fail') {
        messageTitle.textContent = 'Oh não... 😟';
        messageTitle.className = 'text-4xl font-black mb-2 text-red-500';
        messageText.textContent = 'O robô não chegou ao destino. Revise seu código e tente de novo!';
        nextLevelButton.style.display = 'none';
        tryAgainButton.style.display = 'inline-block';
    } else if (type === 'wall') {
        messageTitle.textContent = 'Cuidado! 🧱';
        messageTitle.className = 'text-4xl font-black mb-2 text-orange-500';
        messageText.textContent = 'Você bateu em um obstáculo! O nível será reiniciado quando fechar esta mensagem.';
        nextLevelButton.style.display = 'none';
        tryAgainButton.style.display = 'inline-block';
    }
    // Torna a caixa de mensagem visível adicionando a classe correta.
    messageBox.classList.add('visible');
}

// VERSÃO CORRIGIDA
function hideMessageBox() {
    // Esconde a caixa de mensagem removendo a classe correta.
    messageBox.classList.remove('visible');
}

/**
 * Mostra a caixa de dica.
 */
function showHint() {
    hintText.textContent = levels[currentLevel].hint;
    hintBox.classList.add('visible'); // Adiciona a classe correta
}

/**
 * Esconde a caixa de dica.
 */
function hideHint() {
    hintBox.classList.remove('visible'); // Adiciona a classe correta
}

// --- EVENT LISTENERS (Ouvintes de Eventos) ---
// Conecta as funções aos cliques dos botões e outras interações.
runButton.addEventListener('click', parseAndRunCommands);
resetButton.addEventListener('click', resetLevel);

tryAgainButton.addEventListener('click', () => {
    hideMessageBox();
    setupLevel(currentLevel);
});

nextLevelButton.addEventListener('click', () => {
    hideMessageBox();
    if (currentLevel >= levels.length - 1) {
        currentLevel = 0;
    } else {
        currentLevel++;
    }
    levelSelector.value = currentLevel; // Atualiza o menu seletor.
    resetLevel();
});

hintButton.addEventListener('click', showHint);
closeHintButton.addEventListener('click', hideHint);

levelSelector.addEventListener('change', (e) => {
    currentLevel = parseInt(e.target.value, 10);
    resetLevel();
});

// --- INICIALIZAÇÃO ---
// Esta função é executada assim que a página termina de carregar.
window.onload = () => {
    // Preenche o menu seletor com os títulos de todos os níveis.
    levels.forEach((level, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = level.title;
        levelSelector.appendChild(option);
    });
    // Carrega o primeiro nível.
    setupLevel(currentLevel);
};
