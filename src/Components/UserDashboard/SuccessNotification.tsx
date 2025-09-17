import React from 'react';
import ConfirmationDialog from '../ConfirmationDialog';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SuccessNotificationProps {
    open: boolean;
    onClose: () => void;
    message: string;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
    open,
    onClose,
    message
}) => {
    return (
        <ConfirmationDialog
            open={open}
            onClose={onClose}
            onConfirm={onClose}
            title="यशस्वी!"
            message={message}
            confirmText="ठीक आहे"
            showCancelButton={false}
            icon={<CheckCircleIcon />}
            bgColor="#4caf50"
            confirmButtonColor="#4caf50"
        />
    );
};

export default SuccessNotification; 