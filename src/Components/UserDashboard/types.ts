export interface Certificate {
    id: string;
    applicationNumber: string;
    type: string;
    status: 'submitted' | 'under_review' | 'partially_verified' | 'approved' | 'rejected';
    appliedDate: string;
    lastUpdated: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    currentStep: string;
    nextStep?: string;
    comments?: string;
    applicantName: string;
    papName: string;
    projectName: string;
    historyComments: Array<{
        notes: string | null;
        changed_dt: string;
        status: string;
    }>;
}

export interface UserData {
    name: string;
    email: string;
    id: string;
} 