"""
CSV Import functionality for ZeroWaste Exchange
"""
import csv
import io
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from models import Product, Batch
from database import SessionLocal

def import_products_from_csv(csv_content: str):
    """
    Import products from CSV content
    Expected CSV format: sku,name,category,size,base_price,weight_grams
    """
    db = SessionLocal()
    try:
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        imported_count = 0
        
        for row in csv_reader:
            # Create product
            product = Product(
                sku=row.get('sku', f"SKU{datetime.now().timestamp()}"),
                name=row.get('name', 'Unknown Product'),
                category=row.get('category', 'General'),
                size=row.get('size', '1 unit'),
                base_price=float(row.get('base_price', 0)),
                weight_grams=float(row.get('weight_grams', 100))
            )
            
            db.add(product)
            imported_count += 1
        
        db.commit()
        return {"imported_count": imported_count, "message": "Products imported successfully"}
        
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

def create_batch_from_csv(csv_content: str, store_id: int = 1):
    """
    Create batches from CSV content
    Expected CSV format: sku,name,category,size,base_price,weight_grams,qty_total,expiry_hours
    """
    db = SessionLocal()
    try:
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        created_batches = 0
        
        for row in csv_reader:
            # Find or create product
            product = db.query(Product).filter(Product.sku == row.get('sku')).first()
            
            if not product:
                # Create product if it doesn't exist
                product = Product(
                    sku=row.get('sku', f"SKU{datetime.now().timestamp()}"),
                    name=row.get('name', 'Unknown Product'),
                    category=row.get('category', 'General'),
                    size=row.get('size', '1 unit'),
                    base_price=float(row.get('base_price', 0)),
                    weight_grams=float(row.get('weight_grams', 100))
                )
                db.add(product)
                db.flush()  # Get the ID
            
            # Create batch
            expiry_hours = int(row.get('expiry_hours', 24))
            expiry_time = datetime.utcnow() + timedelta(hours=expiry_hours)
            
            batch = Batch(
                product_id=product.id,
                qty_total=int(row.get('qty_total', 10)),
                qty_available=int(row.get('qty_total', 10)),
                expiry_ts=expiry_time,
                store_id=store_id
            )
            
            db.add(batch)
            created_batches += 1
        
        db.commit()
        return {"created_batches": created_batches, "message": "Batches created successfully"}
        
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()
