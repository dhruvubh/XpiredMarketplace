from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
import random
import string

from models import *
from schemas import *

# Product services
def get_all_products(db: Session):
    return db.query(Product).all()

def create_product_service(db: Session, product: ProductCreate):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# Batch services
def get_all_batches(db: Session):
    return db.query(Batch).all()

def create_batch_service(db: Session, batch: BatchCreate):
    db_batch = Batch(**batch.dict())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

# Offer services
def get_offers_for_user(db: Session, user_type: str):
    now = datetime.utcnow()
    query = db.query(Offer).filter(Offer.end_ts > now)
    
    if user_type == "nonprofit":
        query = query.filter(Offer.audience == "nonprofit")
    else:
        query = query.filter(Offer.audience == "public")
    
    return query.all()

def create_offer_service(db: Session, offer: OfferCreate):
    db_offer = Offer(**offer.dict())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

# Reservation services
def create_reservation(db: Session, reservation: ReservationCreate):
    # Generate confirmation code
    confirmation_code = ''.join(random.choices(string.digits, k=6))
    
    db_reservation = Reservation(
        **reservation.dict(),
        confirmation_code=confirmation_code
    )
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

def get_user_reservations(db: Session, user_id: int):
    return db.query(Reservation).filter(Reservation.user_id == user_id).all()

# Pickup services
def confirm_pickup_service(db: Session, pickup: PickupCreate):
    # Update reservation status
    reservation = db.query(Reservation).filter(Reservation.id == pickup.reservation_id).first()
    if reservation:
        reservation.status = ReservationStatus.PICKED_UP
        
        # Create pickup record
        db_pickup = Pickup(**pickup.dict())
        db.add(db_pickup)
        
        # Update impact metrics
        update_impact_metrics(db, reservation)
        
        db.commit()
        db.refresh(db_pickup)
        return db_pickup
    
    raise HTTPException(status_code=404, detail="Reservation not found")

def handle_no_shows(db: Session):
    now = datetime.utcnow()
    no_show_reservations = db.query(Reservation).filter(
        Reservation.status == ReservationStatus.RESERVED,
        Reservation.pickup_end_ts < now
    ).all()
    
    relisted_count = 0
    for reservation in no_show_reservations:
        reservation.status = ReservationStatus.NO_SHOW
        
        # Create new public offer with increased discount
        offer = db.query(Offer).filter(Offer.id == reservation.offer_id).first()
        if offer:
            new_discount = min(offer.discount_pct + 10, 80)  # Cap at 80%
            new_offer = Offer(
                batch_id=offer.batch_id,
                discount_pct=new_discount,
                start_ts=now,
                end_ts=offer.end_ts,
                audience=OfferAudience.PUBLIC
            )
            db.add(new_offer)
            relisted_count += 1
    
    db.commit()
    return {"relisted_count": relisted_count}

# Impact services
def get_impact_metrics(db: Session):
    total_impact = db.query(
        func.sum(Impact.qty_picked_up).label('total_items'),
        func.sum(Impact.co2e_saved_kg).label('total_co2e'),
        func.sum(Impact.revenue_recovered).label('total_revenue')
    ).first()
    
    # Convert grams to pounds (1 kg = 2.20462 lbs)
    total_lbs = (total_impact.total_items or 0) * 0.15 * 2.20462  # Assuming 150g average item weight
    
    return ImpactResponse(
        total_lbs_saved=total_lbs,
        total_co2e_avoided=total_impact.total_co2e or 0,
        total_revenue_recovered=total_impact.total_revenue or 0,
        total_items_rescued=total_impact.total_items or 0
    )

def update_impact_metrics(db: Session, reservation: Reservation):
    offer = db.query(Offer).filter(Offer.id == reservation.offer_id).first()
    batch = db.query(Batch).filter(Batch.id == offer.batch_id).first()
    product = db.query(Product).filter(Product.id == batch.product_id).first()
    
    # Calculate CO2e saved (example: dairy products)
    co2e_per_kg = 1.9  # kg CO2e per kg of dairy
    weight_kg = (product.weight_grams * reservation.qty_reserved) / 1000
    co2e_saved = weight_kg * co2e_per_kg
    
    # Calculate revenue recovered
    revenue_recovered = reservation.qty_reserved * product.base_price * (1 - offer.discount_pct / 100)
    
    # Create impact record
    impact = Impact(
        batch_id=batch.id,
        qty_picked_up=reservation.qty_reserved,
        co2e_saved_kg=co2e_saved,
        revenue_recovered=revenue_recovered
    )
    db.add(impact)

# Markdown engine
def apply_markdown_engine(db: Session):
    now = datetime.utcnow()
    batches = db.query(Batch).filter(Batch.expiry_ts > now).all()
    
    created_offers = 0
    for batch in batches:
        hours_left = (batch.expiry_ts - now).total_seconds() / 3600
        
        # Apply discount based on hours left
        if hours_left < 6:
            discount_pct = 60
        elif hours_left < 12:
            discount_pct = 40
        elif hours_left < 18:
            discount_pct = 30
        else:
            discount_pct = 20
        
        # Check if offer already exists
        existing_offer = db.query(Offer).filter(
            Offer.batch_id == batch.id,
            Offer.audience == OfferAudience.NONPROFIT
        ).first()
        
        if not existing_offer:
            # Create nonprofit offer first
            nonprofit_offer = Offer(
                batch_id=batch.id,
                discount_pct=discount_pct,
                start_ts=now,
                end_ts=now + timedelta(hours=2),  # 2-hour nonprofit window
                audience=OfferAudience.NONPROFIT
            )
            db.add(nonprofit_offer)
            
            # Create public offer after nonprofit window
            public_offer = Offer(
                batch_id=batch.id,
                discount_pct=discount_pct,
                start_ts=now + timedelta(hours=2),
                end_ts=batch.expiry_ts,
                audience=OfferAudience.PUBLIC
            )
            db.add(public_offer)
            created_offers += 2
    
    db.commit()
    return {"created_offers": created_offers}
