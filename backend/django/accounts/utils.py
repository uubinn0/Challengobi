import os
import uuid
import firebase_admin
from firebase_admin import credentials, storage
from django.conf import settings


def get_firebase_bucket():
    """Firebase storage bucket을 가져오는 함수"""
    if not len(firebase_admin._apps):
        # Firebase 초기화가 안되어 있을 경우에만 초기화
        try:
            firebase_admin.initialize_app(
                options={
                    "storageBucket": settings.FIREBASE_STORAGE_BUCKET,
                    "projectId": settings.FIREBASE_CONFIG["projectId"],
                }
            )
        except ValueError:
            # 이미 초기화된 경우
            pass

    return storage.bucket()


def upload_image_to_firebase(image_file, user_id=None):
    """이미지를 Firebase Storage에 업로드하고 URL 반환"""
    if not image_file:
        return None

    # 파일 확장자 추출
    file_extension = image_file.name.split(".")[-1].lower()
    allowed_extensions = ["jpg", "jpeg", "png", "gif"]

    if file_extension not in allowed_extensions:
        raise ValueError("지원되지 않는 이미지 형식입니다.")

    # 사용자 ID가 없으면 임시 ID 생성
    folder = f"profile_images/{user_id or 'temp'}"
    file_name = f"{folder}/profile_{uuid.uuid4()}.{file_extension}"

    # Firebase Storage 버킷 가져오기
    bucket = get_firebase_bucket()
    blob = bucket.blob(file_name)

    # 이미지 업로드
    blob.upload_from_file(image_file, content_type=image_file.content_type)

    # 공개 URL 생성
    blob.make_public()
    return blob.public_url
