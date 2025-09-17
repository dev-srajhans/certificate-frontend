import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
    Button,
    Stack,
    Typography,
    Alert
} from '@mui/material';
import {
    Download
} from '@mui/icons-material';
import ActionButtons from './ActionButtons';
import ConfirmationDialog from './ConfirmationDialog';
import {
    Certificate,
    CertificateResponse,
    fetchCertificateData,
    fetchCertificatesForExport,
    fetchCertificateApplicationDetails
} from '../api/certificateApi';

// Define a custom type for our toolbar props
interface CustomToolbarProps extends GridToolbarProps {
    searchText?: string;
    onFilterChange?: (value: string) => void;
    showAlert?: (title: string, message: string) => void;
}

// Custom toolbar component for cancelled certificates
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

            // Call the server-side export with cancelled status filter
            const exportData = await fetchCertificatesForExport(
                { ...filterModel, items: [...filterModel.items, { field: 'status', operator: 'equals', value: 'cancelled' }] },
                sortModel,
                searchValue
            );

            // Process the data from the server
            if (exportData && exportData.data && exportData.data.length > 0) {
                // Prepare CSV content
                const headers = Object.keys(exportData.data[0])
                    .filter(key => key !== 'प्रमाणपत्र_क्रमांक' && key !== 'क्रमांक')
                    .map(key => key.replace(/_/g, ' ').toUpperCase());

                // Create CSV content
                let csvContent = headers.join(',') + '\n';

                // Add data rows
                exportData.data.forEach(row => {
                    const values = Object.entries(row)
                        .filter(([key]) => key !== 'प्रमाणपत्र_क्रमांक' && key !== 'क्रमांक')
                        .map(([, value]) => {
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
                link.setAttribute('download', `cancelled_certificates_export_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                if (showAlert) {
                    showAlert("सूचना", 'No cancelled certificates to export');
                } else {
                    alert('No cancelled certificates to export');
                }
            }
        } catch (error) {
            console.error('Failed to export data:', error);
            if (showAlert) {
                showAlert("त्रुटी", 'Failed to export data. Please try again.');
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
                        {exporting ? 'Exporting...' : 'Export Cancelled Certificates'}
                    </Button>
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

export default React.memo(function CancelledCertificatesDataGrid() {
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
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [{ field: 'status', operator: 'equals', value: 'cancelled' }]
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);

    // State for alert dialog
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    // Removed selectedRow as it's not used in cancelled certificates view

    // Create refs for debouncing
    const searchTimeoutRef = useRef<number | null>(null);
    const fetchDataRef = useRef<() => Promise<CertificateResponse>>(() => Promise.resolve({ data: [], total: 0 }));

    const handleViewClick = useCallback(async (applicationId: string | number) => {
        setLoading(true);
        try {
            const response = await fetchCertificateApplicationDetails(applicationId);
            if (response.success && response.data) {
                // For cancelled certificates, we only allow viewing, not editing
                setAlertTitle("सूचना");
                setAlertMessage("This certificate has been cancelled and cannot be modified.");
                setAlertOpen(true);
            } else {
                throw new Error('Failed to fetch certificate data');
            }
        } catch (error) {
            console.error('Error fetching certificate data:', error);
            setAlertTitle("त्रुटी");
            setAlertMessage('Failed to fetch certificate data. Please try again.');
            setAlertOpen(true);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    // Function to show custom alert dialog
    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertOpen(true);
    };

    // Define columns for cancelled certificates
    useEffect(() => {
        const cancelledColumns: GridColDef[] = [
            {
                field: 'क्रमांक',
                headerName: 'क्रमांक',
                width: 100,
                sortable: false,
            },
            {
                field: 'प्रमाणपत्र_क्रमांक',
                headerName: 'प्रमाणपत्र क्रमांक',
                width: 200,
                sortable: false,
            },
            {
                field: 'नाव',
                headerName: 'नाव',
                width: 200,
                sortable: false,
            },
            {
                field: 'पत्ता',
                headerName: 'पत्ता',
                width: 300,
                sortable: false,
            },
            {
                field: 'रद्द_कारण',
                headerName: 'रद्द कारण',
                width: 200,
                sortable: false,
            },
            {
                field: 'रद्द_तारीख',
                headerName: 'रद्द तारीख',
                width: 150,
                sortable: false,
            },
            {
                field: 'actions',
                headerName: 'कृती',
                width: 120,
                sortable: false,
                renderCell: (params) => (
                    <ActionButtons
                        applicationId={params.row.applicationId || params.row.id}
                        fetchData={() => { }} // No need to refresh for cancelled certificates
                        onEditCertificate={() => handleViewClick(params.row.applicationId || params.row.id)}
                        status="cancelled"
                    />
                ),
            },
        ];

        setColumns(cancelledColumns);
    }, [handleViewClick]);

    // Fetch data function
    const fetchData = useCallback(async (): Promise<CertificateResponse> => {
        try {
            const response = await fetchCertificateData(
                {
                    page: paginationModel.page,
                    pageSize: paginationModel.pageSize,
                    searchText: searchText,
                    filterModel: filterModel,
                    sortModel: sortModel,
                    exportMode: false,
                    status: [5]
                }
            );
            return response;
        } catch (error) {
            console.error('Error fetching data:', error);
            return { data: [], total: 0 };
        }
    }, [paginationModel.page, paginationModel.pageSize, searchText, filterModel, sortModel]);

    // Update fetchDataRef
    useEffect(() => {
        fetchDataRef.current = fetchData;
    }, [fetchData]);

    // Single effect to load data when relevant state changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await fetchDataRef.current();
                setRows(response.data);
                setRowCount(response.total);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [fetchData]);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = window.setTimeout(() => {
            setPaginationModel(prev => ({ ...prev, page: 0 }));
        }, 500);
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchText]);

    const handleFilterModelChange = (newModel: GridFilterModel) => {
        setFilterModel(newModel);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const handleSortModelChange = (newModel: GridSortModel) => {
        setSortModel(newModel);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    // Handle search input changes
    const handleSearchChange = useCallback((value: string) => {
        setSearchText(value);
    }, []);

    // Custom loading overlay
    const CustomLoadingOverlay = () => (
        <GridOverlay>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <LinearProgress sx={{ width: '50%', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                    Loading cancelled certificates...
                </Typography>
            </Box>
        </GridOverlay>
    );

    // Custom no rows overlay
    const CustomNoRowsOverlay = () => (
        <GridOverlay>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                    No cancelled certificates found
                </Typography>
            </Box>
        </GridOverlay>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
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

            <Box sx={{ mb: 2 }}>
                <Alert severity="info" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    This section shows all cancelled certificates. Cancelled certificates cannot be modified.
                </Typography>
            </Box>

            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pagination
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                paginationMode="server"
                rowCount={rowCount}
                pageSizeOptions={[10, 25, 50]}
                filterMode="server"
                filterModel={filterModel}
                onFilterModelChange={handleFilterModelChange}
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={handleSortModelChange}
                disableRowSelectionOnClick
                slots={{
                    toolbar: CustomGridToolbar,
                    loadingOverlay: CustomLoadingOverlay,
                    noRowsOverlay: CustomNoRowsOverlay,
                }}
                slotProps={{
                    toolbar: {
                        searchText: searchText,
                        onFilterChange: handleSearchChange,
                        showAlert: showAlert,
                    } as CustomToolbarProps,
                }}

                sx={{
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #e0e0e0',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        borderBottom: '2px solid #e0e0e0',
                    },
                }}
            />
        </Box>
    );
}); 