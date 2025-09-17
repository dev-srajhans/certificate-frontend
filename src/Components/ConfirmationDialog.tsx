import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Box
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    showCancelButton?: boolean;
    showInput?: boolean;
    inputValue?: string;
    onInputChange?: (value: string) => void;
    inputLabel?: string;
    inputPlaceholder?: string;
    icon?: React.ReactNode;
    bgColor?: string;
    confirmButtonColor?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "होय",
    cancelText = "नाही",
    showCancelButton = true,
    showInput = false,
    inputValue = "",
    onInputChange,
    inputLabel = "Input",
    inputPlaceholder = "",
    icon = <CancelIcon />,
    bgColor = '#f44336',
    confirmButtonColor = '#f44336'
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                }
            }}
        >
            <DialogTitle sx={{
                bgcolor: bgColor,
                color: 'white',
                textAlign: 'center',
                fontWeight: 600,
                py: 2
            }}>
                {icon}
                {title}
            </DialogTitle>
            <DialogContent sx={{ py: 3, px: 3 }}>
                <Typography
                    variant="body1"
                    sx={{
                        pt: 4,
                        textAlign: 'center',
                        lineHeight: 1.6,
                        fontSize: '1.1rem',
                        color: '#333'
                    }}
                >
                    {message}
                </Typography>
                {showInput && (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            label={inputLabel}
                            placeholder={inputPlaceholder}
                            value={inputValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange?.(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
                {showCancelButton && (
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            color: '#666',
                            borderColor: '#666',
                            '&:hover': {
                                borderColor: '#333',
                                color: '#333',
                                bgcolor: 'rgba(0, 0, 0, 0.05)'
                            },
                            px: 3,
                            py: 1
                        }}
                    >
                        {cancelText}
                    </Button>
                )}
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={{
                        bgcolor: confirmButtonColor,
                        '&:hover': {
                            bgcolor: confirmButtonColor === '#f44336' ? '#e00000' : '#1976d2'
                        },
                        px: 3,
                        py: 1
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog; 