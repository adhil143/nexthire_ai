from app.db.database import engine, Base
from app.db.models import VoiceInterview

# Create only the new table
Base.metadata.create_all(bind=engine, tables=[VoiceInterview.__table__])
print("Successfully created voice_interviews table.")
