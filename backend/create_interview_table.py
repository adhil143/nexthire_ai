from app.db.database import engine, Base
from app.db.models import Interview

# Create only the new table
Base.metadata.create_all(bind=engine, tables=[Interview.__table__])
print("Successfully created interviews table.")
