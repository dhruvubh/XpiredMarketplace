from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import SessionLocal
from models import *
import random

def seed_database():
    db = SessionLocal()
    
    try:
        # Create users
        users = [
            User(email="admin@zerowaste.com", name="Admin User", role=UserRole.ADMIN),
            User(email="pantry@ru.edu", name="RU Pantry", role=UserRole.NONPROFIT),
            User(email="shopper1@email.com", name="Sarah Johnson", role=UserRole.CUSTOMER),
            User(email="shopper2@email.com", name="Mike Chen", role=UserRole.CUSTOMER),
            User(email="store@zerowaste.com", name="Store Staff", role=UserRole.STORE),
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        # Create products
        products = [
            Product(sku="YOG001", name="Greek Yogurt", category="Dairy", size="500g", base_price=4.99, weight_grams=500),
            Product(sku="BRD001", name="Sourdough Bread", category="Bakery", size="1 loaf", base_price=3.49, weight_grams=400),
            Product(sku="LET001", name="Organic Lettuce", category="Produce", size="1 head", base_price=2.99, weight_grams=200),
            Product(sku="MIL001", name="Oat Milk", category="Dairy", size="1L", base_price=3.99, weight_grams=1000),
            Product(sku="BAN001", name="Bananas", category="Produce", size="6 pack", base_price=1.99, weight_grams=600),
            Product(sku="CHE001", name="Cheddar Cheese", category="Dairy", size="200g", base_price=5.99, weight_grams=200),
            Product(sku="APP001", name="Apples", category="Produce", size="5 pack", base_price=3.49, weight_grams=500),
            Product(sku="HAM001", name="Deli Ham", category="Meat", size="200g", base_price=6.99, weight_grams=200),
            Product(sku="EGG001", name="Free Range Eggs", category="Dairy", size="12 pack", base_price=4.49, weight_grams=600),
            Product(sku="TOM001", name="Cherry Tomatoes", category="Produce", size="250g", base_price=3.99, weight_grams=250),
        ]
        
        for product in products:
            db.add(product)
        db.commit()
        
        # Create batches with varying expiry times
        now = datetime.utcnow()
        batches = [
            Batch(product_id=1, qty_total=20, qty_available=20, expiry_ts=now + timedelta(hours=4), store_id=1),
            Batch(product_id=2, qty_total=15, qty_available=15, expiry_ts=now + timedelta(hours=8), store_id=1),
            Batch(product_id=3, qty_total=10, qty_available=10, expiry_ts=now + timedelta(hours=12), store_id=1),
            Batch(product_id=4, qty_total=25, qty_available=25, expiry_ts=now + timedelta(hours=16), store_id=1),
            Batch(product_id=5, qty_total=30, qty_available=30, expiry_ts=now + timedelta(hours=20), store_id=1),
        ]
        
        for batch in batches:
            db.add(batch)
        db.commit()
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
