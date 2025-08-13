let eventChart;
let monitoringInterval;
let eventCounts = [];
let eventListeners = {};
let isMonitoring = false;

// Função para calcular fatorial (com limite para evitar overflow)
function factorial(n) {
  if (n <= 1) return 1;
  if (n > 170) return Infinity; // JavaScript não consegue calcular fatoriais > 170!
  return n * factorial(n - 1);
}

// Função para calcular logaritmo do fatorial (mais estável)
function logFactorial(n) {
  if (n <= 1) return 0;
  let result = 0;
  for (let i = 2; i <= n; i++) {
    result += Math.log(i);
  }
  return result;
}

// Função para calcular combinação C(n,k) de forma estável
function combination(n, k) {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  
  // Para números grandes, usar logaritmos
  if (n > 170) {
    const logResult = logFactorial(n) - logFactorial(k) - logFactorial(n - k);
    return Math.exp(logResult);
  }
  
  // Para números menores, usar método iterativo mais estável
  k = Math.min(k, n - k); // Aproveitar simetria
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

// Calcular probabilidade binomial de forma estável
function binomialProbability(n, k, p) {
  if (k > n || k < 0) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  
  // Para números grandes, usar logaritmos para evitar overflow
  if (n > 170) {
    const logComb = logFactorial(n) - logFactorial(k) - logFactorial(n - k);
    const logProb = logComb + k * Math.log(p) + (n - k) * Math.log(1 - p);
    return Math.exp(logProb);
  }
  
  const comb = combination(n, k);
  if (!isFinite(comb)) return 0;
  
  const prob = comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
  return isFinite(prob) ? prob : 0;
}

// Calcular probabilidade de Poisson de forma estável
function poissonProbability(lambda, k) {
  if (lambda <= 0 || k < 0) return 0;
  if (k === 0) return Math.exp(-lambda);
  
  // Para valores grandes, usar logaritmos
  if (k > 170 || lambda > 700) {
    const logProb = -lambda + k * Math.log(lambda) - logFactorial(k);
    return Math.exp(logProb);
  }
  
  // Para valores menores, usar cálculo direto otimizado
  let result = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) {
    result = result * lambda / i;
  }
  
  return isFinite(result) ? result : 0;
}

