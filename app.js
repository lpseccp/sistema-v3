let dados = [];

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

    // Leitura exata das colunas
    dados = json.map(item => ({
      loja: item['Loja'] || 'Desconhecida',
      origem: item['OrigemDoCliente'] || 'Desconhecida',
      status: item['Status'] || 'Sem status',
      interesse: item['Interesses'] || 'Não informado'
    }));

    mostrarFiltrosDeInteresse();
  };

  reader.readAsArrayBuffer(file);
}

function mostrarFiltrosDeInteresse() {
  const container = document.getElementById('graficos');
  container.innerHTML = '<h2>Selecione um interesse:</h2>';

  const interessesUnicos = [...new Set(dados.map(d => d.interesse))];

  interessesUnicos.forEach(interesse => {
    const botao = document.createElement('button');
    botao.innerText = interesse;
    botao.className = 'filtro-interesse';
    botao.onclick = () => filtrarPorInteresse(interesse);
    container.appendChild(botao);
  });
}

function filtrarPorInteresse(interesseSelecionado) {
  const container = document.getElementById('graficos');
  container.innerHTML = `
    <h2>Interesse: ${interesseSelecionado}</h2>
    <button onclick="mostrarFiltrosDeInteresse()">⬅ Voltar</button>
  `;

  const filtrados = dados.filter(d => d.interesse === interesseSelecionado);

  function contar(campo) {
    const contagem = {};
    filtrados.forEach(item => {
      const valor = item[campo];
      contagem[valor] = (contagem[valor] || 0) + 1;
    });
    return contagem;
  }

  const origemData = contar('origem');
  criarGrafico('Origem do Cliente', 'origemGrafico', origemData, container);

  const statusData = contar('status');
  criarGrafico('Status do Atendimento', 'statusGrafico', statusData, container);
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