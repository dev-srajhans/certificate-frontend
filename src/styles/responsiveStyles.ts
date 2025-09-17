

// Common responsive breakpoints
export const breakpoints = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
};

// Responsive typography
export const responsiveTypography = {
    h1: {
        xs: { fontSize: '1.5rem', fontWeight: 600 },
        sm: { fontSize: '1.75rem', fontWeight: 600 },
        md: { fontSize: '2rem', fontWeight: 600 },
        lg: { fontSize: '2.25rem', fontWeight: 600 },
    },
    h2: {
        xs: { fontSize: '1.25rem', fontWeight: 600 },
        sm: { fontSize: '1.5rem', fontWeight: 600 },
        md: { fontSize: '1.75rem', fontWeight: 600 },
        lg: { fontSize: '2rem', fontWeight: 600 },
    },
    h3: {
        xs: { fontSize: '1.125rem', fontWeight: 600 },
        sm: { fontSize: '1.25rem', fontWeight: 600 },
        md: { fontSize: '1.5rem', fontWeight: 600 },
        lg: { fontSize: '1.75rem', fontWeight: 600 },
    },
    h4: {
        xs: { fontSize: '1rem', fontWeight: 600 },
        sm: { fontSize: '1.125rem', fontWeight: 600 },
        md: { fontSize: '1.25rem', fontWeight: 600 },
        lg: { fontSize: '1.5rem', fontWeight: 600 },
    },
    body1: {
        xs: { fontSize: '0.875rem' },
        sm: { fontSize: '0.875rem' },
        md: { fontSize: '1rem' },
        lg: { fontSize: '1rem' },
    },
    body2: {
        xs: { fontSize: '0.75rem' },
        sm: { fontSize: '0.875rem' },
        md: { fontSize: '0.875rem' },
        lg: { fontSize: '1rem' },
    },
};

// Responsive spacing
export const responsiveSpacing = {
    xs: { px: 2, py: 2 },
    sm: { px: 3, py: 3 },
    md: { px: 4, py: 4 },
    lg: { px: 6, py: 6 },
};

// Responsive grid spacing
export const responsiveGridSpacing = {
    xs: 2,
    sm: 3,
    md: 3,
    lg: 4,
};

// Responsive card styles
export const responsiveCardStyles = {
    xs: {
        borderRadius: 2,
        p: 2,
        '& .MuiCardContent-root': { p: 2 },
    },
    sm: {
        borderRadius: 2,
        p: 2,
        '& .MuiCardContent-root': { p: 2 },
    },
    md: {
        borderRadius: 3,
        p: 3,
        '& .MuiCardContent-root': { p: 3 },
    },
    lg: {
        borderRadius: 3,
        p: 3,
        '& .MuiCardContent-root': { p: 3 },
    },
};

// Responsive button styles
export const responsiveButtonStyles = {
    xs: {
        fontSize: '0.75rem',
        px: 2,
        py: 1,
        minHeight: 36,
    },
    sm: {
        fontSize: '0.875rem',
        px: 3,
        py: 1.5,
        minHeight: 40,
    },
    md: {
        fontSize: '1rem',
        px: 4,
        py: 2,
        minHeight: 44,
    },
    lg: {
        fontSize: '1rem',
        px: 4,
        py: 2,
        minHeight: 48,
    },
};

// Responsive container maxWidth
export const responsiveContainerMaxWidth = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
};

// Responsive header styles
export const responsiveHeaderStyles = {
    xs: {
        padding: '12px 0',
        '& .MuiTypography-h4': {
            fontSize: '1.25rem',
            lineHeight: 1.2,
        },
        '& img': {
            height: 60,
            marginRight: 2,
        },
    },
    sm: {
        padding: '14px 0',
        '& .MuiTypography-h4': {
            fontSize: '1.5rem',
            lineHeight: 1.2,
        },
        '& img': {
            height: 70,
            marginRight: 2.5,
        },
    },
    md: {
        padding: '16px 0',
        '& .MuiTypography-h4': {
            fontSize: '1.75rem',
            lineHeight: 1.2,
        },
        '& img': {
            height: 80,
            marginRight: 3,
        },
    },
    lg: {
        padding: '16px 0',
        '& .MuiTypography-h4': {
            fontSize: '2rem',
            lineHeight: 1.2,
        },
        '& img': {
            height: 90,
            marginRight: 3,
        },
    },
};

