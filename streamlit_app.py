import streamlit as st, joblib, os, requests, cloudinary
from dotenv import load_dotenv

load_dotenv()  # .env 파일 읽기

st.title("🎧 뇌파 맞춤 음악 추천기")

# 1) 사용자 입력
target_bpm = st.slider("원하는 BPM", 40, 200, 60)
target_hz  = st.number_input("뇌파 동조 주파수 (Hz)", 0.0, 50.0, 7.83)

# 2) Cloudinary 예시 곡 하나 보여주기
if st.button("곡 보기"):
    cld_url = "https://res.cloudinary.com/demo/video/upload/v1652223820/dog.mp4"
    st.video(cld_url)
