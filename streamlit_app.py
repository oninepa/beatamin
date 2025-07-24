import streamlit as st, pandas as pd, cloudinary, os
from dotenv import load_dotenv

load_dotenv()

# Cloudinary 초기화
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

st.title("Beatamin MVP - 뇌파 맞춤 음악")

# 1) CSV 불러오기
@st.cache_data
def load_meta():
    url = "https://raw.githubusercontent.com/oninepa/beatamin/main/metadata.csv"
    return pd.read_csv(url)

meta = load_meta()

# 2) 필터 UI
bpm = st.slider("BPM", 40, 200, 70)
hz  = st.number_input("동조 주파수 (Hz)", 0.0, 50.0, 7.0)

# 3) 필터링
mask = (meta["bpm"] <= bpm + 5) & (meta["bpm"] >= bpm - 5) & \
       (meta["hz_low"] <= hz) & (meta["hz_high"] >= hz)
candidates = meta[mask]

if candidates.empty:
    st.warning("조건에 맞는 곡이 없습니다.")
else:
    st.subheader(f"{len(candidates)}곡 매칭")
    for _, row in candidates.iterrows():
        cld_url = cloudinary.CloudinaryVideo(row["public_id"]).build_url(resource_type="video")
        st.write(f"{row['public_id']}  |  BPM {row['bpm']}  |  Key {row['key_name']}")
        st.audio(cld_url, format="audio/mp3")
