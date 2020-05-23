def section(section_header, section_name, sub_sections):
    return {
        "section_header": section_header,
        "section_name": section_name,
        "sub_sections": sub_sections
    }


def subSection(sub_section_header, amount_fields):
    return {
        "sub_section_header": sub_section_header,
        "amount_fields": amount_fields
    }


def field(name, label):
    return {"name": name, "label": label}


CONTRACTED_WORK = [
    section("Abandonment", "abandonment", [
        subSection("Abandonment Planning and Logistics", [
            field("well_file_review",
                  "Well file review abandonment plan development"),
            field("abandonment_plan", "Abandonment plan submission"),
            field("mob_demob_site",
                  "Mob/Demob to/from site and site preparation"),
            field("camp_lodging",
                  "Camp or lodging accommodations for workers"),
        ]),
        subSection("Well Decommissioning (Downhole Abandonment)", [
            field("permanent_plugging_wellbore",
                  "Permanent plugging of the wellbore"),
        ]),
        subSection("Well Decommissioning (Surface Abandonment)", [
            field("cut_and_cap", "Cut and Cap abandonment"),
        ]),
        subSection("Site Decommissioning", [
            field("removal_of_facilities",
                  "Removal of facilities and other equipment on the site"),
        ]),
    ]),
    section("Preliminary Site Investigation", "preliminary_site_investigation", [
        subSection("Stage 1 PSI", [
            field("historical_well_file",
                  "Historical well file review including interviews"),
            field("site_visit", "Site visit"),
            field("report_writing_submission",
                  "Report writing and submission"),
        ]),
        subSection("Stage 2 PSI", [
            field("psi_review", "PSI review"),
            field("mob_demob_site",
                  "Mob/Demob to/from site and any site preparation"),
            field("camp_lodging",
                  "Camp or lodging accommodations for workers"),
            field("intrusive_sampling",
                  "Intrusive sampling and site investigation"),
            field("submission_of_samples",
                  "Submission of samples to accredited analytical lab"),
            field("completion_of_notifications",
                  "Completion of any and all required notifications"),
            field(
                "analysis_results",
                "Analysis of results, technical report writing, and report submission"
            ),
        ]),
    ]),
    section("Detailed Site Investigation", "detailed_site_investigation", [
        subSection("Site Investigation Planning and Logistics", [
            field("psi_review_dsi_scope",
                  "PSI review and DSI scope development"),
        ]),
        subSection("DSI Fieldwork Execution", [
            field("mob_demob_site",
                  "Mob/Demob to/from site and any site preparation"),
            field("camp_lodging",
                  "Camp or lodging accommodations for workers"),
            field(
                "complete_sampling",
                "Complete sampling and delineation of historic contamination"),
        ]),
        subSection("Technical Assessment, Report Writing, and Submission", [
            field("analysis_lab_results", "Analysis of lab results"),
            field("development_remediation_plan",
                  "Development of a remediation plan"),
            field("technical_report_writing",
                  "Technical report writing and submission"),
        ]),
    ]),
    section("Remediation", "remediation", [
        subSection("Remediation Planning and Logistics", [
            field("mob_demob_site",
                  "Mob/Demob to/from site and any site preparation"),
            field("camp_lodging",
                  "Camp or lodging accommodations for workers"),
        ]),
        subSection("Completion of Physical Remediation", [
            field("excavation", "Excavation"),
            field("contaminated_soil",
                  "Contaminated soil hauling and disposal"),
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
            field("site_closure",
                  "Site closure to either risk-based or numeric standards"),
        ]),
    ]),
    section("Reclamation", "reclamation", [
        subSection("Reclamation Planning and Logistics", [
            field("mob_demob_site",
                  "Mob/Demob to/from site and any site preparation"),
            field("camp_lodging",
                  "Camp or lodging accommodations for workers"),
        ]),
        subSection("Reclamation Fieldwork", [
            field("surface_recontouring", "Surface re-contouring"),
            field("topsoil_replacement",
                  "Topsoil replacement and redistribution"),
            field("revegetation_monitoring", "Re-vegetation and monitoring"),
        ]),
        subSection("Reporting", [
            field("technical_report_writing",
                  "Technical report writing and submission"),
        ]),
    ]),
]


def site_condition(name, label):
    return {"name": name, "label": label}


SITE_CONDITIONS = [
    site_condition("within_1000m_stream", "Within 1,000 metres of a stream"),
    site_condition("within_500m_groundwater_well",
                   "Within 500 metres of a groundwater well"),
    site_condition(
        "within_environmental_protection",
        "Within environmental protection and management area or critical habitat"
    ),
    site_condition("suspected_offsite_contamination",
                   "Suspected or known to have offsite contamination"),
    site_condition(
        "within_1500m_private_residence",
        "Within 1,500 metres of a private residence or community gathering area"
    ),
    site_condition(
        "within_active_area_trapping",
        "Within an area actively used for trapping, guide outfitting, range tenure or hunting"
    ),
    site_condition("on_crown_land_winter_access",
                   "On Crown land that is winter access only"),
    site_condition("drilled_abandonded_prior_1997",
                   "Drilled or abandoned prior to 1997"),
    site_condition(
        "within_treaty_land_entitlement",
        "Within Treaty Land Entitlement, cultural lands and/or Indigenous peoples' critical areas"
    ),
    site_condition("within_sensitive_watersheds",
                   "Within sensitive watersheds that service communities"),
    site_condition("on_or_near_reserve_lands", "On or near reserve lands"),
    site_condition(
        "permit_holider_notice_dormant",
        "Permit holder has provided notice that this site is dormant to achieve cost efficiencies for an area-based closure plan"
    ),
    site_condition("located_agricultural_land_reserve",
                   "Located inside Agricultural Land Reserve"),
    site_condition(
        "permit_holder_work_specified_2020_awp",
        "Specified work that was included in a permit holder's Dormant Sites 2020 Annual Work Plan"
    )
]