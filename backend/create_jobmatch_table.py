from app.db.database import engine, Base
from app.db.models import JobMatch

# Create only the new table
Base.metadata.create_all(bind=engine, tables=[JobMatch.__table__])
print("Successfully created job_matches table.")
