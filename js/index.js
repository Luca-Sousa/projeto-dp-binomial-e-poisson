let eventChart;
let monitoringInterval;
let eventCounts = [];
let eventListeners = {};
let isMonitoring = false;

// Função para calcular fatorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Função para calcular combinação C(n,k)
function combination(n, k) {
  if (k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

// Calcular probabilidade binomial
function binomialProbability(n, k, p) {
  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Calcular probabilidade de Poisson
function poissonProbability(lambda, k) {
  return (Math.pow(Math.E, -lambda) * Math.pow(lambda, k)) / factorial(k);
}

// Executar testes reais de performance
async function runPerformanceTests() {
  const button = document.getElementById("testButton");
  const numTests = parseInt(document.getElementById("numTests").value);
  const timeLimit = parseInt(document.getElementById("timeLimit").value);

  button.disabled = true;
  button.textContent = "⏳ Executando...";

  let successes = 0;
  let failures = 0;

  addLogEntry(
    "[BINOMIAL] Iniciando testes reais de performance...",
    "binomial"
  );

  for (let i = 0; i < numTests; i++) {
    const startTime = performance.now();
    const difficulty = document.getElementById("difficultyLevel").value;

    // Ajustar intensidade baseado na dificuldade
    let baseOperations, domElements, mathComplexity;

    switch (difficulty) {
      case "easy":
        baseOperations = 500;
        domElements = 10;
        mathComplexity = 1000;
        break;
      case "medium":
        baseOperations = 2000;
        domElements = 50;
        mathComplexity = 3000;
        break;
      case "hard":
        baseOperations = 5000;
        domElements = 100;
        mathComplexity = 8000;
        break;
    }

    // Teste mais desafiador: múltiplas operações intensivas

    // 1. Criação e manipulação de DOM complexa
    const container = document.createElement("div");
    for (let k = 0; k < domElements; k++) {
      const element = document.createElement("div");
      element.innerHTML = `<span>Item ${k}</span><input type="text" value="test${k}">`;
      element.style.cssText = `position: absolute; left: ${k}px; top: ${k}px; opacity: 0.5;`;
      container.appendChild(element);
    }
    document.body.appendChild(container);

    // 2. Operações matemáticas intensivas com variação aleatória
    let result = 0;
    const operations =
      baseOperations + Math.floor(Math.random() * mathComplexity);
    for (let j = 0; j < operations; j++) {
      result += Math.sin(j) * Math.cos(j) * Math.sqrt(j + 1);
      if (j % 100 === 0) {
        result = result % 1000; // Evitar overflow
      }
    }

    // 3. Manipulação de arrays grandes (varia com dificuldade)
    const arraySize = domElements * 20;
    const testArray = new Array(arraySize)
      .fill(0)
      .map((_, idx) => Math.random() * idx);
    testArray.sort((a, b) => a - b);
    const filtered = testArray.filter((x) => x > 0.5);

    // 4. Simulação de delay de rede variável
    const networkDelay =
      Math.random() *
      (difficulty === "hard" ? 50 : difficulty === "medium" ? 30 : 15);
    await new Promise((resolve) => setTimeout(resolve, networkDelay));

    // 5. Forçar garbage collection (operação custosa)
    if (difficulty === "hard") {
      const wasteArray = new Array(10000).fill(0).map(() => ({
        data: Math.random().toString(36),
        timestamp: Date.now(),
      }));
      wasteArray.length = 0; // Limpar para forçar GC
    }

    // 6. Limpeza
    document.body.removeChild(container);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log detalhado do teste
    const status = duration <= timeLimit ? "✅ PASSOU" : "❌ FALHOU";
    addLogEntry(
      `[TESTE ${i + 1}] ${status} - ${duration.toFixed(
        1
      )}ms (limite: ${timeLimit}ms) - Ops: ${operations}`,
      duration <= timeLimit ? "system" : "binomial"
    );

    if (duration <= timeLimit) {
      successes++;
      document.getElementById("successValue").textContent = successes;
    } else {
      failures++;
      document.getElementById("failedValue").textContent = failures;
    }

    // Atualizar taxa de sucesso
    const rate = ((successes / (i + 1)) * 100).toFixed(1);
    document.getElementById("rateValue").textContent = rate + "%";

    // Pausa para visualização e permitir que o browser respire
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Calcular probabilidades teóricas vs observadas
  const observedP = successes / numTests;
  const k = successes;
  const theoreticalProb = binomialProbability(numTests, k, observedP);

  const calcText = `
                n = ${numTests}, k = ${k}, p = ${observedP.toFixed(3)}<br>
                P(X = ${k}) = ${(theoreticalProb * 100).toFixed(2)}%<br>
                Probabilidade observada: ${(observedP * 100).toFixed(1)}%
            `;
  document.getElementById("binomialResult").innerHTML = calcText;

  addLogEntry(
    `[BINOMIAL] Testes concluídos: ${successes}/${numTests} sucessos (${(
      observedP * 100
    ).toFixed(1)}%)`,
    "binomial"
  );

  button.disabled = false;
  button.textContent = "🚀 Executar Testes";
}

// Monitorar eventos reais do usuário
function startEventMonitoring() {
  const button = document.getElementById("monitorButton");
  const eventType = document.getElementById("eventType").value;
  const interval = parseInt(document.getElementById("interval").value) * 1000;

  if (isMonitoring) {
    // Parar monitoramento
    stopEventMonitoring();
    return;
  }

  isMonitoring = true;
  button.textContent = "⏸️ Parar Monitoramento";
  button.style.background = "linear-gradient(45deg, #ff4757, #ff3742)";

  eventCounts = [];
  let currentCount = 0;

  // Limpar listeners anteriores
  Object.keys(eventListeners).forEach((event) => {
    window.removeEventListener(event, eventListeners[event]);
  });
  eventListeners = {};

  // Configurar listener para o tipo de evento selecionado
  const eventName = getEventName(eventType);
  const eventListener = () => currentCount++;

  window.addEventListener(eventName, eventListener);
  eventListeners[eventName] = eventListener;

  addLogEntry(
    `[POISSON] Monitoramento iniciado: ${eventType} a cada ${interval / 1000}s`,
    "poisson"
  );

  // Iniciar coleta de dados
  monitoringInterval = setInterval(() => {
    eventCounts.push(currentCount);
    document.getElementById("currentValue").textContent = currentCount;

    // Calcular média (lambda)
    const lambda =
      eventCounts.reduce((sum, count) => sum + count, 0) / eventCounts.length;
    document.getElementById("avgValue").textContent = lambda.toFixed(1);
    document.getElementById("intervalValue").textContent = eventCounts.length;

    // Calcular probabilidade de Poisson para o valor atual
    if (lambda > 0) {
      const prob = poissonProbability(lambda, currentCount);
      const calcText = `
                        λ = ${lambda.toFixed(2)}, k = ${currentCount}<br>
                        P(X = ${currentCount}) = ${(prob * 100).toFixed(2)}%<br>
                        Intervalo atual: ${eventCounts.length}
                    `;
      document.getElementById("poissonResult").innerHTML = calcText;
    }

    addLogEntry(
      `[POISSON] Intervalo ${
        eventCounts.length
      }: ${currentCount} eventos (λ=${lambda.toFixed(1)})`,
      "poisson"
    );

    // Atualizar gráfico
    updateEventChart();

    // Reset para próximo intervalo
    currentCount = 0;

    // Parar após 20 intervalos
    if (eventCounts.length >= 20) {
      stopEventMonitoring();
    }
  }, interval);
}

function stopEventMonitoring() {
  isMonitoring = false;
  const button = document.getElementById("monitorButton");
  button.textContent = "📈 Iniciar Monitoramento";
  button.style.background = "linear-gradient(45deg, #00ff88, #00ccff)";

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  // Limpar event listeners
  Object.keys(eventListeners).forEach((event) => {
    window.removeEventListener(event, eventListeners[event]);
  });
  eventListeners = {};

  addLogEntry("[POISSON] Monitoramento finalizado", "poisson");
}

function getEventName(eventType) {
  const eventMap = {
    mouse: "mousemove",
    keyboard: "keydown",
    scroll: "scroll",
    resize: "resize",
  };
  return eventMap[eventType] || "mousemove";
}

// Atualizar gráfico de eventos
function updateEventChart() {
  const ctx = document.getElementById("eventChart").getContext("2d");

  if (eventChart) {
    eventChart.destroy();
  }

  eventChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: eventCounts.map((_, i) => `Int ${i + 1}`),
      datasets: [
        {
          label: "Eventos por Intervalo",
          data: eventCounts,
          backgroundColor: "rgba(0, 255, 136, 0.3)",
          borderColor: "#00ff88",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "white" },
        },
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          beginAtZero: true,
        },
      },
    },
  });
}

