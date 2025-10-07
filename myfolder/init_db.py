#!/usr/bin/env python3
"""
Initialize database and seed with sample data
"""
from database import engine, Base
from models import *
from seed_data import seed_database

def main():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Seeding database with sample data...")
    seed_database()
    
    print("Database initialized successfully!")

if __name__ == "__main__":
    main()
