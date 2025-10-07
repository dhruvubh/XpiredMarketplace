from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

from database import get_db, engine, Base
from models import *
from schemas import *
from services import *
from typing import List

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZeroWaste Exchange API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Dependency to get current user (simplified for MVP)
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # For MVP, we'll use simple token-based auth
    # In production, implement proper JWT validation
    return {"user_id": 1, "role": "admin"}  # Mock user

@app.get("/")
async def root():
    return {"message": "ZeroWaste Exchange API"}

# Product endpoints
@app.get("/products", response_model=List[ProductResponse])
async def get_products(db: Session = Depends(get_db)):
    return get_all_products(db)

@app.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    return create_product_service(db, product)

# Batch endpoints
@app.post("/batches", response_model=BatchResponse)
async def create_batch(batch: BatchCreate, db: Session = Depends(get_db)):
    return create_batch_service(db, batch)

@app.get("/batches", response_model=List[BatchResponse])
async def get_batches(db: Session = Depends(get_db)):
    return get_all_batches(db)

# Offer endpoints
@app.get("/offers", response_model=List[OfferResponse])
async def get_offers(
    user_type: str = "public",
    db: Session = Depends(get_db)
):
    return get_offers_for_user(db, user_type)

@app.post("/offers", response_model=OfferResponse)
async def create_offer(offer: OfferCreate, db: Session = Depends(get_db)):
    return create_offer_service(db, offer)

# Reservation endpoints
@app.post("/reserve", response_model=ReservationResponse)
async def reserve_offer(
    reservation: ReservationCreate,
    db: Session = Depends(get_db)
):
    return create_reservation(db, reservation)

@app.get("/reservations", response_model=List[ReservationResponse])
async def get_reservations(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_user_reservations(db, user_id)

# Pickup endpoints
@app.post("/pickup/confirm", response_model=PickupResponse)
async def confirm_pickup(
    pickup: PickupCreate,
    db: Session = Depends(get_db)
):
    return confirm_pickup_service(db, pickup)

@app.post("/pickup/relist")
async def relist_no_shows(db: Session = Depends(get_db)):
    return handle_no_shows(db)

# Impact endpoints
@app.get("/impact", response_model=ImpactResponse)
async def get_impact_stats(db: Session = Depends(get_db)):
    return get_impact_metrics(db)

# Markdown engine endpoint
@app.post("/markdown/calculate")
async def calculate_markdowns(db: Session = Depends(get_db)):
    return apply_markdown_engine(db)

# CSV Import endpoints
@app.post("/import/products")
async def import_products_csv(csv_data: dict):
    from csv_import import import_products_from_csv
    return import_products_from_csv(csv_data["csv_content"])

@app.post("/import/batches")
async def import_batches_csv(csv_data: dict):
    from csv_import import create_batch_from_csv
    return create_batch_from_csv(csv_data["csv_content"], csv_data.get("store_id", 1))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
