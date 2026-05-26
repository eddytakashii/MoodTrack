/// <reference types="node" />
/**
 * IoT Simulator - Simula sensores ambientais e envia dados para a API
 * Gera alertas automáticos baseado em thresholds de temperatura, luminosidade e ruído
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const INTERVAL_SECONDS = 30; // Envia dados a cada 30 segundos
const SIMULATION_ENABLED = true;

interface SensorData {
  temp: number;
  luz: number;
  ruido: number;
  horario: string;
}

/**
 * Gera valores aleatórios de sensores com variações realistas
 */
function generateSensorData(): SensorData {
  // Temperatura: varia entre 18°C e 32°C
  const temp = parseFloat((Math.random() * 14 + 18).toFixed(1));

  // Luminosidade: varia entre 20 lux e 500 lux
  const luz = Math.floor(Math.random() * 480 + 20);

  // Ruído: varia entre 35 dB e 85 dB
  const ruido = Math.floor(Math.random() * 50 + 35);

  return {
    temp,
    luz,
    ruido,
    horario: new Date().toISOString(),
  };
}

/**
 * Envia dados de sensores para a API
 */
async function sendSensorData(data: SensorData): Promise<void> {
  try {
    const response = await axios.post(`${API_URL}/environment`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    // Log com timestamp e status dos alertas gerados
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const alerts = response.data.alerts || [];

    console.info(`[${timestamp}] Dados enviados com sucesso`);
    console.info(`Temperatura: ${data.temp}°C, Luminosidade: ${data.luz} lux, Ruído: ${data.ruido} dB`);

    // Exibe alertas gerados
    if (alerts.length > 0) {
      console.warn(`Alertas gerados: ${alerts.length}`);
      alerts.forEach((alert: any) => {
        console.warn(`${alert.tipo}: ${alert.mensagem}`);
      });
    } else {
      console.info('Nenhum alerta');
    }
  } catch (error: any) {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    console.error(
      `\n[${timestamp}] ❌ Erro ao enviar dados:`,
      error.response?.data || error.message
    );
  }
}

/**
 * Simula um ciclo completo de sensores
 * Começa com condições normais e varia para gerar alertas
 */
async function runSimulationCycle(): Promise<void> {
  const cycles = [
    { name: 'Condições Normais', adjustments: { temp: 0, luz: 0, ruido: 0 } },
    { name: 'Ambiente Quente', adjustments: { temp: 8, luz: 0, ruido: 0 } },
    { name: 'Pouca Luz', adjustments: { temp: 0, luz: -80, ruido: 0 } },
    { name: 'Muito Barulho', adjustments: { temp: 0, luz: 0, ruido: 35 } },
    { name: 'Condições Críticas', adjustments: { temp: 10, luz: -90, ruido: 40 } },
  ];

  for (const cycle of cycles) {
  console.info(`CICLO: ${cycle.name}`);

    // Envia 3 dados de sensores com o mesmo padrão
    for (let i = 0; i < 3; i++) {
      const baseData = generateSensorData();
      const adjustedData: SensorData = {
        temp: Math.max(15, Math.min(35, baseData.temp + cycle.adjustments.temp)),
        luz: Math.max(10, Math.min(600, baseData.luz + cycle.adjustments.luz)),
        ruido: Math.max(30, Math.min(100, baseData.ruido + cycle.adjustments.ruido)),
        horario: new Date().toISOString(),
      };

      await sendSensorData(adjustedData);
      await sleep(INTERVAL_SECONDS * 1000);
    }
  }
}

/**
 * Simula o funcionamento contínuo de sensores
 */
async function runContinuousSimulation(): Promise<void> {
  console.info('IoT Simulator iniciado');
  console.info(`API: ${API_URL}`);
  console.info(`Intervalo: ${INTERVAL_SECONDS} segundos`);

  let dataCount = 0;
  const startTime = Date.now();

  while (true) {
    dataCount++;
    const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.info(`Pacote #${dataCount} | ${elapsedMinutes}min - Enviando dados de sensores`);

    const data = generateSensorData();
    await sendSensorData(data);

    // Aguarda antes de enviar o próximo pacote
    await sleep(INTERVAL_SECONDS * 1000);
  }
}

/**
 * Utilitário para aguardar (sleep)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Função principal
 */
async function main(): Promise<void> {
  try {
    // Verifica se a API está disponível
    console.info('Verificando disponibilidade da API...');
      console.info(`Tentando conectar em: ${API_URL}`);
    try {
      const response = await axios.get(`${API_URL}/health`, { timeout: 10000 });
        console.info('API está online');
        console.info(`Resposta: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.error('Erro: API não está disponível em ' + API_URL);
        console.error('Certifique-se de que o backend está rodando: npm run dev');
      process.exit(1);
    }

    // Escolhe entre modo de ciclo ou contínuo
    const mode = process.argv[2] || 'cycle';

    if (mode === 'continuous') {
      await runContinuousSimulation();
    } else {
      await runSimulationCycle();
      console.info('Simulação de ciclos concluída. Use "continuous" para modo contínuo.');
    }
  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Inicia o simulator
main();
