// types.ts

export type FormState = {
  pramanpatra_id: number | null;
  issue_dt: Date | null;
  prakalp_grast_nav: string;
  prakalpa_nav: string;
  Prakalpa_id: number | null; // New field for project ID

  grast_gav: string;
  grast_taluka: string;
  grast_jilha: string;
  familymembers: {
    name: string;
    relation: string;
    pramanpatradharak: boolean;
  }[];
  grast_pin_code: string;

  shet_jamin_gav?: string;
  shet_jamin_taluka?: string;
  shet_jamin_jilha?: string;

  shet_jamin_pin_code?: string;
  shet_jamin_serve_gut?: string;
  shet_jamin_shetra?: string;
  budit_malmata_gav?: string;
  budit_malmata_taluka?: string;
  budit_malmata_jilha?: string;
  budit_malmata_pin_code?: string;
  budit_malmata_ghar_number?: string;
  budit_malmata_shetra?: string;
  hastantaran_reason?: string;
  updated_by: string | null;
};

// Interface for project data
export interface Project {
  Prakalpa_id: number;
  prakalpa_nav: string;
}

// File metadata interface for uploaded documents
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  documentType: string;
}

// Certificate holder interface for applications
export interface CertificateHolder {
  id: string;
  fullName: {
    firstName: string;
    middleName: string;
    lastName: string;
  };
  relationToPAP: string; // Relation to Project Affected Person
  relationToApplicant: string; // Relation to Applicant
  certificatePurpose: 'शिक्षण' | 'नौकरी' | ''; // Education or Job
  isCertificateHolder: boolean;
}

// Apply Certificate Form State interface
export interface ApplyCertificateFormState {
  // Applicant Information (अर्जदाराची माहिती)
  applicant: {
    firstName: string;
    middleName: string;
    lastName: string;
    village: string;
    taluka: string;
    district: string;
    mobileNumber: string;
  };

  // Project Affected Person Information (प्रकल्पग्रस्ताची माहिती)
  projectAffectedPerson: {
    name: string;
    projectId: number | null;
    projectName: string;
    projectPurpose: 'कालवा' | 'बुडीत भाग' | ''; // Canal or Submerged Areas
    aadhaarId: string; // आधार कार्ड क्रमांक
    farmerId: string; // शेतकरी आयडी
  };

  // Certificate Holders Information (प्रमाणपत्र धारकाची माहिती)
  certificateHolders: CertificateHolder[];

  // Affected Land Information (बाधित जमिनीची माहिती)
  affectedLand: {
    village: string;
    taluka: string;
    district: string;
    surveyGroupNumber: string;
    areaInHectares: string;
    houseNumber: string;
    areaInSquareMeters: string;
  };

  // Document uploads (for edit mode and display)
  documents: {
    [key: string]: FileMetadata | null;
  };

  // Selected files for new applications (stored in component state)
  selectedFiles?: {
    [key in DocumentType]?: File | null;
  };

  // Form metadata
  submittedBy: string | null;
  submittedAt: Date | null;
  applicationId: string | null;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
}

// Document types enum for file uploads
export enum DocumentType {
  EXECUTIVE_ENGINEER_CERTIFICATE = 'executiveEngineerCertificate',
  LAND_ACQUISITION_NOTICE = 'landAcquisitionNotice',
  LAND_ACQUISITION_OFFICER_CERTIFICATE = 'landAcquisitionOfficerCertificate',
  VILLAGE_FORM_7_12_8A = 'villageForm7128A',
  RATION_CARD_COPY = 'rationCardCopy',
  AADHAR_CARD_COPY = 'aadharCardCopy',
  PAN_CARD_COPY = 'panCardCopy',
  VOTER_ID_COPY = 'voterIdCopy',
  INCOME_CERTIFICATE = 'incomeCertificate',
  CASTE_CERTIFICATE = 'casteCertificate',
  DOMICILE_CERTIFICATE = 'domicileCertificate',
  LAND_DOCUMENTS = 'landDocuments',
  BANK_PASSBOOK = 'bankPassbook',
  PASSPORT_PHOTO = 'passportPhoto',
  DEATH_CERTIFICATE_HEIR_DOCUMENTS = 'deathCertificateHeirDocuments',
  OTHER_AFFECTED_CONSENT = 'otherAffectedConsent',
  PROJECT_AFFECTED_AFFIDAVIT = 'projectAffectedAffidavit',
  NOMINEE_TC = 'nomineeTC'
}

