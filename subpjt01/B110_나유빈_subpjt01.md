# KF-DeBERTa [🔗](https://ai.kakaobank.com/f982c5b8-9cbd-4ef1-8ebd-d7359a70284b) [🤗](https://huggingface.co/kakaobank/kf-deberta-base)

---

카카오뱅크에서 발표한 BERT 기반의 금융 특화 Pre-Training 모델.

 대규모 언어 모델의 등장으로 자연어 처리 기술이 크게 발전했지만 금융 용어 및 금융 도메인 지식에 전문화된 언어모델의 부족으로 금융 도메인에서는 최신 언어모델을 쓰는 것에 아직 어려움이 많았다. 이러한 묹제를 해결하기 위해 범용 언어모델보다 금융 도메인의 이해도를 높인 모델을 개발하게 되었다. 

 1년 여 동안 고품질의 한국어 금융 학습 데이터를 구축하고 이 학습 데이터에 최적화시킨 모델이 바로 KF-DeBERTa 언어 모델이다. 다양한 여건을 고려하여 양방향 구조로 문맥을 양방향으로 이해하고 위치정보를 포함한 Disentangled Attention이 도입된 DeBERTa를 토대로 언어 모델을 개발했다.

<aside>
📌

금융 서비스에 언어 모델이 사용되기 위해 보완되어야 할 요소

- 일반적으로 사용되지 않는 금융 용어에 대한 이해
- 금융 상품명 등 고유명사에 대한 이해
- 문서 내 수치 및 값에 대한 이해
</aside>

<aside>
📌

사전 학습에 사용된 말뭉치 전처리 작업

- 문장단위 분할
- HTML 태그 및 잘못된 문자 제거
- 출처 정보 제거
- 비한글 문장 제거
- 숫자 비중 높은 문장 제거
- 짧은 문장 제거 (10 음절 이하)
- 기타 등
</aside>

Fine-Tuning을 위해 한국어 금융 데이터도 전문 금융 리포트와 관련 소식들을 재가공하여 새로운 레이블링 작업과 기계 번역을 거쳐 완성했다.

- **모델 크기**

![image.png](https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F14a0fc9e-70d0-4ad3-acbe-cce69bdc5116%2F4a165128-deea-4861-9793-5963094a4a23%2F%25E1%2584%2583%25E1%2585%25A2%25E1%2584%258C%25E1%2585%25B5_1_%25E1%2584%2589%25E1%2585%25A1%25E1%2584%2587%25E1%2585%25A9%25E1%2586%25AB.png&blockId=024337ab-64d5-4a56-bed6-3cb1d705e1f4)

## Sample Code

```python
import torch
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("kakaobank/kf-deberta-base")
tokenizer = AutoTokenizer.from_pretrained("kakaobank/kf-deberta-base")

text = "카카오뱅크와 에프엔가이드가 금융특화 언어모델을 공개합니다."
tokens = tokenizer.tokenize(text)
print('tokens : ', tokens)

inputs = tokenizer(text, return_tensors="pt")
print('input: ', inputs)
print(*[f"{key}={value}" for key, value in inputs.items()])
model_output = model(**inputs)
print('output : ', model_output)
```
<br>

# KF-DeBERTa-Multitask [🤗](https://huggingface.co/upskyy/kf-deberta-multitask)

---

KF-DeBERTa-Base를 KorNLI, KorSTS 데이터셋으로 미세조정을 진행한  모델

 KorNLI는 두 문장을 입력 받아 두 관계를 분류하는 자연어 추론 데이터셋이다.

아래의 표는 문장 분류의 예시이다.

| **Example** | **English Translation** | **Label** |
| --- | --- | --- |
| P: 저는, 그냥 알아내려고 거기 있었어요.H: 이해하려고 노력하고 있었어요. | I was just there just trying to figure it out.I was trying to understand. | Entailment |
| P: 저는, 그냥 알아내려고 거기 있었어요.H: 나는 처음부터 그것을 잘 이해했다. | I was just there just trying to figure it out.I understood it well from the beginning. | Contradiction |
| P: 저는, 그냥 알아내려고 거기 있었어요.H: 나는 돈이 어디로 갔는지 이해하려고 했어요. | I was just there just trying to figure it out.I was trying to understand where the money went. | Neutral |

 KorSTS는 두 문장 사이의 의미적 유사성의 정도를  평가하는 데이터셋이다.

아래의 표는 STS의 예시이다.

