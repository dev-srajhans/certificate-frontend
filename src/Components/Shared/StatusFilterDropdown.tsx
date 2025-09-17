import React from 'react';
import { FormControl, Select, MenuItem, Box, SelectChangeEvent } from '@mui/material';
import { getUserAccessLevel } from '../../utils/decryptUtils';

interface StatusOption {
    id: number;
    label: string;
    color: string;
    requiredAccessLevel?: number[]; // Optional access level requirement
}

interface StatusFilterDropdownProps {
    selectedStatus: number;
    onStatusChange: (status: number) => void;
    showDropdown?: boolean;
}

const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({
    selectedStatus,
    onStatusChange,
    showDropdown = true
}) => {
    // Get user's access level
    const userAccessLevel = getUserAccessLevel();

    // Define all possible status options with access level requirements
    const allStatusOptions: StatusOption[] = [
        {
            id: 0,
            label: 'एकूण अर्ज',
            color: '#2196f3',
            requiredAccessLevel: [1, 2] // Only for admin and clark
        },
        {
            id: 1,
            label: 'प्रतीक्षित अर्ज',
            color: '#e91e63',
            requiredAccessLevel: [1, 2] // Only for admin and clark
        },
        {
            id: 3,
            label: 'प्रक्रियेत अर्ज',
            color: '#ff9800',
            requiredAccessLevel: [1, 2] // Only for admin and clark
        },
        {
            id: 4,
            label: 'मंजूर अर्ज',
            color: '#4caf50',
            requiredAccessLevel: [1, 2] // Only for admin and clark
        },
        {
            id: 5,
            label: 'रद्द केलेले अर्ज',
            color: '#f44336',
            requiredAccessLevel: [1] // Only for admin
        }
    ];

    // Filter status options based on user's access level
    const availableStatusOptions = allStatusOptions.filter(option => {
        // If no access level requirement, show to all
        if (!option.requiredAccessLevel) {
            return true;
        }

        // Check if user has required access level
        return option.requiredAccessLevel.includes(userAccessLevel);
    });

    // If no options available, return null
    if (availableStatusOptions.length === 0) {
        return null;
    }

    const handleStatusChange = (event: SelectChangeEvent<number>) => {
        onStatusChange(event.target.value as number);
    };

    // If dropdown is disabled, return null
    if (!showDropdown) {
        return null;
    }

    return (
        <FormControl sx={{ minWidth: 200 }}>
            <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                displayEmpty
                sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1A5276',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1A5276',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1A5276',
                    }
                }}
            >
                {availableStatusOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: option.color
                                }}
                            />
                            {option.label}
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default StatusFilterDropdown; 