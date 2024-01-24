import logging
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from psycopg2.extras import Json
import os

from dotenv import load_dotenv

load_dotenv()

def create_db_connection():
    try:
        # Get database connection parameters from environment variables
        DB_NAME = os.environ.get("DB_NAME")
        DB_USER = os.environ.get("DB_USER")
        DB_PASSWORD = os.environ.get("DB_PASSWORD")
        DB_HOST = os.environ.get("DB_HOST")

        # Establish the database connection
        connection = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )

        return connection

    except psycopg2.Error as e:
        print("Error connecting to the database:", e)
        return None