// File field names mapping for the new all-or-nothing API
export const FILE_FIELD_NAMES = {
  [DocumentType.AADHAR_CARD_COPY]: 'aadharCardCopy',
  [DocumentType.PAN_CARD_COPY]: 'panCardCopy',
  [DocumentType.VOTER_ID_COPY]: 'voterIdCopy',
  [DocumentType.RATION_CARD_COPY]: 'rationCardCopy',
  [DocumentType.INCOME_CERTIFICATE]: 'incomeCertificate',
  [DocumentType.CASTE_CERTIFICATE]: 'casteCertificate',
  [DocumentType.DOMICILE_CERTIFICATE]: 'domicileCertificate',
  [DocumentType.LAND_DOCUMENTS]: 'landDocuments',
  [DocumentType.BANK_PASSBOOK]: 'bankPassbook',
  [DocumentType.PASSPORT_PHOTO]: 'passportPhoto',
  [DocumentType.EXECUTIVE_ENGINEER_CERTIFICATE]: 'executiveEngineerCertificate',
  [DocumentType.LAND_ACQUISITION_NOTICE]: 'landAcquisitionNotice',
  [DocumentType.LAND_ACQUISITION_OFFICER_CERTIFICATE]: 'landAcquisitionOfficerCertificate',
  [DocumentType.VILLAGE_FORM_7_12_8A]: 'villageForm7128A',
  [DocumentType.DEATH_CERTIFICATE_HEIR_DOCUMENTS]: 'deathCertificateHeirDocuments',
  [DocumentType.OTHER_AFFECTED_CONSENT]: 'otherAffectedConsent',
  [DocumentType.PROJECT_AFFECTED_AFFIDAVIT]: 'projectAffectedAffidavit',
  [DocumentType.NOMINEE_TC]: 'nomineeTC'
} as const;

// Document information interface
export interface DocumentInfo {
  id: DocumentType;
  name: string;
  required: boolean;
  acceptedTypes: string[];
  maxSize: number; // in MB
}

// Document configuration
export const DOCUMENT_CONFIG: DocumentInfo[] = [
  {
    id: DocumentType.AADHAR_CARD_COPY,
    name: 'आधारकार्डची झेरॉक्स',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.PAN_CARD_COPY,
    name: 'पॅन कार्डची झेरॉक्स',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.VOTER_ID_COPY,
    name: 'मतदार ओळखपत्राची झेरॉक्स',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.RATION_CARD_COPY,
    name: 'रेशनकार्डची झेरॉक्स',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.INCOME_CERTIFICATE,
    name: 'उत्पन्न प्रमाणपत्र',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.CASTE_CERTIFICATE,
    name: 'जाती प्रमाणपत्र',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.DOMICILE_CERTIFICATE,
    name: 'निवास प्रमाणपत्र',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.LAND_DOCUMENTS,
    name: 'जमीन संबंधित कागदपत्रे',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.BANK_PASSBOOK,
    name: 'बँक पासबुक',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.PASSPORT_PHOTO,
    name: 'पासपोर्ट साइज फोटो',
    required: false,
    acceptedTypes: ['.jpg', '.jpeg', '.png'],
    maxSize: 5
  },
  {
    id: DocumentType.EXECUTIVE_ENGINEER_CERTIFICATE,
    name: 'कार्यकारी अभियंता यांचे प्रमाणपत्र',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.LAND_ACQUISITION_NOTICE,
    name: 'भूसंपादनाची नोटीस',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.LAND_ACQUISITION_OFFICER_CERTIFICATE,
    name: 'भुसंपादन अधिकारी यांचे प्रमाणपत्र',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.VILLAGE_FORM_7_12_8A,
    name: 'शेत संपादित झाले असल्यास गाव नमुना ७/१२ व ८-अ किंवा घर संपादित झाले असल्यास ग्रा.पं. नमुना ८',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.DEATH_CERTIFICATE_HEIR_DOCUMENTS,
    name: 'मूळ बाधित मय्यत आल्यास मृत्यू दाखला, वारस दाखला व सर्व वारसांचे संमतीलेख',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.OTHER_AFFECTED_CONSENT,
    name: 'सामाईक बाधित असल्यास त्यांचे संमतीलेख',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.PROJECT_AFFECTED_AFFIDAVIT,
    name: 'प्रकल्पबाधिताचे प्रतिज्ञापत्र',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  },
  {
    id: DocumentType.NOMINEE_TC,
    name: 'नामनिर्देशिताचे T.C',
    required: false,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSize: 5
  }
];

// Allowed file types for security
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Blocked file types for security
export const BLOCKED_FILE_EXTENSIONS = [
  '.js', '.ts', '.c', '.cpp', '.exe', '.bat', '.cmd', '.com', '.scr',
  '.vbs', '.vb', '.ps1', '.sh', '.jar', '.app', '.deb', '.rpm', '.dmg'
];

// Application Status Update for Dashboard
export interface ApplicationStatusUpdate {
  id: string;
  applicationId: string;
  applicationType: string; // e.g., "आय प्रमाणपत्र", "निवास प्रमाणपत्र", "जाती प्रमाणपत्र"
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  statusMessage: string; // e.g., "अर्ज मंजूर झाला आहे", "अर्ज प्रलंबित आहे"
  updatedAt: string;
  createdAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  color: string; // Material-UI color for status icon
  priority: number; // For sorting (1 = highest priority)
}