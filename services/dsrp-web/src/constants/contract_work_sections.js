const section = (sectionHeader, formSectionName, subSections) => ({
  sectionHeader,
  formSectionName,
  subSections,
});

const subSection = (subSectionHeader, amountFields) => ({
  subSectionHeader,
  amountFields,
});

const field = (fieldName, fieldLabel) => ({
  fieldName,
  fieldLabel,
});

export const CONTRACT_WORK_SECTIONS = [
  section("Abandonment", "abandonment", [
    subSection("Abandonment Planning and Logistics", [
      field("well_file_review", "Well file review abandonment plan development"),
      field("abandonment_plan", "Abandonment plan submission"),
      field("mob_demob_site", "Mob/Demob to/from site and site preparation"),
      field("camp_lodging", "Camp or lodging accommodations for workers"),
    ]),
    subSection("Well Decommissioning (Downhole Abandonment)", [
      field("permanent_plugging_wellbore", "Permanent plugging of the wellbore"),
    ]),
    subSection("Well Decommissioning (Surface Abandonment)", [
      field("cut_and_cap", "Cut and Cap abandonment"),
    ]),
    subSection("Site Decommissioning", [
      field("removal_of_facilities", "Removal of facilities and other equipment on the site"),
    ]),
  ]),
  section("Preliminary Site Investigation", "preliminary_site_investigation", [
    subSection("Stage 1 PSI", [
      field("historical_well_file", "Historical well file review including interviews"),
      field("site_visit", "Site visit"),
      field("report_writing_submission", "Report writing and submission"),
    ]),
    subSection("Stage 2 PSI", [
      field("psi_review", "PSI review"),
      field("mob_demob_site", "Mob/Demob to/from site and any site preparation"),
      field("camp_lodging", "Camp or lodging accommodations for workers"),
      field("intrusive_sampling", "Intrusive sampling and site investigation"),
      field("submission_of_samples", "Submission of samples to accredited analytical lab"),
      field("completion_of_notifications", "Completion of any and all required notifications"),
      field(
        "analysis_results",
        "Analysis of results, technical report writing, and report submission"
      ),
    ]),
  ]),
  section("Detailed Site Investigation", "detailed_site_investigation", [
    subSection("Site Investigation Planning and Logistics", [
      field("psi_review_dsi_scope", "PSI review and DSI scope development"),
    ]),
    subSection("DSI Fieldwork Execution", [
      field("mob_demob_site", "Mob/Demob to/from site and any site preparation"),
      field("camp_lodging", "Camp or lodging accommodations for workers"),
      field("complete_sampling", "Complete sampling and delineation of historic contamination"),
    ]),
    subSection("Technical Assessment, Report Writing, and Submission", [
      field("analysis_lab_results", "Analysis of lab results"),
      field("development_remediation_plan", "Development of a remediation plan"),
      field("technical_report_writing", "Technical report writing and submission"),
    ]),
  ]),
  section("Remediation", "remediation", [
    subSection("Remediation Planning and Logistics", [
      field("mob_demob_site", "Mob/Demob to/from site and any site preparation"),
      field("camp_lodging", "Camp or lodging accommodations for workers"),
    ]),
    subSection("Completion of Physical Remediation", [
      field("excavation", "Excavation"),
      field("contaminated_soil", "Contaminated soil hauling and disposal"),
      field("confirmatory_sampling", "Confirmatory sampling"),
      field("backfilling_excavation", "Backfilling of excavation"),
    ]),
    subSection("Completion of Risk Assessment", [
      field(
        "risk_assessment",
        "Risk assessment activities, technical report writing, and submission"
      ),
    ]),
    subSection("Technical Report Writing and Submission", [
      field("site_closure", "Site closure to either risk-based or numeric standards"),
    ]),
  ]),
  section("Reclamation", "reclamation", [
    subSection("Reclamation Planning and Logistics", [
      field("mob_demob_site", "Mob/Demob to/from site and any site preparation"),
      field("camp_lodging", "Camp or lodging accommodations for workers"),
    ]),
    subSection("Reclamation Fieldwork", [
      field("surface_recontouring", "Surface re-contouring"),
      field("topsoil_replacement", "Topsoil replacement and redistribution"),
      field("revegetation_monitoring", "Re-vegetation and monitoring"),
    ]),
    subSection("Reporting", [
      field("technical_report_writing", "Technical report writing and submission"),
    ]),
  ]),
];

export default CONTRACT_WORK_SECTIONS;