| **Example** | **English Translation** | **Label** |
| --- | --- | --- |
| 한 남자가 음식을 먹고 있다.한 남자가 뭔가를 먹고 있다. | A man is eating food.A man is eating something. | 4.2 |
| 한 비행기가 착륙하고 있다.애니메이션화된 비행기 하나가 착륙하고 있다. | A plane is landing.A animated airplane is landing. | 2.8 |
| 한 여성이 고기를 요리하고 있다.한 남자가 말하고 있다. | A woman is cooking meat.A man is speaking. | 0.0 |

## Sample Code

```python
# from sentence_transformers import SentenceTransformer
# sentences = ["안녕하세요?", "한국어 문장 임베딩을 위한 버트 모델입니다."]
#
# model = SentenceTransformer("upskyy/kf-deberta-multitask")
# embeddings = model.encode(sentences)
# print(embeddings)

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 모델 및 토크나이저 불러오기
model_name = "upskyy/kf-deberta-multitask"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# 예제 데이터
texts = [
    "적금은 일정 기간 동안 정기적으로 돈을 납입하고, 약정 기간이 만료되면 원금과 이자를 받는 예금 상품입니다.",
    "주식 시장이 급락하면서 많은 투자자들이 손실을 보고 있습니다.",
    "금융 시스템의 디지털화가 빠르게 진행되고 있으며, 블록체인 기술이 금융 거래에 사용되고 있습니다.",
    "정기예금은 고정된 기간 동안 일정 금액을 예치하는 금융 상품입니다.",
    "두 번째 문장입니다.",
    "은행의 새로운 서비스가 출시되었습니다.",
    "암호화폐 시장이 뜨겁습니다. 비트코인, 이더리움 등 다양한 가상화폐가 투자 대상이 되고 있습니다."
]

# 주제 키워드 목록
topics = ['저축', '투자', '금융 기술', '주식', '암호화폐', '기타']

# 토큰화
inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")

# 모델 추론 모드
model.eval()

# 예측
with torch.no_grad():
    outputs = model(**inputs)
    logits = outputs.logits
    predictions = torch.argmax(logits, dim=-1)

print(predictions)

# 주제 분류 결과
for i, text in enumerate(texts):
    topic = topics[predictions[i].item()]
    print(f"문장: {text}\n주제: {topic}\n")

```

<br>

# CLOVA OCR

---

 CLOVA OCR은 문서나 이미지를 인식하여 사용자가 지정한 영역의 텍스트와 데이터를 정확하게 추출하는 NAVER CLOUD PLATFORM의 서비스이다. 문자에 대한 높은 인식률을 가졌으며 일반 형식의 문서/이미지뿐만 아니라 미리 등록된 다양한 템플릿에서의 텍스트와 데이터를 추출하는 기술도 지원한다. 또한 템플릿과의 유사도를 통해 사용자의 개입 없이 문서 자동 분류가 가능하다는 점에서 업무 효율을 올릴 수 있다. 이 밖에도 Papago와 같은 서비스와의 연계를 제공한다.

## CLOVA OCR 기능

---

- 이미지나 문서에서 인식 결과를 추출 : 문서를 인식하고 사용자가 지정한 영역의 텍스트와 데이터를 정확하게 추출
- 문서 처리 자동화와 액션 연동 : 등록된 템플릿의 유사도를 통해 문서를 자동 분류하여 효과적인 업무 워크플로우 설계
- 인식 결과 검증 프로세스 : 인식된 결과값을 검증할 수 있어 반복 검증 업무를 줄이고 신뢰도 향상
- 다양한 서비스에 연계하여 활용 가능하도록 쉽고 간편한 Restful API 제공 : 인식에 사용할 언어와 이미지 데이터를 입력받고, 그에 맞는 인식 결과를 텍스트로 변환

## CLOVA OCR 도메인

---

- General : 텍스트/표를 추출하는 OCR
- Template : 판독 영역을 직접 지정하여 인식값 추출 후 테스트 및 결과 전송이 가능한 템플릿 빌더를 지원하는 OCR
- Document : 머신러닝 기반으로 문서의 의미적 구조를 이해하는 특화 모델 엔진을 탑재하여 입력 정보(key-value)를 자동 추출하는 OCR

## 연동 설정 및 API 호출

---

[연동 설정](https://guide.ncloud-docs.com/docs/clovaocr-domain)

[API 호출](https://api.ncloud-docs.com/docs/ai-application-service-ocr)

[API 호출 예제](https://guide.ncloud-docs.com/docs/clovaocr-example01)