from fastapi import FastAPI, Body
from sentence_transformers import SentenceTransformer, util
import torch

# FastAPI 앱 인스턴스 생성
app = FastAPI()

# 장치 설정
device = "cuda" if torch.cuda.is_available() else "cpu"

# 모델 로드
MODEL_NAME = 'intfloat/multilingual-e5-large-instruct'
model = SentenceTransformer(MODEL_NAME, device=device)

@app.post("/recommend")
def recommend_rooms(data: dict = Body(...)):
    catagories = data.get('categories', [])     # 선호 카테고리
    read_books = data.get('read_books', [])     # 읽은 책
    liked_books = data.get('liked_books', [])   # 찜한 책
    room_history = data.get('room_history', []) # 참여 히스토리
    raw_rooms = data.get('room_list', [])       # 추천 후보 방 목록 (현재 방 목록)
    room_texts = []
    room_ids = [] 

    # 방 목록이 비어있으면 종료
    if not raw_rooms:
        return {"top_indices": []}
    
    for item in raw_rooms:
        r_id = item.get('room_id')
        room_ids.append(r_id)

        cat = item.get('category')
        title = item.get('title')

        # 책 정보가 방에 포함되어 있을 경우
        book_info = ""
        if 'book_title' in item:
            book_info = f" | 책: {item['book_category']} 분야의 {item['book_title']}"
        
        text = f"카테고리: {cat} | 방 제목: {title}{book_info}"
        room_texts.append(text)

    
    # 데이터를 자연어 문장으로 변환
    user_context_parts = []

    # 선호 카테고리 정보 반영
    if catagories:
        user_context_parts.append(f"선호하는 도서 카테고리는 {', '.join(catagories)}입니다.")

    # 책 정보 반영 (읽은 책 + 찜한 책)
    all_books = read_books + liked_books
    if all_books:
        book_descriptions = []
        for book in all_books[:30]: # 최대 30개
            cat = book.get('category')
            title = book.get('title')
            if title:
                book_descriptions.append(f"{cat} 장르의 책 '{title}'")

        if book_descriptions:
            user_context_parts.append(f"관심 있는 책은 {', '.join(book_descriptions)} 등입니다.")


    # 방 참여 히스토리 반영
    if room_history:
        recent_history = room_history[:10] # 최대 10개
        history_descriptions = []
        for h in recent_history:
            cat = h.get('category')
            title = h.get('title')
            if title:
                history_descriptions.append(f"{cat} 주제의 독서 토론 방 '{title}'")  

        if history_descriptions:
            user_context_parts.append(f"과거에 {', '.join(history_descriptions)} 등에 참여했습니다.")
                

    # 문장 합치기
    user_query_sentence = " ".join(user_context_parts)

    # E5 모델 포맷 적용 (Instruct + Query)
    task_description = "Given a user's reading history and preferences, recommend suitable book discussion rooms."
    formatted_user_query = f"Instruct: {task_description}\nQuery: {user_query_sentence}"

    # 임베딩 및 유사도 계산
    user_embedding = model.encode(formatted_user_query, normalize_embeddings=True)
    room_embeddings = model.encode(room_texts, normalize_embeddings=True)

    scores = util.cos_sim(user_embedding, room_embeddings)[0]

    # 상위권 추출
    top_k = min(4, len(room_texts))
    top_results = torch.topk(scores, k=top_k)
    result_indices = top_results.indices.tolist()
    final_ids = [room_ids[idx] for idx in result_indices]

    return {"top_indices": final_ids}