import React from 'react';
import { Box, CardContent, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface QuickActionsCardProps {
    onApplyCertificate: () => void;
    onViewAllApplications: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
    onApplyCertificate,
    onViewAllApplications
}) => {
    return (
        <Box sx={{
            position: 'relative',
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
        }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#1A5276' }}>
                    त्वरित कृती
                </Typography>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={onApplyCertificate}
                    sx={{ mb: 2 }}
                    startIcon={<AddIcon />}
                >
                    नवीन प्रमाणपत्र अर्ज करा
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={onViewAllApplications}
                    startIcon={<VisibilityIcon />}
                >
                    सर्व अर्ज पहा
                </Button>
            </CardContent>
        </Box>
    );
};

export default QuickActionsCard; 