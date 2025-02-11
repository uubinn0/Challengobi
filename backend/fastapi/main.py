# app = FastAPI()

# @app.get("/")
# def root():
#     return {"message": "Hello World"}
#
# @app.get("/home")
# def home():
#     return {"message":"home"}


import openai
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from paddleocr import PaddleOCR
import json
import os
from PIL import Image
import io
import numpy as np
from typing import List
from pydantic import BaseModel
from database import get_db_connection
import mysql.connector
from mysql.connector import Error
from database import get_users, get_categorys
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=openai.api_key)


class OCRResult(BaseModel):
    payment_date: str
    store: str
    expense: int


class OCRResponse(BaseModel):
    results: List[OCRResult]
    # confidence: List[float]


app = FastAPI()

# PaddleOCR 초기화 (한번만 로드하여 재사용)
ocr = PaddleOCR(lang='korean')  # 한국어 설정

'''json 형식 변경'''


class OCRResult(BaseModel):
    store: str
    expense: int


class OCRResponse(BaseModel):
    results: List[OCRResult]


def process_with_openai(arr: List[str]) -> List[OCRResult]:
    """OpenAI API를 활용하여 OCR 결과를 JSON 형태로 변환"""
    if not arr:
        raise HTTPException(status_code=400, detail="No text extracted from images.")

    prompt = f"""
    다음 리스트는 OCR을 통해 은행 어플 입출금 내역 텍스트 데이터 입니다.

    다음 리스트에서 출금내용(store), 출금금액(expense)을 JSON형식으로 반환하세요.  
    출력은 **반드시 하나의 JSON** 형태여야 합니다. 
    출금 내역을 누락하지 않도록 하세요. 또한 존재하지 않는 출금 내역을 중복해서 추출하지 마세요.

    # 꼭 지켜야하는 요청사항
    1. 반드시 JSON 배열([])로 감싸야 합니다. 
    2. JSON 코드 블록(예: ```json, ``` 등)은 절대 포함하지 마세요.
    3. 불필요한 텍스트를 포함하지 마세요.
    4. 출금금액(expense)은 숫자로만 반환하세요. 틀리면 안 됩니다.
    5. 따옴표는 꼭 큰따옴표(")를 사용하세요. 작은따옴표(')를 사용하지 마세요.

    리스트:
    {arr}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "리스트에서 조건에 맞는 텍스트를 필터링하여 구조화된 JSON 데이터로 변환하는 assistant입니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )

        response_text = response.choices[0].message.content.strip()

        try:
            parsed_data = json.loads(response_text)
            return [OCRResult(**item) for item in parsed_data]
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse OpenAI response.")

    except openai.OpenAIError as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")


@app.post("/extract_text/", response_model=OCRResponse)
async def extract_text(files: List[UploadFile] = File(...)):
    """여러 장의 이미지에서 텍스트를 추출하여 단일 JSON으로 반환"""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    all_results = []

    for file in files:
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            img_np = np.array(image)

            ocr_result = ocr.ocr(img_np, cls=True)
            texts = [line[1][0] for line in ocr_result[0] if line] if ocr_result else []

            # 각 이미지의 결과를 리스트에 추가
            processed_data = process_with_openai(texts)
            all_results.extend(processed_data)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR processing failed for {file.filename}: {str(e)}")

    # 모든 결과를 하나의 OCRResponse 객체로 반환
    return OCRResponse(results=all_results)


'''
====================사용자 추천천=======================
'''


### 변수 설정 ###
RECOMMENDED_PERSON_NUM = 10 # 추천하는 사용자 수


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
# if __name__ == "__main__":
#     import uvicorn

#     uvicorn.run(app, host="0.0.0.0", port=8000)