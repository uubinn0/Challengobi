import os
import mysql.connector
from mysql.connector import Error
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# 변수 이름 설정
CATEGORY_TABLE_NAME = "UserChallengeCategory"
USER_TABLE_NAME = "User"

# 환경 변수에서 설정 값 읽어오기
load_dotenv()

# MariaDB 연결 설정
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
        if connection.is_connected():
            print("Connected to MariaDB")
            return connection
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

# User 테이블 데이터 가져오기
def get_users():
    try:
        connection = get_db_connection()
        if connection:
            query = f"SELECT user_id, sex, birth_date, career, nickname, profile_image FROM {USER_TABLE_NAME}" #nickname, profile_image는 FE로 보낼 기초 정보
            users_df = pd.read_sql(query, connection)  # pandas로 데이터 가져오기
            connection.close()

            # birth_date를 연도로 변환 (나이와 연관)
            users_df["birth_year"] = users_df["birth_date"].apply(lambda x: int(str(x)[:4]) if x else None)
            users_df.drop(columns=["birth_date"], inplace=True)

            return users_df
        return pd.DataFrame()
    except Error as e:
        print(f"Error: {e}")
        return pd.DataFrame()

def get_categorys(): # 카테고리 정보 가져오기
    try:
        connection = get_db_connection()
        if connection:
            query = f"SELECT * FROM {CATEGORY_TABLE_NAME}" #카테고리 테이블 이름
            categories_df = pd.read_sql(query, connection)
            connection.close()
            return categories_df
        return pd.DataFrame()
    except Error as e:
        print(f"Error: {e}")
        return pd.DataFrame()