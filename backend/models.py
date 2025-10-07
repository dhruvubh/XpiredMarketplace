from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    NONPROFIT = "nonprofit"
    CUSTOMER = "customer"
    STORE = "store"

class OfferAudience(str, enum.Enum):
    NONPROFIT = "nonprofit"
    PUBLIC = "public"

class ReservationStatus(str, enum.Enum):
    RESERVED = "reserved"
    PICKED_UP = "picked_up"
    NO_SHOW = "no_show"

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    size = Column(String)
    base_price = Column(Float)
    weight_grams = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    batches = relationship("Batch", back_populates="product")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    qty_total = Column(Integer)
    qty_available = Column(Integer)
    expiry_ts = Column(DateTime)
    store_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="batches")
    offers = relationship("Offer", back_populates="batch")
    impact = relationship("Impact", back_populates="batch")

class Offer(Base):
    __tablename__ = "offers"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    discount_pct = Column(Float)
    start_ts = Column(DateTime)
    end_ts = Column(DateTime)
    audience = Column(SQLEnum(OfferAudience))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    batch = relationship("Batch", back_populates="offers")
    reservations = relationship("Reservation", back_populates="offer")

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"))
    user_id = Column(Integer)
    qty_reserved = Column(Integer)
    pickup_start_ts = Column(DateTime)
    pickup_end_ts = Column(DateTime)
    status = Column(SQLEnum(ReservationStatus), default=ReservationStatus.RESERVED)
    confirmation_code = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    offer = relationship("Offer", back_populates="reservations")
    pickups = relationship("Pickup", back_populates="reservation")

class Pickup(Base):
    __tablename__ = "pickups"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"))
    pickup_ts = Column(DateTime, default=datetime.utcnow)
    staff_id = Column(Integer)
    
    reservation = relationship("Reservation", back_populates="pickups")

class Impact(Base):
    __tablename__ = "impact"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    qty_picked_up = Column(Integer)
    co2e_saved_kg = Column(Float)
    revenue_recovered = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    batch = relationship("Batch", back_populates="impact")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(SQLEnum(UserRole))
    created_at = Column(DateTime, default=datetime.utcnow)