// Monitorar informações reais do sistema
function updateSystemInfo() {
  // Memória (se disponível)
  if (performance.memory) {
    const memory = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
    document.getElementById(
      "memoryValue"
    ).innerHTML = `<span class="status-indicator status-online"></span>${memory} MB`;
  }

  // Teste de latência
  const startTime = performance.now();
  fetch("data:text/plain,test")
    .then(() => {
      const latency = (performance.now() - startTime).toFixed(1);
      document.getElementById(
        "speedValue"
      ).innerHTML = `<span class="status-indicator status-online"></span>${latency} ms`;
    })
    .catch(() => {
      document.getElementById(
        "speedValue"
      ).innerHTML = `<span class="status-indicator status-warning"></span>N/A`;
    });

  // Informações do navegador
  document.getElementById(
    "screenValue"
  ).innerHTML = `<span class="status-indicator status-online"></span>${window.screen.width}x${window.screen.height}`;

  const browserName = navigator.userAgent.includes("Chrome")
    ? "Chrome"
    : navigator.userAgent.includes("Firefox")
    ? "Firefox"
    : navigator.userAgent.includes("Safari")
    ? "Safari"
    : "Outro";
  document.getElementById(
    "browserValue"
  ).innerHTML = `<span class="status-indicator status-online"></span>${browserName}`;
}

// Adicionar entrada no log
function addLogEntry(message, type) {
  const log = document.getElementById("eventLog");
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<strong>${timestamp}</strong> - ${message}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// Inicializar sistema
document.addEventListener("DOMContentLoaded", function () {
  updateSystemInfo();
  setInterval(updateSystemInfo, 5000); // Atualizar a cada 5 segundos

  // Adicionar log inicial com informações reais
  addLogEntry(
    `[SISTEMA] Browser: ${navigator.userAgent.split(" ")[0]}`,
    "system"
  );
  addLogEntry(
    `[SISTEMA] Resolução: ${window.screen.width}x${window.screen.height}`,
    "system"
  );
  addLogEntry(
    `[SISTEMA] Cores disponíveis: ${navigator.hardwareConcurrency || "N/A"}`,
    "system"
  );
});
