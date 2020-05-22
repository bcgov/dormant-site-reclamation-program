const condition = (fieldName, fieldLabel) => ({
  fieldName,
  fieldLabel,
});

export const SITE_CONDITIONS = [
  condition("within_1000m_stream", "Within 1,000 metres of a stream"),
  condition("within_500m_groundwater_well", "Within 500 metres of a groundwater well"),
  condition(
    "within_environmental_protection",
    "Within environmental protection and management area or critical habitat"
  ),
  condition("suspected_offsite_contamination", "Suspected or known to have offsite contamination"),
  condition(
    "within_1500m_private_residence",
    "Within 1,500 metres of a private residence or community gathering area"
  ),
  condition(
    "within_active_area_trapping",
    "Within an area actively used for trapping, guide outfitting, range tenure or hunting"
  ),
  condition("on_crown_land_winter_access", "On Crown land that is winter access only"),
  condition("drilled_abandonded_prior_1997", "Drilled or abandoned prior to 1997"),
  condition(
    "within_treaty_land_entitlement",
    "Within Treaty Land Entitlement, cultural lands and/or Indigenous peoples' critical areas"
  ),
  condition("within_sensitive_watersheds", "Within sensitive watersheds that service communities"),
  condition("on_or_near_reserve_lands", "On or near reserve lands"),
  condition(
    "permit_holider_notice_dormant",
    "Permit holder has provided notice that this site is dormant to achieve cost efficiencies for an area-based closure plan"
  ),
  condition("located_agricultural_land_reserve", "Located inside Agricultural Land Reserve"),
  condition(
    "permit_holder_work_specified_2020_awp",
    "Specified work that was included in a permit holder's Dormant Sites 2020 Annual Work Plan"
  ),
];

export default SITE_CONDITIONS;