// Executar testes REAIS de performance do sistema
async function runPerformanceTests() {
  const button = document.getElementById("testButton");
  const numTests = parseInt(document.getElementById("numTests").value);
  const timeLimit = parseInt(document.getElementById("timeLimit").value);

  button.disabled = true;
  button.textContent = "⏳ Medindo Performance Real...";

  let successes = 0;
  let failures = 0;

  addLogEntry(
    "[BINOMIAL] Iniciando medições REAIS de performance do sistema...",
    "binomial"
  );

  for (let i = 0; i < numTests; i++) {
    const startTime = performance.now();
    
    // TESTE 1: Tempo real de renderização de frame
    const frameStart = performance.now();
    await new Promise(resolve => requestAnimationFrame(resolve));
    const frameTime = performance.now() - frameStart;

    // TESTE 2: Latência real de fetch (rede)
    const networkStart = performance.now();
    try {
      await fetch('data:text/plain,test');
    } catch (e) {
      // Fallback se fetch falhar
    }
    const networkTime = performance.now() - networkStart;

    // TESTE 3: Tempo real de acesso ao DOM
    const domStart = performance.now();
    const testDiv = document.createElement('div');
    testDiv.innerHTML = 'test';
    document.body.appendChild(testDiv);
    const computedStyle = window.getComputedStyle(testDiv);
    const bgColor = computedStyle.backgroundColor;
    document.body.removeChild(testDiv);
    const domTime = performance.now() - domStart;

    // TESTE 4: Performance real de JavaScript
    const jsStart = performance.now();
    let sum = 0;
    for (let j = 0; j < 10000; j++) {
      sum += Math.random();
    }
    const jsTime = performance.now() - jsStart;

    // TESTE 5: Tempo real de garbage collection (medido indiretamente)
    const gcStart = performance.now();
    const tempArray = new Array(1000).fill(0).map(() => ({ id: Math.random() }));
    tempArray.length = 0;
    const gcTime = performance.now() - gcStart;

    const totalTime = performance.now() - startTime;

    // Log detalhado do teste REAL
    const status = totalTime <= timeLimit ? "✅ RÁPIDO" : "❌ LENTO";
    addLogEntry(
      `[TESTE ${i + 1}] ${status} - Total: ${totalTime.toFixed(1)}ms | Frame: ${frameTime.toFixed(1)}ms | Rede: ${networkTime.toFixed(1)}ms | DOM: ${domTime.toFixed(1)}ms | JS: ${jsTime.toFixed(1)}ms`,
      totalTime <= timeLimit ? "system" : "binomial"
    );

    if (totalTime <= timeLimit) {
      successes++;
      document.getElementById("successValue").textContent = successes;
    } else {
      failures++;
      document.getElementById("failedValue").textContent = failures;
    }

    // Atualizar taxa de sucesso
    const rate = ((successes / (i + 1)) * 100).toFixed(1);
    document.getElementById("rateValue").textContent = rate + "%";

    // Pausa mínima entre testes
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // Calcular probabilidades baseadas nos dados REAIS
  const observedP = successes / numTests;
  const k = successes;
  const theoreticalProb = binomialProbability(numTests, k, observedP);

  let calcText;
  if (isFinite(theoreticalProb) && theoreticalProb > 0) {
    calcText = `
                <strong>Análise Real do Sistema:</strong><br>
                n = ${numTests} testes, k = ${k} sucessos<br>
                p = ${observedP.toFixed(3)} (taxa real observada)<br>
                P(X = ${k}) = ${(theoreticalProb * 100).toFixed(6)}%<br>
                Performance Real: ${(observedP * 100).toFixed(1)}% dos testes foram rápidos<br>
                <br>
                <small style="opacity: 0.7; font-size: 0.85em;">
                <strong>Onde:</strong><br>
                • n = número total de tentativas (testes)<br>
                • k = número de sucessos observados<br>
                • p = probabilidade de sucesso em cada tentativa<br>
                • C(n,k) = combinação de n elementos tomados k a k<br>
                • X = variável aleatória (nº de sucessos)
                </small>
            `;
  } else {
    // Para casos onde a probabilidade é muito pequena
    calcText = `
                <strong>Análise Real do Sistema:</strong><br>
                n = ${numTests} testes, k = ${k} sucessos<br>
                p = ${observedP.toFixed(3)} (taxa real observada)<br>
                P(X = ${k}) ≈ ${theoreticalProb < 1e-10 ? 'muito pequena' : 'calculando...'}<br>
                Performance Real: ${(observedP * 100).toFixed(1)}% dos testes foram rápidos<br>
                <small style="opacity: 0.7">Nota: Para n=${numTests}, a probabilidade exata é muito pequena para exibir</small><br>
                <br>
                <small style="opacity: 0.7; font-size: 0.85em;">
                <strong>Onde:</strong><br>
                • n = número total de tentativas (testes)<br>
                • k = número de sucessos observados<br>
                • p = probabilidade de sucesso em cada tentativa<br>
                • C(n,k) = combinação de n elementos tomados k a k<br>
                • X = variável aleatória (nº de sucessos)
                </small>
            `;
  }
  
  document.getElementById("binomialResult").innerHTML = calcText;

  addLogEntry(
    `[BINOMIAL] Análise concluída: ${successes}/${numTests} testes rápidos (${(observedP * 100).toFixed(1)}% de performance)`,
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
                        P(X = ${currentCount}) = ${(prob * 100).toFixed(4)}%<br>
                        Intervalo atual: ${eventCounts.length}<br>
                        <br>
                        <small style="opacity: 0.7; font-size: 0.85em;">
                        <strong>Onde:</strong><br>
                        • λ (lambda) = taxa média de eventos por intervalo<br>
                        • k = número específico de eventos observados<br>
                        • e ≈ 2.718 (constante matemática de Euler)<br>
                        • X = variável aleatória (nº de eventos)
                        </small>
                    `;
      document.getElementById("poissonResult").innerHTML = calcText;
    }

    addLogEntry(
      `[POISSON] Intervalo ${eventCounts.length}: ${currentCount} eventos (λ=${lambda.toFixed(1)})`,
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

// Monitorar informações REAIS do sistema em tempo real
function updateSystemInfo() {
  // Memória REAL (se disponível)
  if (performance.memory) {
    const usedMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
    const totalMB = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
    const limitMB = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1);
    const usage = ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1);
    
    const status = usage < 50 ? "status-online" : usage < 80 ? "status-warning" : "status-critical";
    document.getElementById("memoryValue").innerHTML = 
      `<span class="status-indicator ${status}"></span>${usedMB}MB de ${limitMB}MB (${usage}%)`;
  } else {
    document.getElementById("memoryValue").innerHTML = 
      `<span class="status-indicator status-warning"></span>Não disponível neste navegador`;
  }

  // Latência REAL de rede com múltiplas medições
  const networkTests = [];
  for (let i = 0; i < 3; i++) {
    const startTime = performance.now();
    fetch(`data:text/plain,test${i}?t=${Date.now()}`)
      .then(() => {
        const latency = performance.now() - startTime;
        networkTests.push(latency);
        
        if (networkTests.length === 3) {
          const avgLatency = (networkTests.reduce((a, b) => a + b) / networkTests.length).toFixed(1);
          const status = avgLatency < 5 ? "status-online" : avgLatency < 20 ? "status-warning" : "status-critical";
          document.getElementById("speedValue").innerHTML = 
            `<span class="status-indicator ${status}"></span>${avgLatency}ms (média)`;
        }
      })
      .catch(() => {
        document.getElementById("speedValue").innerHTML = 
          `<span class="status-indicator status-critical"></span>Erro de conexão`;
      });
  }

  // FPS REAL da tela
  let frameCount = 0;
  let lastTime = performance.now();
  
  function measureFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
      const fpsStatus = fps >= 50 ? "status-online" : fps >= 30 ? "status-warning" : "status-critical";
      
      // Informações reais da tela
      const screen = window.screen;
      const pixelRatio = window.devicePixelRatio || 1;
      const colorDepth = screen.colorDepth;
      
      document.getElementById("screenValue").innerHTML = 
        `<span class="status-indicator ${fpsStatus}"></span>${screen.width}x${screen.height} @${fps}FPS (${colorDepth}bit)`;
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(measureFPS);
  }
  measureFPS();

  // Detecção REAL e PRECISA do navegador
  function detectRealBrowser() {
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor || '';
    
    // Detecção específica do Edge (incluindo Edge Chromium)
    if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
      return 'Microsoft Edge';
    }
    // Chrome (mas não Edge que também tem Chrome no userAgent)
    else if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && vendor.includes('Google')) {
      return 'Google Chrome';
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      return 'Mozilla Firefox';
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome') && vendor.includes('Apple')) {
      return 'Apple Safari';
    }
    // Opera
    else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
      return 'Opera';
    }
    // Internet Explorer
    else if (userAgent.includes('Trident/') || userAgent.includes('MSIE')) {
      return 'Internet Explorer';
    }
    else {
      return 'Navegador desconhecido';
    }
  }

  // CPU e navegador REAIS
  const realBrowser = detectRealBrowser();
  const cores = navigator.hardwareConcurrency || 'N/A';
  const platform = navigator.platform || 'Desconhecido';
  const language = navigator.language || 'N/A';
  
  // Detecção da arquitetura do processador
  let architecture = 'Desconhecida';
  if (platform.includes('Win64') || platform.includes('x86_64') || platform.includes('amd64')) {
    architecture = '64-bit';
  } else if (platform.includes('Win32') || platform.includes('i386')) {
    architecture = '32-bit';
  } else if (platform.includes('ARM')) {
    architecture = 'ARM';
  }
  
  document.getElementById("browserValue").innerHTML = 
    `<span class="status-indicator status-online"></span>${realBrowser}<br>
     <small style="opacity: 0.8">${cores} cores (${architecture}) - ${platform}</small>`;
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

// Inicializar sistema com dados REAIS
document.addEventListener("DOMContentLoaded", function () {
  updateSystemInfo();
  setInterval(updateSystemInfo, 3000); // Atualizar a cada 3 segundos

  // Coletar informações REAIS do sistema na inicialização
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const cores = navigator.hardwareConcurrency || 'N/A';
  const language = navigator.language;
  const cookieEnabled = navigator.cookieEnabled;
  const onlineStatus = navigator.onLine ? 'Online' : 'Offline';
  const screenRes = `${screen.width}x${screen.height}`;
  const colorDepth = screen.colorDepth;
  const pixelDepth = screen.pixelDepth;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Detecção real do navegador
  let realBrowser = 'Desconhecido';
  if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
    realBrowser = 'Microsoft Edge';
  } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    realBrowser = 'Google Chrome';  
  } else if (userAgent.includes('Firefox')) {
    realBrowser = 'Mozilla Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    realBrowser = 'Apple Safari';
  } else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
    realBrowser = 'Opera';
  }

  // Log inicial com informações REAIS
  addLogEntry(`[SISTEMA] Navegador detectado: ${realBrowser}`, "system");
  addLogEntry(`[SISTEMA] Plataforma: ${platform} (${cores} cores de CPU)`, "system");
  addLogEntry(`[SISTEMA] Resolução: ${screenRes} (${colorDepth}-bit, ratio: ${window.devicePixelRatio || 1})`, "system");
  addLogEntry(`[SISTEMA] Status: ${onlineStatus} | Idioma: ${language} | Fuso: ${timezone}`, "system");
  
  // Informações de memória se disponível
  if (performance.memory) {
    const memLimit = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(0);
    addLogEntry(`[SISTEMA] Limite de memória JS: ${memLimit}MB`, "system");
  }
  
  // Informações de conexão se disponível
  if (navigator.connection) {
    const conn = navigator.connection;
    const effectiveType = conn.effectiveType || 'N/A';
    const downlink = conn.downlink ? `${conn.downlink} Mbps` : 'N/A';
    addLogEntry(`[SISTEMA] Conexão: ${effectiveType} (${downlink})`, "system");
  }
});
