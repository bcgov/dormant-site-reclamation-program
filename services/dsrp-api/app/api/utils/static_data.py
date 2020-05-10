from flask import current_app
from sqlalchemy.inspection import inspect
from sqlalchemy.dialects.postgresql import UUID

from app.api.constants import STATIC_DATA
""" 
This function is run right before setup_marshmallow and it looks through all of tables in our database.
It creates a mapping of classes to lists if their PK's, this is only done for code tables. To find the code tables
the classes are inspected and if they have a column named active, it's type is not a UUID and its type is a string
the PK's are added to STATIC_DATA under the class name.

Parameters: Base <SQL Alchemy Model>
Return: None
"""


def setup_static_data(Base):
    for class_ in Base._decl_class_registry.values():
        if hasattr(class_, "__tablename__") or getattr(class_, "__create_schema__", False):
            try:
                mapper = inspect(class_)
                pk = mapper.primary_key[0]
                for col in mapper.columns:
                    if col.name == 'active':
                        if type(pk.type) != UUID and pk.type.python_type == str:
                            STATIC_DATA[class_.__name__] = [
                                a for a, in class_.query.with_entities(
                                    getattr(class_, pk.name, None)).filter_by(
                                        active=True).all()
                            ]

            except Exception as e:
                raise e
            
    current_app.logger.debug(STATIC_DATA)
