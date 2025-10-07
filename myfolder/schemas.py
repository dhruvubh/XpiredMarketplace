from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from models import UserRole, OfferAudience, ReservationStatus

# Product schemas
class ProductBase(BaseModel):
    sku: str
    name: str
    category: str
    size: str
    base_price: float
    weight_grams: float

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Batch schemas
class BatchBase(BaseModel):
    product_id: int
    qty_total: int
    qty_available: int
    expiry_ts: datetime
    store_id: int

class BatchCreate(BatchBase):
    pass

class BatchResponse(BatchBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Offer schemas
class OfferBase(BaseModel):
    batch_id: int
    discount_pct: float
    start_ts: datetime
    end_ts: datetime
    audience: OfferAudience

class OfferCreate(OfferBase):
    pass

class OfferResponse(OfferBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Reservation schemas
class ReservationBase(BaseModel):
    offer_id: int
    user_id: int
    qty_reserved: int
    pickup_start_ts: datetime
    pickup_end_ts: datetime

class ReservationCreate(ReservationBase):
    pass

class ReservationResponse(ReservationBase):
    id: int
    status: ReservationStatus
    confirmation_code: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Pickup schemas
class PickupBase(BaseModel):
    reservation_id: int
    staff_id: int

class PickupCreate(PickupBase):
    pass

class PickupResponse(PickupBase):
    id: int
    pickup_ts: datetime
    
    class Config:
        from_attributes = True

# Impact schemas
class ImpactBase(BaseModel):
    batch_id: int
    qty_picked_up: int
    co2e_saved_kg: float
    revenue_recovered: float

class ImpactCreate(ImpactBase):
    pass

class ImpactResponse(BaseModel):
    total_lbs_saved: float
    total_co2e_avoided: float
    total_revenue_recovered: float
    total_items_rescued: int
    
    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    email: str
    name: str
    role: UserRole

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
