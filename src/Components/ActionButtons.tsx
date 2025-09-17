import { IconButton, Menu, MenuItem, Box, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CancelIcon from "@mui/icons-material/Cancel";
import { useState } from "react";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import { prathamPramanpatra } from "../Helpers/PrathamPramanpatra";
import { duyamPramanpatra } from "../Helpers/DuyamPramanpatra";
import { handleError, handleSuccess } from "../utils";
import ConfirmationDialog from "./ConfirmationDialog";
import { fetchCertificateApplicationDetails, updateCertificateApplicationStatus } from "../api/certificateApi";

interface ActionButtonsProps {
  fetchData: () => void;
  applicationId: string | number; // Changed from rowId to applicationId
  onEditCertificate?: (certificateId: string, formId: number) => void; // Edit callback for new form
  status?: string; // Application status
}

const handleCertificateGeneration = async (applicationId: string | number, CertificateType: number) => {
  try {
    // Use the new API to get certificate application details
    const response = await fetchCertificateApplicationDetails(applicationId);

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch certificate application details");
    }

    const certiFicateData = response.data;

    // Transform the new data structure to match the old structure expected by the certificate generators
    const transformedData = {
      // Certificate metadata
      pramanpatra_number: certiFicateData.applicationId || "",
      prakalpa_nav: certiFicateData.projectAffectedPerson.projectName || "",
      issue_dt: new Date().toISOString(),

      // Project affected person details
      prakalp_grast_nav: certiFicateData.projectAffectedPerson.name || "",
      grast_gav: certiFicateData.applicant.village || "",
      grast_taluka: certiFicateData.applicant.taluka || "",
      grast_jilha: certiFicateData.applicant.district || "",

      // Land details (शेत जमीन)
      shet_jamin_gav: certiFicateData.affectedLand.village || "",
      shet_jamin_taluka: certiFicateData.affectedLand.taluka || "",
      shet_jamin_jilha: certiFicateData.affectedLand.district || "",
      shet_jamin_serve_gut: certiFicateData.affectedLand.surveyGroupNumber || "",
      shet_jamin_shetra: certiFicateData.affectedLand.areaInHectares || "",

      // Affected land details (बुडीत मालमत्ता)
      budit_malmata_gav: certiFicateData.affectedLand.village || "",
      budit_malmata_taluka: certiFicateData.affectedLand.taluka || "",
      budit_malmata_jilha: certiFicateData.affectedLand.district || "",
      budit_malmata_ghar_number: certiFicateData.affectedLand.houseNumber || "",
      budit_malmata_shetra: certiFicateData.affectedLand.areaInSquareMeters || "",

      // Family members with certificate holder information
      familymembers: certiFicateData.certificateHolders.map((holder: { fullName: { firstName?: string; middleName?: string; lastName?: string; }; relationToPAP?: string; isCertificateHolder?: boolean; }) => ({
        name: `${holder.fullName.firstName || ""} ${holder.fullName.middleName || ""} ${holder.fullName.lastName || ""}`.trim(),
        relation: holder.relationToPAP || "",
        pramanpatradharak: holder.isCertificateHolder || false
      }))
    };

    let blob;
    let certificate_name;
    const formattedValue = transformedData.prakalp_grast_nav.replace(/\s+/g, "_");

    if (CertificateType == 1) {
      blob = await Packer.toBlob(prathamPramanpatra(transformedData));
      certificate_name = formattedValue + `_प्रथम_प्रमाणपत्र.docx`
    } else if (CertificateType == 2) {
      blob = await Packer.toBlob(duyamPramanpatra(transformedData));
      certificate_name = formattedValue + `_दुय्यम_प्रत_मूळ_प्रमानपत्र_हरीवल्यास.docx`
    }

    if (blob) {
      saveAs(blob, certificate_name);
    } else {
      console.error("Blob is undefined, cannot save the file.");
    }
  } catch (error) {
    console.error("Error generating certificate:", error);
    handleError("प्रमाणपत्र तयार करताना त्रुटी आली आहे");
  }
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ fetchData, applicationId, onEditCertificate, status }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const handleDiscardCertificateClick = async () => {
    try {
      // Use the new API to update status to rejected (status 5)
      const response = await updateCertificateApplicationStatus(applicationId, 5, "प्रमाणपत्र रद्द करण्यात आले");

      if (response.success) {
        handleSuccess('प्रमाणपत्र यशस्वीरित्या रद्द करण्यात आले!');
        fetchData();
      } else {
        throw new Error(response.error || 'Failed to discard certificate');
      }
    } catch (error) {
      handleError('प्रमाणपत्र रद्द करताना काहीतरी चुकले.');
      console.error('Error discarding certificate:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleConfirmDialogOpen = () => {
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmDiscard = () => {
    handleDiscardCertificateClick();
    handleConfirmDialogClose();
  };

  // Check if application is in a final state (approved/rejected)
  const isFinalState = status === 'approved' || status === 'rejected';

  // Get status message
  const getStatusMessage = () => {
    if (status === 'approved') {
      return 'हा अर्ज मंजूर झाला आहे. आता बदल करता येत नाहीत.';
    } else if (status === 'rejected') {
      return 'हा अर्ज नाकारण्यात आला आहे. आता बदल करता येत नाहीत.';
    }
    return '';
  };

  // If in final state, show status badge but still allow menu interaction
  if (isFinalState) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Status Badge */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 80,
          padding: '4px 8px',
          backgroundColor: status === 'approved' ? '#e8f5e8' : '#ffebee',
          borderRadius: 1,
          border: `1px solid ${status === 'approved' ? '#4caf50' : '#f44336'}`
        }}>
          <Typography
            variant="caption"
            sx={{
              color: status === 'approved' ? '#2e7d32' : '#c62828',
              fontSize: '0.7rem',
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            {status === 'approved' ? 'मंजूर' : 'नाकारले'}
          </Typography>
        </Box>

        {/* Action Menu - Always visible but will show notifications */}
        <IconButton onClick={handleMenuOpen} sx={{ color: "#1976d2", "&:hover": { color: "green" } }}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {/* All menu items will show status message when clicked */}
          <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
            handleError(getStatusMessage());
            handleMenuClose();
          }}>
            <EditIcon sx={{ marginRight: 1, color: "#1976d2" }} />
            बदल करा
          </MenuItem>

          <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
            handleError(getStatusMessage());
            handleMenuClose();
          }}>
            <ContentCopyIcon sx={{ marginRight: 1, color: "#1976d2" }} />
            प्रथम प्रमाणपत्र
          </MenuItem>

          <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
            handleError(getStatusMessage());
            handleMenuClose();
          }}>
            <TransferWithinAStationIcon sx={{ marginRight: 1, color: "#1976d2" }} />
            नाव हस्तांतरण
          </MenuItem>

          <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
            handleError(getStatusMessage());
            handleMenuClose();
          }}>
            <FileCopyIcon sx={{ marginRight: 1, color: "#1976d2" }} />
            दुय्यम प्रतीत नाव हस्तांतरण
          </MenuItem>

          <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
            handleError(getStatusMessage());
            handleMenuClose();
          }}>
            <ReportProblemIcon sx={{ marginRight: 1, color: "#1976d2" }} />
            दुय्यम प्रत मूळ प्रमाणपत्र हरविल्यास
          </MenuItem>

          <MenuItem sx={{ "&:hover": { color: "red" } }} onClick={() => {
            handleError(getStatusMessage());
            handleMenuClose();
          }}>
            <CancelIcon sx={{ marginRight: 1, color: "#f44336" }} />
            रद्द करा
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  return (
    <>
      {/* More actions menu */}
      <IconButton onClick={handleMenuOpen} sx={{ marginRight: 1, color: "#1976d2", "&:hover": { color: "green" } }}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {/* बदल करा  */}
        <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
          if (isFinalState) {
            handleError(getStatusMessage());
          } else if (onEditCertificate) {
            onEditCertificate(String(applicationId), 1);
          }
          handleMenuClose();
        }}>
          <EditIcon sx={{ marginRight: 1, color: "#1976d2" }} />
          बदल करा
        </MenuItem>

        {/* प्रथम प्रमाणपत्र */}
        <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
          if (isFinalState) {
            handleError(getStatusMessage());
          } else {
            handleCertificateGeneration(applicationId, 1);
          }
          handleMenuClose();
        }}>
          <ContentCopyIcon sx={{ marginRight: 1, color: "#1976d2" }} />
          प्रथम प्रमाणपत्र
        </MenuItem>

        {/* नाव हस्तांतरण */}
        <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
          if (isFinalState) {
            handleError(getStatusMessage());
          } else if (onEditCertificate) {
            onEditCertificate(String(applicationId), 2);
          }
          handleMenuClose();
        }}>
          <TransferWithinAStationIcon sx={{ marginRight: 1, color: "#1976d2" }} />
          नाव हस्तांतरण
        </MenuItem>

        {/* दुय्यम प्रतीत नाव हस्तांतरण */}
        <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
          if (isFinalState) {
            handleError(getStatusMessage());
          } else if (onEditCertificate) {
            onEditCertificate(String(applicationId), 3);
          }
          handleMenuClose();
        }}>
          <FileCopyIcon sx={{ marginRight: 1, color: "#1976d2" }} />
          दुय्यम प्रतीत नाव हस्तांतरण
        </MenuItem>

        {/* दुय्यम प्रत मूळ प्रमाणपत्र  हरविल्यास  */}
        <MenuItem sx={{ "&:hover": { color: "green" } }} onClick={() => {
          if (isFinalState) {
            handleError(getStatusMessage());
          } else {
            handleCertificateGeneration(applicationId, 2);
          }
          handleMenuClose();
        }}>
          <ReportProblemIcon sx={{ marginRight: 1, color: "#1976d2" }} />
          दुय्यम प्रत मूळ प्रमाणपत्र  हरविल्यास
        </MenuItem>

        {/* रद्द करा */}
        <MenuItem sx={{ "&:hover": { color: "red" } }} onClick={() => {
          if (isFinalState) {
            handleError(getStatusMessage());
          } else {
            handleConfirmDialogOpen();
          }
        }}>
          <CancelIcon sx={{ marginRight: 1, color: "#f44336" }} />
          रद्द करा
        </MenuItem>
      </Menu>

      {/* Custom Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
        onConfirm={handleConfirmDiscard}
        title="प्रमाणपत्र रद्द करा"
        message="ही कृती प्रमाणपत्र कायमची रद्द करेल. ही कृती पुन्हा पूर्ववत करता येणार नाही. तुम्हाला खात्री आहे का?"
        confirmText="होय, रद्द करा"
        cancelText="नाही"
      />
    </>
  );
};

export default ActionButtons;
