import { useState, useEffect, useCallback, useRef } from 'react';
import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridOverlay,
  GridFilterModel,
  GridSortModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarProps,
  useGridApiContext,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
import {
  Box,
  LinearProgress,
  Paper,
  Button,
  Stack,
  Typography
} from '@mui/material';
import {
  Download,
} from '@mui/icons-material';
import ConfirmationDialog from './ConfirmationDialog';
import VerificationDialog from './VerificationDialog';
import ActionButtons from './ActionButtons';
import {
  Certificate,
  CertificateResponse,
  fetchCertificateData,
  fetchCertificatesForExport
} from '../api/certificateApi';
import { getMarathiStatus } from '../utils/statusUtils';

// Define a custom type for our toolbar props
interface CustomToolbarProps extends GridToolbarProps {
  searchText?: string;
  onFilterChange?: (value: string) => void;
  showAlert?: (title: string, message: string) => void;
}

// Custom toolbar component with server-side export
function CustomGridToolbar(props: CustomToolbarProps) {
  const apiRef = useGridApiContext();
  const [exporting, setExporting] = useState(false);
  const { searchText, onFilterChange, showAlert, ...toolbarProps } = props;

  // Get current filter and sort state
  const handleExport = async () => {
    try {
      // Show loading state
      setExporting(true);
      const filterModel = apiRef.current.state.filter.filterModel;
      const sortModel = apiRef.current.state.sorting.sortModel;
      const searchValue = (document.querySelector('input.MuiDataGrid-toolbarQuickFilter') as HTMLInputElement)?.value || '';

      // Call the server-side export
      const exportData = await fetchCertificatesForExport(
        filterModel,
        sortModel,
        searchValue
      );

      // Process the data from the server
      if (exportData && exportData.data && exportData.data.length > 0) {
        // Prepare CSV content - use the same column structure as the grid
        const expectedColumns = [
          'अर्ज_क्रमांक', 'अर्जदाराचे_नाव',
          'प्रकल्प_ग्रस्ताचे_नाव', 'प्रकल्पाचे_नाव', 'प्रमाणपत्र_धारक'
        ];
        const headers = expectedColumns.map(key => key.replace(/_/g, ' ').toUpperCase());

        // Create CSV content
        let csvContent = headers.join(',') + '\n';

        // Add data rows
        exportData.data.forEach(row => {
          const values = expectedColumns.map(key => {
            const value = row[key];
            // Format the value for CSV
            if (value === null || value === undefined) return '';
            // Wrap strings with commas in quotes
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvContent += values.join(',') + '\n';
        });

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `certificate_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        if (showAlert) {
          showAlert('सूचना', 'No data to export');
        } else {
          alert('No data to export');
        }
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      if (showAlert) {
        showAlert('त्रुटी', 'Failed to export data. Please try again.');
      } else {
        alert('Failed to export data. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <GridToolbarContainer {...toolbarProps}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          p: 1
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', py: 1 }}>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleExport}
            startIcon={<Download />}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
          {/* <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={onAddClick}
            startIcon={<AddIcon />}
          >
            Add New Certificate
          </Button> */}
        </Stack>

        {/* Search field on the right */}
        <Box sx={{ ml: 'auto' }}>
          <GridToolbarQuickFilter
            value={searchText}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (onFilterChange) {
                onFilterChange(event.target.value);
              }
            }}
            debounceMs={500}
          />
        </Box>
      </Box>
    </GridToolbarContainer>
  );
}

interface CertificateDataGridProps {
  selectedStatus?: number;
  onRefresh?: () => void; // Add optional refresh callback
  onEditCertificate?: (certificateId: string, formId: number) => void; // Add edit callback
}

const CertificateDataGrid = React.memo(function CertificateDataGrid({ selectedStatus = 1, onRefresh, onEditCertificate }: CertificateDataGridProps) {
  // State variables
  const [rows, setRows] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // State for alert dialog
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // State for verification dialog
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationRow, setVerificationRow] = useState<Certificate | null>(null);

  // Create refs for debouncing
  const searchTimeoutRef = useRef<number | null>(null);
  const fetchDataRef = useRef<() => Promise<CertificateResponse>>(() => Promise.resolve({ data: [], total: 0 }));


  const generateColumns = useCallback((): GridColDef[] => {
    // Define the expected columns based on your backend data structure
    const expectedColumns = [
      { field: 'क्रमांक', headerName: 'क्रमांक', width: 80 },
      { field: 'अर्ज_क्रमांक', headerName: 'अर्ज क्रमांक', width: 150 },
      { field: 'अर्जदाराचे_नाव', headerName: 'अर्जदाराचे नाव', width: 200 },
      { field: 'प्रकल्प_ग्रस्ताचे_नाव', headerName: 'प्रकल्प ग्रस्ताचे नाव', width: 200 },
      { field: 'प्रकल्पाचे_नाव', headerName: 'प्रकल्पाचे नाव', width: 200 },
      { field: 'प्रमाणपत्र_धारक', headerName: 'प्रमाणपत्र धारक', width: 200 }
    ];

    // Create columns from the expected structure
    const columns: GridColDef[] = expectedColumns.map((col) => ({
      field: col.field,
      headerName: col.headerName,
      width: col.width,
      minWidth: 100,
      flex: col.field === 'प्रकल्पाचे_नाव' || col.field === 'अर्जदाराचे_नाव' ? 1 : undefined,
      filterable: true,
      sortable: true,
    }));

    // Insert "ACTION" column at the FIRST position
    columns.unshift({
      field: 'ACTION',
      headerName: 'ACTION',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionButtons
          fetchData={fetchDataRef.current}
          applicationId={params.row.अर्ज_क्रमांक}
          onEditCertificate={onEditCertificate}
          status={params.row.स्थिती}
        />
      ),
    });

    // Insert "TAKE_ACTION" column at the SECOND position
    columns.splice(1, 0, {
      field: 'TAKE_ACTION',
      headerName: 'कृती करा',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const buttonColor = '#2196f3'; // Default blue

        return (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setVerificationRow(params.row);
              setVerificationDialogOpen(true);
            }}
            sx={{
              borderColor: buttonColor,
              color: buttonColor,
              '&:hover': {
                backgroundColor: buttonColor,
                color: 'white',
                borderColor: buttonColor
              },
              fontWeight: 500,
              fontSize: '0.75rem',
              minWidth: '80px',
              borderWidth: '1px'
            }}
          >
            Verify
          </Button>
        );
      },
    });

    // Insert "STATUS" column at the THIRD position (after ACTION and TAKE_ACTION)
    columns.splice(2, 0, {
      field: 'स्थिती',
      headerName: 'स्थिती',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography>
          {getMarathiStatus(params.row.स्थिती)}
        </Typography>
      ),
    });

    return columns;
  }, [onEditCertificate]);


  // Function to show custom alert dialog
  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Handle verification dialog close
  const handleVerificationClose = () => {
    setVerificationDialogOpen(false);
    setVerificationRow(null);
  };

  // Handle verification completion
  const handleVerificationComplete = () => {
    handleVerificationClose();
    fetchData(); // Refresh the data grid
    if (onRefresh) {
      onRefresh(); // Refresh parent dashboard status cards
    }
  };

  // Function to fetch data with current state
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCertificateData({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText,
        filterModel,
        sortModel,
        status: [selectedStatus]
      });

      setRows(response.data);
      if (response.data.length > 0 && columns.length === 0) {
        const columnConfig = generateColumns();
        setColumns(columnConfig);
      }
      setRowCount(response.total);
      return response;
    } catch (error) {
      console.error('Error fetching certificate data:', error);
      return { data: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchText, filterModel, sortModel, columns.length, generateColumns, selectedStatus]);

  // Handle search input changes with debounce
  const handleSearchChange = useCallback((value: string) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout to delay API call until user stops typing
    setSearchText(value);
    searchTimeoutRef.current = setTimeout(() => {
      setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page on search
    }, 500) as unknown as number;
  }, []);

  // Handle the main search input from the DataGrid toolbar
  const onFilterTextChange = useCallback((filterValue: string) => {
    handleSearchChange(filterValue);
  }, [handleSearchChange]);

  // Handle filter model changes
  const handleFilterModelChange = (newModel: GridFilterModel) => {
    setFilterModel(newModel);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page on filter change
  };

  // Handle sort model changes
  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel);
  };

  // Single effect to fetch data when relevant state changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update the ref whenever fetchData changes
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  const CustomLoadingOverlay = () => (
    <GridOverlay>
      <LinearProgress />
    </GridOverlay>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        height: 'auto',
        width: 'auto',
      }}
    >

      {/* Verification Dialog */}
      <VerificationDialog
        open={verificationDialogOpen}
        onClose={handleVerificationClose}
        applicationId={Number(verificationRow?.अर्ज_क्रमांक) || 0}
        onVerificationComplete={handleVerificationComplete}
      />

      {/* Alert Dialog */}
      <ConfirmationDialog
        open={alertOpen}
        onClose={handleAlertClose}
        onConfirm={handleAlertClose}
        title={alertTitle}
        message={alertMessage}
        confirmText="ठीक आहे"
        showCancelButton={false}
        bgColor="#1976d2"
        confirmButtonColor="#1976d2"
      />
      <Box sx={{ height: 'calc(100% - 50px)', width: '100%', overflowX: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.क्रमांक}
          rowCount={rowCount}
          loading={loading}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          filterMode="server"
          onFilterModelChange={handleFilterModelChange}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          slots={{
            toolbar: CustomGridToolbar,
            loadingOverlay: CustomLoadingOverlay,
          }}
          slotProps={{
            toolbar: {
              searchText: searchText,
              onFilterChange: onFilterTextChange,
              showAlert: showAlert,
            } as CustomToolbarProps,
          }}
          sx={{
            // minWidth: '1200px',
            boxShadow: 3, // Soft shadow for better depth
            backgroundColor: '#fafafa', // Light background
            position: 'relative', // Important for pagination positioning
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#1976d2', // Primary color header
              color: 'black',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              whiteSpace: 'nowrap',
            },
            '& .MuiDataGrid-cell': {
              whiteSpace: 'nowrap',
            },
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: '#b3bfcc30', // Light gray for striped effect
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#b3bfcc0d', // Light blue hover effect
              transition: 'background-color 0.3s ease',
            },
            // Pagination positioning
            '& .MuiDataGrid-footerContainer': {
              position: 'sticky',
              bottom: 0,
              right: 0,
              width: '100%',
              backgroundColor: '#fafafa',
              borderTop: '1px solid rgba(224, 224, 224, 1)',
              display: 'flex',
              justifyContent: 'flex-end',
              zIndex: 2,
            },
            '& .MuiTablePagination-root': {
              overflow: 'visible',
              marginLeft: 'auto',
            },
            '& .MuiTablePagination-actions': {
              flexShrink: 0,
              marginLeft: '8px',
            },
            // Hide labels on small screens to save space
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              display: {
                xs: 'none',
                sm: 'block'
              }
            },
            '@media (max-width: 600px)': {
              '& .MuiDataGrid-footerContainer': {
                padding: '8px 0',
              },
              '& .MuiTablePagination-toolbar': {
                padding: '0 8px'
              },
              '& .MuiTablePagination-select': {
                marginRight: 0,
                marginLeft: 0
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
});

export default CertificateDataGrid;