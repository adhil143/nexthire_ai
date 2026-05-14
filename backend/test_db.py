import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.db.database import SessionLocal
from app.crud import crud_user
from app.schemas.user import UserCreate

db = SessionLocal()
try:
    user_in = UserCreate(email="testscript@example.com", password="password123")
    user = crud_user.create(db, obj_in=user_in)
    print("User created successfully:", user.id)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
