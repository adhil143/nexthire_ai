from app.db.database import engine, Base
from app.db.models import Roadmap

# Create only the new table
Base.metadata.create_all(bind=engine, tables=[Roadmap.__table__])
print("Successfully created roadmaps table.")
