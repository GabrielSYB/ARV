const brl = v =>
  'R$ ' +
  parseFloat(v || 0)
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ADD ROW */

function addRow(tableId){

  const tbody = document.querySelector(`#${tableId} tbody`);

  const row = document.createElement('tr');

  row.innerHTML = `
    <td>
      <input placeholder="Nome">
    </td>

    <td>
      <input placeholder="Descrição">
    </td>

    <td>
      <input type="number" value="1" min="0" oninput="calc()">
    </td>

    <td>
      <input type="number" value="0" min="0" step="0.01" oninput="calc()">
    </td>

    <td class="rowTotal">
      R$ 0,00
    </td>

    <td>
      <button
        class="btn-remove"
        onclick="this.closest('tr').remove(); calc();"
      >
        ✕
      </button>
    </td>
  `;

  tbody.appendChild(row);

  calc();
}

function addService(){
  addRow('servicesTable');
}

function addMaterial(){
  addRow('materialsTable');
}

/* CALC */

function calc(){

  let totalS = 0;
  let totalM = 0;

  document
    .querySelectorAll('#servicesTable tbody tr')
    .forEach(row => {

      const qtd =
        parseFloat(
          row.children[2]
            .querySelector('input')
            .value
        ) || 0;

      const val =
        parseFloat(
          row.children[3]
            .querySelector('input')
            .value
        ) || 0;

      const total = qtd * val;

      totalS += total;

      row.querySelector('.rowTotal').innerText = brl(total);
    });

  document
    .querySelectorAll('#materialsTable tbody tr')
    .forEach(row => {

      const qtd =
        parseFloat(
          row.children[2]
            .querySelector('input')
            .value
        ) || 0;

      const val =
        parseFloat(
          row.children[3]
            .querySelector('input')
            .value
        ) || 0;

      const total = qtd * val;

      totalM += total;

      row.querySelector('.rowTotal').innerText = brl(total);
    });

  const grand = totalS + totalM;

  document.getElementById('totalValue').innerText = brl(grand);

  updatePreview();
}

/* PREVIEW */

function updatePreview(){

  const hoje =
    new Date().toLocaleDateString('pt-BR');

  document.getElementById('pdf_num').innerText =
    'Nº ' +
    (
      document.getElementById('orc_numero').value ||
      '000001'
    );

  document.getElementById('pdf_cnpj').innerText =
    document.getElementById('emp_cnpj').value;

  document.getElementById('pdf_emp_end').innerText =
    document.getElementById('emp_endereco').value;

  document.getElementById('pdf_emp_tel').innerText =
    document.getElementById('emp_tel').value;

  document.getElementById('pdf_emp_email').innerText =
    document.getElementById('emp_email').value;

  document.getElementById('pdf_data').innerText = hoje;

  document.getElementById('pdf_validade').innerText =
    document.getElementById('orc_validade').value;

  document.getElementById('pdf_cliente').innerText =
    document.getElementById('cliente').value;

  document.getElementById('pdf_end').innerText =
    document.getElementById('endereco').value;

  document.getElementById('pdf_tel').innerText =
    document.getElementById('telefone').value;

  let totalS = 0;

  const tbS =
    document.getElementById('pdf_servicos');

  tbS.innerHTML = '';

  let i = 1;

  document
    .querySelectorAll('#servicesTable tbody tr')
    .forEach(row => {

      const nome =
        row.children[0]
          .querySelector('input')
          .value || '—';

      const desc =
        row.children[1]
          .querySelector('input')
          .value || '—';

      const qtd =
        parseFloat(
          row.children[2]
            .querySelector('input')
            .value
        ) || 0;

      const val =
        parseFloat(
          row.children[3]
            .querySelector('input')
            .value
        ) || 0;

      const total = qtd * val;

      totalS += total;

      tbS.innerHTML += `
        <tr>
          <td>${i++}</td>
          <td>${nome}</td>
          <td>${desc}</td>
          <td class="right">${qtd}</td>
          <td class="right">${brl(val)}</td>
          <td class="right">${brl(total)}</td>
        </tr>
      `;
    });

  let totalM = 0;

  const tbM =
    document.getElementById('pdf_materiais');

  tbM.innerHTML = '';

  i = 1;

  document
    .querySelectorAll('#materialsTable tbody tr')
    .forEach(row => {

      const nome =
        row.children[0]
          .querySelector('input')
          .value || '—';

      const desc =
        row.children[1]
          .querySelector('input')
          .value || '—';

      const qtd =
        parseFloat(
          row.children[2]
            .querySelector('input')
            .value
        ) || 0;

      const val =
        parseFloat(
          row.children[3]
            .querySelector('input')
            .value
        ) || 0;

      const total = qtd * val;

      totalM += total;

      tbM.innerHTML += `
        <tr>
          <td>${i++}</td>
          <td>${nome}</td>
          <td>${desc}</td>
          <td class="right">${qtd}</td>
          <td class="right">${brl(val)}</td>
          <td class="right">${brl(total)}</td>
        </tr>
      `;
    });

  document.getElementById('pdf_grand_total').innerText =
    brl(totalS + totalM);

  document.getElementById('pdf_pagamento').innerText =
    document.getElementById('pagamento').value;

  document.getElementById('pdf_obs').innerText =
    document.getElementById('obs').value;
}

/* CLEAR */

function clearAll(){

  document.querySelector('#servicesTable tbody').innerHTML = '';

  document.querySelector('#materialsTable tbody').innerHTML = '';

  document
    .querySelectorAll('input, textarea')
    .forEach(el => {
      el.value = '';
    });

  calc();
}

/* PDF */

async function generatePDF(){

  updatePreview();

  const area =
    document.getElementById('pdfDoc');

  const canvas =
    await html2canvas(area,{
      scale:2,
      useCORS:true,
      backgroundColor:'#ffffff'
    });

  const img =
    canvas.toDataURL('image/png');

  const { jsPDF } = window.jspdf;

  const pdf =
    new jsPDF('p', 'mm', 'a4');

  const width = 210;

  const height =
    canvas.height * width / canvas.width;

  pdf.addImage(
    img,
    'PNG',
    0,
    0,
    width,
    height
  );

  const blob =
    pdf.output('blob');

  const file =
    new File(
      [blob],
      'orcamento.pdf',
      { type:'application/pdf' }
    );

  if(
    navigator.share &&
    navigator.canShare({ files:[file] })
  ){

    navigator.share({
      files:[file],
      title:'Orçamento',
      text:'Segue o orçamento.'
    });

  }else{

    pdf.save('orcamento.pdf');

  }
}

/* INIT */

addService();
addMaterial();

document
  .querySelectorAll('input, textarea')
  .forEach(el => {
    el.addEventListener('input', updatePreview);
  });

calc();