// Responsive tab styles
export const responsiveTabStyles = {
    xs: {
        fontSize: '0.75rem',
        minWidth: 120,
        px: 2,
        py: 1,
    },
    sm: {
        fontSize: '0.875rem',
        minWidth: 140,
        px: 3,
        py: 1.5,
    },
    md: {
        fontSize: '1rem',
        minWidth: 160,
        px: 4,
        py: 2,
    },
    lg: {
        fontSize: '1rem',
        minWidth: 180,
        px: 4,
        py: 2,
    },
};

// Responsive dialog styles
export const responsiveDialogStyles = {
    xs: {
        '& .MuiDialog-paper': {
            margin: 16,
            width: 'calc(100% - 32px)',
            maxWidth: 'none',
        },
    },
    sm: {
        '& .MuiDialog-paper': {
            margin: 24,
            width: 'calc(100% - 48px)',
            maxWidth: 600,
        },
    },
    md: {
        '& .MuiDialog-paper': {
            margin: 32,
            width: 'calc(100% - 64px)',
            maxWidth: 800,
        },
    },
    lg: {
        '& .MuiDialog-paper': {
            margin: 48,
            width: 'calc(100% - 96px)',
            maxWidth: 1000,
        },
    },
};

// Responsive chip styles
export const responsiveChipStyles = {
    xs: {
        fontSize: '0.625rem',
        height: 20,
        '& .MuiChip-label': {
            px: 1,
        },
    },
    sm: {
        fontSize: '0.75rem',
        height: 24,
        '& .MuiChip-label': {
            px: 1.5,
        },
    },
    md: {
        fontSize: '0.875rem',
        height: 28,
        '& .MuiChip-label': {
            px: 2,
        },
    },
    lg: {
        fontSize: '0.875rem',
        height: 32,
        '& .MuiChip-label': {
            px: 2,
        },
    },
};

// Responsive avatar styles
export const responsiveAvatarStyles = {
    xs: {
        width: 32,
        height: 32,
        fontSize: '0.875rem',
    },
    sm: {
        width: 36,
        height: 36,
        fontSize: '1rem',
    },
    md: {
        width: 40,
        height: 40,
        fontSize: '1.125rem',
    },
    lg: {
        width: 48,
        height: 48,
        fontSize: '1.25rem',
    },
};

// Responsive menu styles
export const responsiveMenuStyles = {
    xs: {
        '& .MuiPaper-root': {
            minWidth: 200,
            maxWidth: 'calc(100vw - 32px)',
        },
    },
    sm: {
        '& .MuiPaper-root': {
            minWidth: 220,
            maxWidth: 'calc(100vw - 48px)',
        },
    },
    md: {
        '& .MuiPaper-root': {
            minWidth: 240,
            maxWidth: 'calc(100vw - 64px)',
        },
    },
    lg: {
        '& .MuiPaper-root': {
            minWidth: 260,
            maxWidth: 'calc(100vw - 96px)',
        },
    },
};

// Responsive floating action button styles
export const responsiveFabStyles = {
    xs: {
        width: 48,
        height: 48,
        right: 16,
        bottom: 16,
    },
    sm: {
        width: 56,
        height: 56,
        right: 20,
        bottom: 20,
    },
    md: {
        width: 56,
        height: 56,
        right: 24,
        bottom: 24,
    },
    lg: {
        width: 56,
        height: 56,
        right: 32,
        bottom: 32,
    },
}; 