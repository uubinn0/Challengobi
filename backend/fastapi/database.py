import os
import mysql.connector
from mysql.connector import Error
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient

# 변수 이름 설정
CATEGORY_TABLE_NAME = "UserChallengeCategory"
USER_TABLE_NAME = "User"

# 환경 변수에서 설정 값 읽어오기
db_host = os.getenv("DB_HOST")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

# MariaDB 연결 설정
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name,
            charset="utf8mb4"
        )
        if connection.is_connected():
            print("Connected to MariaDB")  # 이 메시지가 콘솔에 출력되는지 확인
            return connection
    except Error as e:
        print(f"Error: {e}")  # 에러가 있다면 여기서 확인 가능
        return None

# User 테이블 데이터 가져오기
def get_users():
    connection = get_db_connection()
    if connection is None:
        return []

    query = f"SELECT id, sex, birth_date, career, nickname, profile_image FROM {USER_TABLE_NAME}" #nickname, profile_image는 FE로 보낼 기초 정보
    df = pd.read_sql(query, connection)  # pandas로 데이터 가져오기
    connection.close()

    # birth_date를 연도로 변환 (나이와 연관)
    df["birth_year"] = df["birth_date"].apply(lambda x: int(str(x)[:4]) if x else None)
    df.drop(columns=["birth_date"], inplace=True)

    return df

def get_categorys(): # 카테고리 정보 가져오기
    connection = get_db_connection()
    if connection is None:
        return []
    
    query = f"SELECT * FROM {CATEGORY_TABLE_NAME}" #카테고리 테이블 이름
    df = pd.read_sql(query, connection)
    connection.close()
    print(df)
    return df