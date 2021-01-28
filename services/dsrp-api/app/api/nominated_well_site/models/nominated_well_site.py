from app.extensions import db
from app.api.utils.models_mixins import Base


class NominatedWellSite(Base):
    """
    This is a prepopulated list of nominated well sites
    """
    __tablename__ = 'nominated_well_site'

    wa_number = db.Column(db.Integer, primary_key=True)
    operator = db.Column(db.String)
    ba_id = db.Column(db.Integer)
    well_name = db.Column(db.String)
    well_dormant_status = db.Column(db.String)
    current_status = db.Column(db.String)
    well_dormancy_date = db.Column(db.Date)
    site_dormancy_date = db.Column(db.Date)
    site_dormancy_type = db.Column(db.String)
    site_dormant_status = db.Column(db.String)
    surface_location = db.Column(db.String)
    field = db.Column(db.String)
    abandonment_date = db.Column(db.Date)
    last_spud_date = db.Column(db.Date)
    last_rig_rels_date = db.Column(db.Date)
    last_compltn_date = db.Column(db.Date)
    last_active_production_yr = db.Column(db.Date)
    last_active_inj_disp_yr = db.Column(db.Date)
    wellsite_dormancy_declaration_date = db.Column(db.Date)
    is_multi_well = db.Column(db.Boolean)

    @classmethod
    def find_by_wa_number(cls, wa_number):
        return cls.query.filter_by(wa_number=wa_number).one_or_none()

    @classmethod
    def find_by_operator_id(cls, operator_id):
        return cls.query.filter_by(ba_id=operator_id).all()