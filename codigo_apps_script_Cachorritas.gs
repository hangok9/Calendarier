function onOpen() {
      SpreadsheetApp.getUi()
        .createMenu('📅 Grupo')
        .addItem('Marcar rango de dias...', 'showDialog')
        .addSeparator()
        .addItem('Limpiar todo', 'clearAll')
        .addToUi();
    }

    function showDialog() {
      var html = HtmlService.createHtmlOutput(
        '<style>' +
        'body{font-family:Arial,sans-serif;padding:20px}' +
        'label{display:block;margin-top:12px;font-weight:bold;font-size:13px}' +
        'select,input{width:100%;padding:8px;margin-top:4px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box}' +
        'button{margin-top:20px;padding:10px 20px;background:#27AE60;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px}' +
        'button:hover{background:#1E8449}' +
        '</style>' +
        '<h3>Marcar disponibilidad en lote</h3>' +
        '<label>Persona</label>' +
        '<select id="persona">' +
        '<option>SUSANNA</option><option>ZUA</option><option>PEPE</option><option>ANTO</option><option>ELIAS</option><option>CRIS</option>' +
        '</select>' +
        '<label>Codigo</label>' +
        '<select id="codigo">' +
        '<option value="TM">TM - Trabajar manana (~08-15)</option><option value="TT">TT - Trabajar tarde (~15-21)</option><option value="TN">TN - Trabajar noche (~21-08)</option><option value="FV">FV - Fuera (puedo volver)</option><option value="FN">FN - Fuera (NO volver)</option><option value="OC">OC - Ocupado</option><option value="RE">RE - Recuperaciones</option><option value="OT">OT - Otros</option><option value="CL">CL - Clases</option>' +
        '</select>' +
        '<label>Fecha inicio</label>' +
        '<input type="date" id="inicio">' +
        '<label>Fecha fin</label>' +
        '<input type="date" id="fin">' +
        '<button onclick="marcar()">Aplicar</button>' +
        '<div id="resultado" style="margin-top:15px;padding:10px;border-radius:4px;display:none"></div>' +
        '<script>' +
        'function marcar(){var p=document.getElementById("persona").value;' +
        'var c=document.getElementById("codigo").value;' +
        'var i=document.getElementById("inicio").value;' +
        'var f=document.getElementById("fin").value;' +
        'if(!i||!f){var r=document.getElementById("resultado");' +
        'r.style.display="block";r.style.background="#FDEDEC";r.style.color="#E74C3C";' +
        'r.innerHTML="Selecciona fecha de inicio y fin";return}' +
        'google.script.run.withSuccessHandler(function(msg){' +
        'var r=document.getElementById("resultado");' +
        'r.style.display="block";r.style.background="#D5F5E3";r.style.color="#1E8449";' +
        'r.innerHTML=msg}).marcarRango(p,c,i,f)}' +
        '</script>'
      ).setWidth(380).setHeight(440);
      SpreadsheetApp.getUi().showModalDialog(html, '📅 Marcar rango');
    }

    function marcarRango(persona, codigo, inicio, fin) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Calendario');
      if (!sheet) return 'Error: hoja Calendario no encontrada';
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var col = -1;
      for (var h = 0; h < headers.length; h++) {
        if (String(headers[h]).toUpperCase() === persona) { col = h + 1; break; }
      }
      if (col < 3) return 'Error: persona "' + persona + '" no encontrada';
      var startDate = new Date(inicio);
      var endDate = new Date(fin);
      endDate.setDate(endDate.getDate() + 1);
      var count = 0;
      for (var i = 1; i < data.length; i++) {
        var cellDate = data[i][0];
        if (cellDate instanceof Date && cellDate >= startDate && cellDate < endDate) {
          sheet.getRange(i + 1, col).setValue(codigo);
          count++;
        }
      }
      return 'Actualizados ' + count + ' dias como ' + codigo + ' para ' + persona;
    }

    function clearAll() {
      var ui = SpreadsheetApp.getUi();
      var r = ui.alert('Limpiar todo',
        'Esto borrara TODAS las celdas de disponibilidad. Continuar?',
        ui.ButtonSet.YES_NO);
      if (r === ui.Button.YES) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Calendario');
        var lastRow = sheet.getLastRow();
        var lastCol = sheet.getLastColumn();
        sheet.getRange('C2:' + sheet.getRange(1, lastCol).getA1Notation().replace(/[0-9]/g,'') + lastRow).clearContent();
        ui.alert('Listo', 'Calendario limpiado', ui.ButtonSet.OK);
      }
    }