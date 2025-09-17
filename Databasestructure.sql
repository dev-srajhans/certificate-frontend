-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 07, 2025 at 08:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pramanpatra-local`
--

-- --------------------------------------------------------

--
-- Table structure for table `mst_tblaccess_permissions`
--

CREATE TABLE `mst_tblaccess_permissions` (
  `Access_permission_id` int(11) NOT NULL,
  `Access_control_specification` varchar(250) NOT NULL,
  `Created_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Created_by` int(11) NOT NULL DEFAULT 1,
  `Edited_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Edited_by` int(11) NOT NULL DEFAULT 1,
  `Isactive` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mst_tblprakalpa_names`
--

CREATE TABLE `mst_tblprakalpa_names` (
  `Prakalpa_id` int(11) NOT NULL,
  `prakalpa_nav` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Created_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Created_by` int(11) NOT NULL DEFAULT 1,
  `Edited_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Edited_by` int(11) NOT NULL DEFAULT 1,
  `Isactive` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mst_tblpramanpatra`
--

CREATE TABLE `mst_tblpramanpatra` (
  `pramanpatra_id` int(11) NOT NULL,
  `pramanpatra_number` text DEFAULT NULL,
  `issue_dt` date DEFAULT NULL,
  `prakalp_grast_nav` text DEFAULT NULL,
  `pramanpatra_sankhya` int(11) DEFAULT NULL,
  `regeneration_reason` text DEFAULT NULL,
  `created_dt` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_dt` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `isactive` tinyint(1) DEFAULT NULL,
  `grast_gav` text DEFAULT NULL,
  `grast_taluka` text DEFAULT NULL,
  `grast_jilha` text DEFAULT NULL,
  `familymembers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `grast_pin_code` text DEFAULT NULL,
  `shet_jamin_gav` text DEFAULT NULL,
  `shet_jamin_taluka` text DEFAULT NULL,
  `shet_jamin_jilha` text DEFAULT NULL,
  `shet_jamin_pin_code` text DEFAULT NULL,
  `shet_jamin_serve_gut` text DEFAULT NULL,
  `shet_jamin_shetra` text DEFAULT NULL,
  `budit_malmata_gav` text DEFAULT NULL,
  `budit_malmata_taluka` text DEFAULT NULL,
  `budit_malmata_jilha` text DEFAULT NULL,
  `budit_malmata_pin_code` text DEFAULT NULL,
  `budit_malmata_ghar_number` text DEFAULT NULL,
  `budit_malmata_shetra` text DEFAULT NULL,
  `Prakalpa_id` int(11) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `mst_tblpramanpatra_applications`
--

CREATE TABLE `mst_tblpramanpatra_applications` (
  `application_id` int(11) NOT NULL,
  `application_number` text NOT NULL,
  `status` int(11) DEFAULT NULL,
  `created_dt` timestamp NULL DEFAULT current_timestamp(),
  `updated_dt` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `submitted_dt` timestamp NULL DEFAULT NULL,
  `reviewed_dt` timestamp NULL DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `applicant_first_name` varchar(100) NOT NULL,
  `applicant_middle_name` varchar(100) DEFAULT NULL,
  `applicant_last_name` varchar(100) NOT NULL,
  `applicant_village` varchar(100) NOT NULL,
  `applicant_taluka` varchar(100) NOT NULL,
  `applicant_district` varchar(100) NOT NULL,
  `applicant_mobile_number` varchar(15) NOT NULL,
  `pap_name` varchar(200) NOT NULL,
  `pap_aadhaar_id` varchar(14) NOT NULL COMMENT 'pap = Project affected person',
  `pap_famer_id` varchar(15) NOT NULL COMMENT 'pap = Project affected person',
  `Prakalpa_id` int(11) NOT NULL,
  `project_purpose` enum('कालवा','बुडीत भाग') NOT NULL,
  `affected_land_village` varchar(100) NOT NULL,
  `affected_land_taluka` varchar(100) NOT NULL,
  `affected_land_district` varchar(100) NOT NULL,
  `affected_land_survey_group_number` varchar(50) NOT NULL,
  `affected_land_area_hectares` decimal(10,2) DEFAULT NULL,
  `affected_land_house_number` varchar(50) DEFAULT NULL,
  `affected_land_area_square_meters` decimal(10,2) DEFAULT NULL,
  `certificate_holder_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) NOT NULL,
  `isactive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Certificate application main table';

-- --------------------------------------------------------

--
-- Table structure for table `mst_tblpramanpatra_application_documents`
--

CREATE TABLE `mst_tblpramanpatra_application_documents` (
  `document_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `document_type` varchar(200) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `uploaded_dt` timestamp NULL DEFAULT current_timestamp(),
  `uploaded_by` int(11) NOT NULL,
  `isactive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Certificate application documents table';

-- --------------------------------------------------------

--
-- Table structure for table `mst_tblpramanpatra_application_history`
--

CREATE TABLE `mst_tblpramanpatra_application_history` (
  `history_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `changed_by` int(11) NOT NULL,
  `changed_dt` timestamp NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Certificate application status history table';

-- --------------------------------------------------------

--
-- Table structure for table `mst_tblpramanpatra_history`
--

CREATE TABLE `mst_tblpramanpatra_history` (
  `pramanpatra_id` int(11) NOT NULL,
  `pramanpatra_number` text DEFAULT NULL,
  `issue_dt` date DEFAULT NULL,
  `prakalp_grast_nav` text DEFAULT NULL,
  `Prakalpa_id` int(11) DEFAULT NULL,
  `pramanpatra_sankhya` int(11) DEFAULT NULL,
  `regeneration_reason` text DEFAULT NULL,
  `created_dt` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_dt` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `isactive` tinyint(1) DEFAULT NULL,
  `grast_gav` text DEFAULT NULL,
  `grast_taluka` text DEFAULT NULL,
  `grast_jilha` text DEFAULT NULL,
  `familymembers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `grast_pin_code` text DEFAULT NULL,
  `shet_jamin_gav` text DEFAULT NULL,
  `shet_jamin_taluka` text DEFAULT NULL,
  `shet_jamin_jilha` text DEFAULT NULL,
  `shet_jamin_pin_code` text DEFAULT NULL,
  `shet_jamin_serve_gut` text DEFAULT NULL,
  `shet_jamin_shetra` text DEFAULT NULL,
  `budit_malmata_gav` text DEFAULT NULL,
  `budit_malmata_taluka` text DEFAULT NULL,
  `budit_malmata_jilha` text DEFAULT NULL,
  `budit_malmata_pin_code` text DEFAULT NULL,
  `budit_malmata_ghar_number` text DEFAULT NULL,
  `budit_malmata_shetra` text DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `mst_tblusers`
--

CREATE TABLE `mst_tblusers` (
  `User_id` int(11) NOT NULL,
  `First_Name` text DEFAULT NULL,
  `Middle_Name` text DEFAULT NULL,
  `Last_Name` text DEFAULT NULL,
  `User_Email` text DEFAULT NULL,
  `User_phone` varchar(10) NOT NULL,
  `User_Pass` text DEFAULT NULL,
  `Created_dt` date DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `Access_Level` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mst_tbluser_access_level`
--

CREATE TABLE `mst_tbluser_access_level` (
  `Uaccess_level_id` int(11) NOT NULL,
  `Uaccess_level` varchar(25) NOT NULL,
  `Created_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Created_by` int(11) NOT NULL DEFAULT 1,
  `Edited_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Edited_by` int(11) NOT NULL DEFAULT 1,
  `Isactive` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tblaccess_levelcontrol_mapping`
--

CREATE TABLE `tblaccess_levelcontrol_mapping` (
  `Accesslevel_control_mapid` int(11) NOT NULL,
  `Uaccess_level_id` int(11) NOT NULL,
  `Access_control_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `Created_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Created_by` int(11) NOT NULL DEFAULT 1,
  `Edited_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Edited_by` int(11) NOT NULL DEFAULT 1,
  `Isactive` bit(1) NOT NULL DEFAULT b'1'
) ;

-- --------------------------------------------------------

--
-- Table structure for table `tblcustomuseraccess_control_mapping`
--

CREATE TABLE `tblcustomuseraccess_control_mapping` (
  `Customaccess_control_mapid` int(11) NOT NULL,
  `User_id` int(11) NOT NULL,
  `Access_control_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `Created_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Created_by` int(11) NOT NULL DEFAULT 1,
  `Edited_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Edited_by` int(11) NOT NULL DEFAULT 1,
  `Isactive` bit(1) NOT NULL DEFAULT b'1'
) ;

-- --------------------------------------------------------

--
-- Table structure for table `tblpramanpatra_status`
--

CREATE TABLE `tblpramanpatra_status` (
  `status_id` int(11) NOT NULL,
  `status_desc` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Created_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Created_by` int(11) NOT NULL DEFAULT 1,
  `Edited_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Edited_by` int(11) NOT NULL DEFAULT 1,
  `Isactive` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbluser_accesslevel_mapping`
--

CREATE TABLE `tbluser_accesslevel_mapping` (
  `User_accesslevel_mapid` int(11) NOT NULL,
  `User_id` int(11) NOT NULL,
  `Uaccess_level_id` int(11) NOT NULL,
  `Created_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Created_by` int(11) NOT NULL DEFAULT 1,
  `Edited_dt` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Edited_by` int(11) NOT NULL DEFAULT 1,
  `Isactive` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `mst_tblaccess_permissions`
--
ALTER TABLE `mst_tblaccess_permissions`
  ADD PRIMARY KEY (`Access_permission_id`),
  ADD KEY `edited_by` (`Edited_by`),
  ADD KEY `Created_by` (`Created_by`);

--
-- Indexes for table `mst_tblprakalpa_names`
--
ALTER TABLE `mst_tblprakalpa_names`
  ADD PRIMARY KEY (`Prakalpa_id`),
  ADD UNIQUE KEY `uc_prakalpa_name` (`prakalpa_nav`),
  ADD KEY `edited_by` (`Edited_by`),
  ADD KEY `Created_by` (`Created_by`),
  ADD KEY `Prakalpa_id` (`Prakalpa_id`);

--
-- Indexes for table `mst_tblpramanpatra`
--
ALTER TABLE `mst_tblpramanpatra`
  ADD PRIMARY KEY (`pramanpatra_id`);

--
-- Indexes for table `mst_tblpramanpatra_applications`
--
ALTER TABLE `mst_tblpramanpatra_applications`
  ADD PRIMARY KEY (`application_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_created_dt` (`created_dt`),
  ADD KEY `idx_Prakalpa_id` (`Prakalpa_id`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_applications_status_created_dt` (`status`,`created_dt`),
  ADD KEY `idx_applications_prakalpa_status` (`Prakalpa_id`,`status`),
  ADD KEY `status` (`status`),
  ADD KEY `application_number` (`application_number`(768)) USING HASH,
  ADD KEY `uc_application_number` (`application_number`(768)) USING HASH;

--
-- Indexes for table `mst_tblpramanpatra_application_documents`
--
ALTER TABLE `mst_tblpramanpatra_application_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `idx_application_id` (`application_id`),
  ADD KEY `idx_document_type` (`document_type`),
  ADD KEY `idx_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_documents_application_type` (`application_id`,`document_type`);

--
-- Indexes for table `mst_tblpramanpatra_application_history`
--
ALTER TABLE `mst_tblpramanpatra_application_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `idx_application_id` (`application_id`),
  ADD KEY `idx_changed_by` (`changed_by`),
  ADD KEY `idx_changed_dt` (`changed_dt`),
  ADD KEY `idx_history_application_status` (`application_id`,`status`),
  ADD KEY `mst_tblpramanpatra_status_ibfk_3` (`status`);

--
-- Indexes for table `mst_tblpramanpatra_history`
--
ALTER TABLE `mst_tblpramanpatra_history`
  ADD PRIMARY KEY (`pramanpatra_id`),
  ADD KEY `fk_prakalpa_history` (`Prakalpa_id`);

--
-- Indexes for table `mst_tblusers`
--
ALTER TABLE `mst_tblusers`
  ADD PRIMARY KEY (`User_id`);

--
-- Indexes for table `mst_tbluser_access_level`
--
ALTER TABLE `mst_tbluser_access_level`
  ADD PRIMARY KEY (`Uaccess_level_id`),
  ADD KEY `edited_by` (`Edited_by`),
  ADD KEY `Created_by` (`Created_by`);

--
-- Indexes for table `tblaccess_levelcontrol_mapping`
--
ALTER TABLE `tblaccess_levelcontrol_mapping`
  ADD PRIMARY KEY (`Accesslevel_control_mapid`),
  ADD KEY `Uaccess_level_id` (`Uaccess_level_id`),
  ADD KEY `Edited_by` (`Edited_by`),
  ADD KEY `Created_by` (`Created_by`);

--
-- Indexes for table `tblcustomuseraccess_control_mapping`
--
ALTER TABLE `tblcustomuseraccess_control_mapping`
  ADD PRIMARY KEY (`Customaccess_control_mapid`),
  ADD KEY `edited_by` (`Edited_by`),
  ADD KEY `User_id` (`User_id`),
  ADD KEY `Created_by` (`Created_by`);

--
-- Indexes for table `tblpramanpatra_status`
--
ALTER TABLE `tblpramanpatra_status`
  ADD PRIMARY KEY (`status_id`),
  ADD UNIQUE KEY `uc_prakalpa_name` (`status_desc`),
  ADD KEY `edited_by` (`Edited_by`),
  ADD KEY `Created_by` (`Created_by`);

--
-- Indexes for table `tbluser_accesslevel_mapping`
--
ALTER TABLE `tbluser_accesslevel_mapping`
  ADD PRIMARY KEY (`User_accesslevel_mapid`),
  ADD UNIQUE KEY `User_id_Uaccess_level_id` (`User_id`,`Uaccess_level_id`),
  ADD KEY `Uaccess_level_id` (`Uaccess_level_id`),
  ADD KEY `edited_by` (`Edited_by`),
  ADD KEY `User_id` (`User_id`),
  ADD KEY `Created_by` (`Created_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `mst_tblaccess_permissions`
--
ALTER TABLE `mst_tblaccess_permissions`
  MODIFY `Access_permission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mst_tblprakalpa_names`
--
ALTER TABLE `mst_tblprakalpa_names`
  MODIFY `Prakalpa_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mst_tblpramanpatra`
--
ALTER TABLE `mst_tblpramanpatra`
  MODIFY `pramanpatra_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mst_tblpramanpatra_applications`
--
ALTER TABLE `mst_tblpramanpatra_applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mst_tblpramanpatra_application_documents`
--
ALTER TABLE `mst_tblpramanpatra_application_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mst_tblpramanpatra_application_history`
--
ALTER TABLE `mst_tblpramanpatra_application_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mst_tblpramanpatra_history`
--
ALTER TABLE `mst_tblpramanpatra_history`
  MODIFY `pramanpatra_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mst_tblusers`
--
ALTER TABLE `mst_tblusers`
  MODIFY `User_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mst_tbluser_access_level`
--
ALTER TABLE `mst_tbluser_access_level`
  MODIFY `Uaccess_level_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblaccess_levelcontrol_mapping`
--
ALTER TABLE `tblaccess_levelcontrol_mapping`
  MODIFY `Accesslevel_control_mapid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblcustomuseraccess_control_mapping`
--
ALTER TABLE `tblcustomuseraccess_control_mapping`
  MODIFY `Customaccess_control_mapid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblpramanpatra_status`
--
ALTER TABLE `tblpramanpatra_status`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbluser_accesslevel_mapping`
--
ALTER TABLE `tbluser_accesslevel_mapping`
  MODIFY `User_accesslevel_mapid` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `mst_tblaccess_permissions`
--
ALTER TABLE `mst_tblaccess_permissions`
  ADD CONSTRAINT `Mst_tblaccess_permissions_ibfk_3` FOREIGN KEY (`Edited_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `Mst_tblaccess_permissions_ibfk_5` FOREIGN KEY (`Created_by`) REFERENCES `mst_tblusers` (`User_id`);

--
-- Constraints for table `mst_tblprakalpa_names`
--
ALTER TABLE `mst_tblprakalpa_names`
  ADD CONSTRAINT `mst_tblprakalpa_names_ibfk_3` FOREIGN KEY (`Edited_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `mst_tblprakalpa_names_ibfk_5` FOREIGN KEY (`Created_by`) REFERENCES `mst_tblusers` (`User_id`);

--
-- Constraints for table `mst_tblpramanpatra_applications`
--
ALTER TABLE `mst_tblpramanpatra_applications`
  ADD CONSTRAINT `mst_tblpramanpatra_applications_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `mst_tblpramanpatra_applications_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `mst_tblpramanpatra_applications_ibfk_4` FOREIGN KEY (`reviewed_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `mst_tblpramanpatra_applications_ibfk_5` FOREIGN KEY (`Prakalpa_id`) REFERENCES `mst_tblprakalpa_names` (`Prakalpa_id`),
  ADD CONSTRAINT `mst_tblpramanpatra_status_ibfk_4` FOREIGN KEY (`status`) REFERENCES `tblpramanpatra_status` (`status_id`);

--
-- Constraints for table `mst_tblpramanpatra_application_documents`
--
ALTER TABLE `mst_tblpramanpatra_application_documents`
  ADD CONSTRAINT `mst_tblpramanpatra_application_documents_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `mst_tblpramanpatra_applications` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mst_tblpramanpatra_application_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `mst_tblusers` (`User_id`);

--
-- Constraints for table `mst_tblpramanpatra_application_history`
--
ALTER TABLE `mst_tblpramanpatra_application_history`
  ADD CONSTRAINT `mst_tblpramanpatra_application_history_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `mst_tblpramanpatra_applications` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mst_tblpramanpatra_application_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `mst_tblpramanpatra_status_ibfk_3` FOREIGN KEY (`status`) REFERENCES `tblpramanpatra_status` (`status_id`);

--
-- Constraints for table `mst_tbluser_access_level`
--
ALTER TABLE `mst_tbluser_access_level`
  ADD CONSTRAINT `Mst_tbluser_access_level_ibfk_3` FOREIGN KEY (`Edited_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `Mst_tbluser_access_level_ibfk_4` FOREIGN KEY (`Created_by`) REFERENCES `mst_tblusers` (`User_id`);

--
-- Constraints for table `tblaccess_levelcontrol_mapping`
--
ALTER TABLE `tblaccess_levelcontrol_mapping`
  ADD CONSTRAINT `tblaccess_levelcontrol_mapping_ibfk_3` FOREIGN KEY (`Uaccess_level_id`) REFERENCES `mst_tbluser_access_level` (`Uaccess_level_id`),
  ADD CONSTRAINT `tblaccess_levelcontrol_mapping_ibfk_4` FOREIGN KEY (`Edited_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `tblaccess_levelcontrol_mapping_ibfk_5` FOREIGN KEY (`Created_by`) REFERENCES `mst_tblusers` (`User_id`);

--
-- Constraints for table `tblcustomuseraccess_control_mapping`
--
ALTER TABLE `tblcustomuseraccess_control_mapping`
  ADD CONSTRAINT `tblcustomuseraccess_control_mapping_ibfk_5` FOREIGN KEY (`User_id`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `tblcustomuseraccess_control_mapping_ibfk_8` FOREIGN KEY (`Edited_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `tblcustomuseraccess_control_mapping_ibfk_9` FOREIGN KEY (`Created_by`) REFERENCES `mst_tblusers` (`User_id`);

--
-- Constraints for table `tblpramanpatra_status`
--
ALTER TABLE `tblpramanpatra_status`
  ADD CONSTRAINT `tblpramanpatra_status_ibfk_3` FOREIGN KEY (`Edited_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `tblpramanpatra_status_ibfk_5` FOREIGN KEY (`Created_by`) REFERENCES `mst_tblusers` (`User_id`);

--
-- Constraints for table `tbluser_accesslevel_mapping`
--
ALTER TABLE `tbluser_accesslevel_mapping`
  ADD CONSTRAINT `tbluser_accesslevel_mapping_ibfk_11` FOREIGN KEY (`Uaccess_level_id`) REFERENCES `mst_tbluser_access_level` (`Uaccess_level_id`),
  ADD CONSTRAINT `tbluser_accesslevel_mapping_ibfk_12` FOREIGN KEY (`User_id`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `tbluser_accesslevel_mapping_ibfk_13` FOREIGN KEY (`Edited_by`) REFERENCES `mst_tblusers` (`User_id`),
  ADD CONSTRAINT `tbluser_accesslevel_mapping_ibfk_14` FOREIGN KEY (`Created_by`) REFERENCES `mst_tblusers` (`User_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
