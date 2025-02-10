from fastapi import FastAPI, HTTPException
from typing import List
from database import get_db_connection
import mysql.connector
from mysql.connector import Error
from database import get_users, get_categorys
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel

### 변수 설정 ###
RECOMMENDED_PERSON_NUM = 10 # 추천하는 사용자 수

app = FastAPI()

### FE에서 받아오는 데이터 형식 ###
#### 사용자 추천 ####
class RecommendRequest(BaseModel): # 추천 시 사용자 id 받음
    id: int

### FastAPI 연결 확인 ###

@app.get("/")
def root():
    return {"message": "FastAPI CONNECT COMPLETE"}


### 사용자 추천 기능 ###

def weighted_cosine_similarity(users, target_user, features, weights):
    # 각 특성에 해당하는 값을 가져와 가중치를 곱함
    weighted_features = users[features] * weights
    weighted_target_user = target_user[features] * weights
    
    # Cosine Similarity 계산
    similarity_matrix = cosine_similarity(weighted_features, weighted_target_user)
    
    return similarity_matrix

def category_cosine_similarity(user_category, target_category, features):
    featured_category = user_category[features]
    featured_target = target_category[features]

    similarity_matrix = cosine_similarity(featured_category, featured_target)

    return similarity_matrix

@app.post("/recommend")
async def recommend(request: RecommendRequest): # 비동기식
    users = get_users()
    category = get_categorys()

    if users.empty:
        raise HTTPException(status_code=500, detail="No user data available")
    
    if category.empty:
        raise HTTPException(status_code=500, detail="No category data available")
    
    # 기준이 될 사용자
    TARGET = request.id
    target_user = users[users["user_id"] == TARGET]
    target_user_category = category[category["user_id"] == TARGET]

    if target_user.empty:
        raise HTTPException(status_code=404, detail="Target user not found")

    if target_user_category.empty:
        raise HTTPException(status_code=404, detail="Target user category not found")
    
    # id 제거 후 데이터 정규화 (sex: 범주형 -> 숫자로 변환)
    users["sex"] = users["sex"].map({"M": 0, "F": 1})
    target_user["sex"] = target_user["sex"].map({"M": 0, "F": 1})

    # 유사도 계산 (Cosine Similarity)
    ## 카테고리 유사도 계산
    category_features = category.columns[1:] #user_no 제거
    category_similarity = category_cosine_similarity(category, target_user_category, category_features)

    ## 유저 유사도 계산
    features = ["sex", "birth_year", "career"]
    weights = [0.2, 0.5, 0.3]
    similarity_matrix = weighted_cosine_similarity(users, target_user, features, weights)

    # 카테고리 유사도와 유저 정보 유사도 합치기
    final_weights = [0.5, 0.5] # 카테고리 - 유저
    # 상위 RECOMMENDED_PERSON_NUM명 추천 (자기 자신 제외)
    users["similarity"] = category_similarity * final_weights[0] + similarity_matrix * final_weights[1]
    recommended_users = users[users["user_id"] != TARGET].nlargest(RECOMMENDED_PERSON_NUM, "similarity")

    return recommended_users[["user_id"]].to_dict(orient="records")