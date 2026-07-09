const COLOR_HEADER_BG = 'FF003558';
const COLOR_HEADER_TEXT = 'FFFFFFFF';
const COLOR_BORDER = 'FFD9DEE4';
const COLOR_STRIPE = 'FFF4F6F8';

export function obtenerValorExportable(column, row) {
  let value = row[column.field];
  if (column.valueGetter) value = column.valueGetter(value);
  if (column.valueFormatter) value = column.valueFormatter(value);
  return value ?? '';
}

export async function exportarExcel({ columnas, filas, nombreArchivo, nombreHoja = 'Datos' }) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Gestión de Operadores TECPORT';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(nombreHoja, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = columnas.map((col) => ({ header: col.header, key: col.key }));
  filas.forEach((fila) => sheet.addRow(fila));

  sheet.columns.forEach((column) => {
    let maxLength = column.header ? column.header.length : 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const length = cell.value ? String(cell.value).length : 0;
      if (length > maxLength) maxLength = length;
    });
    column.width = Math.min(Math.max(maxLength + 3, 12), 45);
  });

  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COLOR_HEADER_TEXT } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_BG } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin', color: { argb: COLOR_HEADER_BG } },
      left: { style: 'thin', color: { argb: COLOR_HEADER_BG } },
      bottom: { style: 'thin', color: { argb: COLOR_HEADER_BG } },
      right: { style: 'thin', color: { argb: COLOR_HEADER_BG } },
    };
  });

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const filaPar = rowNumber % 2 === 0;
    row.height = 20;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: COLOR_BORDER } },
        left: { style: 'thin', color: { argb: COLOR_BORDER } },
        bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
        right: { style: 'thin', color: { argb: COLOR_BORDER } },
      };
      cell.alignment = { vertical: 'middle' };
      if (filaPar) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_STRIPE } };
      }
    });
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columnas.length } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${nombreArchivo}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
