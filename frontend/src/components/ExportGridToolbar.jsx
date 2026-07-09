import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

function ExportGridToolbar({ onExport, loading }) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Button size="small" startIcon={<FileDownloadRoundedIcon fontSize="small" />} onClick={onExport} disabled={loading}>
        {loading ? 'Generando...' : 'Exportar Excel'}
      </Button>
    </GridToolbarContainer>
  );
}

export default ExportGridToolbar;
