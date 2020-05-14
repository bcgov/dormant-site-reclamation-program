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
      field("amount_0", "Well file review abandonment plan development"),
      field("amount_1", "Abandonment plan submission"),
      field("amount_2", "Mob/Demob to/from site and site preparation"),
      field("amount_3", "Camp or lodging accommodations for workers"),
    ]),
    subSection("Well Decommissioning (Downhole Abandonment)", [
      field("amount_4", "Permanent plugging of the wellbore"),
    ]),
    subSection("Well Decommissioning (Surface Abandonment)", [
      field("amount_5", "Cut and Cap abandonment"),
    ]),
    subSection("Site Decommissioning", [
      field("amount_6", "Removal of facilities and other equipment on the site"),
    ]),
  ]),
  section("Preliminary Site Investigation", "preliminary_site_investigation", [
    subSection("Stage 1 PSI", [
      field("amount_0", "Historical well file review including interviews"),
      field("amount_1", "Site visit"),
      field("amount_2", "Report writing and submission"),
    ]),
    subSection("Stage 2 PSI", [
      field("amount_3", "PSI review"),
      field("amount_4", "Mob/Demob to/from site and any site preparation"),
      field("amount_5", "Camp or lodging accommodations for workers"),
      field("amount_6", "Intrusive sampling and site investigation"),
      field("amount_7", "Submission of samples to accredited analytical lab"),
      field("amount_8", "Completion of any and all required notifications"),
      field("amount_9", "Analysis of results, technical report writing, and report submission"),
    ]),
  ]),
  section("Detailed Site Investigation", "detailed_site_investigation", [
    subSection("Site Investigation Planning and Logistics", [
      field("amount_0", "PSI review and DSI scope development"),
    ]),
    subSection("DSI Fieldwork Execution", [
      field("amount_1", "Mob/Demob to/from site and any site preparation"),
      field("amount_2", "Camp or lodging accommodations for workers"),
      field("amount_3", "Complete sampling and delineation of historic contamination"),
    ]),
    subSection("Technical Assessment, Report Writing, and Submission", [
      field("amount_4", "Analysis of lab results"),
      field("amount_5", "Development of a remediation plan"),
      field("amount_6", "Technical report writing and submission"),
    ]),
  ]),
  section("Remediation", "remediation", [
    subSection("Remediation Planning and Logistics", [
      field("amount_0", "Mob/Demob to/from site and any site preparation"),
      field("amount_1", "Camp or lodging accommodations for workers"),
    ]),
    subSection("Completion of Physical Remediation", [
      field("amount_2", "Excavation"),
      field("amount_3", "Contaminated soil hauling and disposal"),
      field("amount_4", "Confirmatory sampling"),
      field("amount_5", "Backfilling of excavation"),
    ]),
    subSection("Completion of Risk Assessment", [
      field("amount_6", "Risk assessment activities, technical report writing, and submission"),
    ]),
    subSection("Technical Report Writing and Submission", [
      field("amount_7", "Site closure to either risk-based or numeric standards"),
    ]),
  ]),
  section("Reclamation", "reclamation", [
    subSection("Reclamation Planning and Logistics", [
      field("amount_0", "Contractor and sub-contractor procurement and scheduling"),
      field("amount_1", "Mob/Demob to/from site and any site preparation"),
      field("amount_2", "Camp or lodging accommodations for workers"),
    ]),
    subSection("Reclamation Fieldwork", [
      field("amount_3", "Surface re-contouring"),
      field("amount_4", "Topsoil replacement and redistribution"),
      field("amount_5", "Re-vegetation and monitoring"),
    ]),
    subSection("Reporting", [field("amount_6", "Technical report writing and submission")]),
  ]),
];

export default CONTRACT_WORK_SECTIONS;
