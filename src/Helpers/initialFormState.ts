import { FormState } from "../types";

export const initialFormState: FormState = {
    pramanpatra_id: null,
    issue_dt: new Date(),
    prakalp_grast_nav: '',
    prakalpa_nav: '',
    Prakalpa_id: null, // New field for project ID
    grast_gav: '',
    grast_taluka: '',
    grast_jilha: '',
    familymembers: [
        { name: "", relation: "", pramanpatradharak: false }
    ],
    grast_pin_code: '',
    shet_jamin_gav: '',
    shet_jamin_taluka: '',
    shet_jamin_jilha: '',
    shet_jamin_pin_code: '',
    shet_jamin_serve_gut: '',
    shet_jamin_shetra: '',
    budit_malmata_gav: '',
    budit_malmata_taluka: '',
    budit_malmata_jilha: '',
    budit_malmata_pin_code: '',
    budit_malmata_ghar_number: '',
    budit_malmata_shetra: '',
    hastantaran_reason: '',
    updated_by: sessionStorage.getItem("User_id"),
};

// Initial form state for certificate applications
import { ApplyCertificateFormState, DocumentType } from "../types";

export const initialCertificateApplicationState: ApplyCertificateFormState = {
    applicant: {
        firstName: "",
        middleName: "",
        lastName: "",
        village: "",
        taluka: "",
        district: "",
        mobileNumber: ""
    },
    projectAffectedPerson: {
        name: "",
        projectId: null,
        projectName: "",
        projectPurpose: "",
        aadhaarId: "",
        farmerId: ""
    },
    certificateHolders: [],
    affectedLand: {
        village: "",
        taluka: "",
        district: "",
        surveyGroupNumber: "",
        areaInHectares: "",
        houseNumber: "",
        areaInSquareMeters: ""
    },
    documents: {
        [DocumentType.AADHAR_CARD_COPY]: null,
        [DocumentType.PAN_CARD_COPY]: null,
        [DocumentType.VOTER_ID_COPY]: null,
        [DocumentType.RATION_CARD_COPY]: null,
        [DocumentType.INCOME_CERTIFICATE]: null,
        [DocumentType.CASTE_CERTIFICATE]: null,
        [DocumentType.DOMICILE_CERTIFICATE]: null,
        [DocumentType.LAND_DOCUMENTS]: null,
        [DocumentType.BANK_PASSBOOK]: null,
        [DocumentType.PASSPORT_PHOTO]: null,
        [DocumentType.EXECUTIVE_ENGINEER_CERTIFICATE]: null,
        [DocumentType.LAND_ACQUISITION_NOTICE]: null,
        [DocumentType.LAND_ACQUISITION_OFFICER_CERTIFICATE]: null,
        [DocumentType.VILLAGE_FORM_7_12_8A]: null,
        [DocumentType.DEATH_CERTIFICATE_HEIR_DOCUMENTS]: null,
        [DocumentType.OTHER_AFFECTED_CONSENT]: null,
        [DocumentType.PROJECT_AFFECTED_AFFIDAVIT]: null,
        [DocumentType.NOMINEE_TC]: null
    },
    submittedBy: sessionStorage.getItem("User_id"),
    submittedAt: null,
    applicationId: null,
    status: "draft"
};