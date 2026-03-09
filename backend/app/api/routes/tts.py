"""Text-to-Speech endpoint using Edge TTS — supports Malayalam and English Neural Voices."""
import io
import asyncio
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.core.database import get_db
from app.models import User
from sqlalchemy.orm import Session
import edge_tts

router = APIRouter(prefix="/tts", tags=["TTS"])

bearer_scheme = HTTPBearer(auto_error=False)


async def get_audio_stream(text: str, voice: str):
    """Generate audio bytes using Edge TTS asynchronously as they arrive to reduce lag."""
    communicate = edge_tts.Communicate(text, voice, rate="+20%")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]


def _resolve_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    token: str = Query(None, description="JWT token (for browser Audio src)"),
    db: Session = Depends(get_db),
) -> User:
    """
    Accept JWT from either:
      1. Authorization: Bearer <token>  (axios/fetch requests)
      2. ?token=<token>                 (browser Audio element src URL)
    """
    raw_token = None
    if credentials:
        raw_token = credentials.credentials
    elif token:
        raw_token = token

    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(raw_token)
    from app.models.user import User as UserModel
    raw_sub = payload.get("sub")
    if not raw_sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    try:
        user_id = int(raw_sub)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token subject")

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/speak")
async def speak(
    text: str = Query(..., max_length=1000),
    lang: str = Query("en", max_length=5),
    user: User = Depends(_resolve_user),
):
    """
    Convert text to speech and return as an MP3 audio stream.
    lang = 'ml' for Malayalam Female
    lang = 'en' for English Female
    Accepts token via Bearer header OR ?token= query param (for <audio src=...>).
    """
    allowed = {"en", "ml", "en-in", "ml-in"}
    lang_code = lang.lower().replace("-in", "")
    if lang_code not in allowed:
        lang_code = "en"

    clean = (
        text.replace("*", "").replace("#", "").replace("`", "")
            .replace("_", " ").replace("-", " ").replace("•", " ")
    )

    # Use premium Microsoft Edge Neural voices (both female)
    voice = "ml-IN-SobhanaNeural" if lang_code == "ml" else "en-IN-NeerjaNeural"

    try:
        return StreamingResponse(
            get_audio_stream(clean, voice),
            media_type="audio/mpeg",
            headers={"Cache-Control": "no-cache"},
        )
    except Exception as e:
        print(f"Edge TTS Error: {e}")
        return StreamingResponse(
            get_audio_stream("Sorry, speech synthesis failed.", "en-IN-NeerjaNeural"),
            media_type="audio/mpeg",
        )
