let dados = [];
let interessesSelecionados = [];

function importar() {
  const input = document.getElementById('inputExcel');
  const file = input.files[0];

  if (!file) {
    alert("Selecione um arquivo Excel.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const primeiraAba = workbook.SheetNames[0];
    const planilha = workbook.Sheets[primeiraAba];
    const json = XLSX.utils.sheet_to_json(planilha);

    if (json.length === 0) {
      alert("A planilha está vazia.");
      return;
    }

    dados = json.map(item => ({
      loja: item['Loja'] || 'Desconhecida',
      origem: item['OrigemDoCliente'] || 'Desconhecida',
      status: item['Status'] || 'Sem status',
      interesse: item['Interesses'] || 'Não informado'
    }));

    renderInterface();
  };

  reader.readAsArrayBuffer(file);
}

function renderInterface() {
  const container = document.getElementById('graficos');
  container.innerHTML = '';

  // Área de filtros
  const filtroDiv = document.createElement('div');
  filtroDiv.id = 'filtroInteresses';
  filtroDiv.innerHTML = '<h2>Filtros por Interesse:</h2>';
  container.appendChild(filtroDiv);

  const interessesUnicos = [...new Set(dados.map(d => d.interesse))];

  interessesUnicos.forEach(interesse => {
    const botao = document.createElement('button');
    botao.innerText = interesse;
    botao.className = 'filtro-interesse';
    botao.dataset.valor = interesse;
    botao.onclick = () => alternarFiltro(botao);
    filtroDiv.appendChild(botao);
  });

  // Área dos gráficos (sempre presente)
  const graficosDiv = document.createElement('div');
  graficosDiv.id = 'graficosFiltrados';
  container.appendChild(graficosDiv);

  atualizarGraficos(); // mostra os gráficos iniciais (sem filtro)
}

function alternarFiltro(botao) {
  const interesse = botao.dataset.valor;

  if (interessesSelecionados.includes(interesse)) {
    interessesSelecionados = interessesSelecionados.filter(i => i !== interesse);
    botao.classList.remove('ativo');
  } else {
    interessesSelecionados.push(interesse);
    botao.classList.add('ativo');
  }

  atualizarGraficos();
}

function atualizarGraficos() {
  const graficosDiv = document.getElementById('graficosFiltrados');
  graficosDiv.innerHTML = '';

  let filtrados = [];

  if (interessesSelecionados.length === 0) {
    filtrados = dados;
  } else {
    filtrados = dados.filter(d => interessesSelecionados.includes(d.interesse));
  }

  function contar(campo) {
    const contagem = {};
    filtrados.forEach(item => {
      const valor = item[campo];
      contagem[valor] = (contagem[valor] || 0) + 1;
    });
    return contagem;
  }

  const origemData = contar('origem');
  criarGrafico('Origem do Cliente', 'origemGrafico', origemData, graficosDiv);

  const statusData = contar('status');
  criarGrafico('Status do Atendimento', 'statusGrafico', statusData, graficosDiv);
}

function criarGrafico(titulo, id, dados, container) {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  container.appendChild(document.createElement('h3')).innerText = titulo;
  container.appendChild(canvas);

  new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label: 'Total',
        data: Object.values(dados),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Quantidade' }
        },
        x: {
          title: { display: true, text: 'Categoria' }
        }
      }
    }
  });
}
