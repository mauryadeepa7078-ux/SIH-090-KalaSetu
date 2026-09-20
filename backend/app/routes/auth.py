import time
import json
import base64
import hmac
import hashlib
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel
from backend.app.data.db_store import db_store, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication & Role Security"])

AUTH_SECRET = "craftx-mosje-sih26090-auth-secret-key-prod"

def create_token(user_id: str, role: str) -> str:
    payload = {
        "uid": user_id,
        "role": role,
        "exp": int(time.time()) + (86400 * 30)  # 30 days validity
    }
    raw = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(AUTH_SECRET.encode(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}.{sig}"

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        if not token or "." not in token:
            return None
        clean_token = token.replace("Bearer ", "").strip()
        raw, sig = clean_token.split(".", 1)
        expected_sig = hmac.new(AUTH_SECRET.encode(), raw.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload = json.loads(base64.urlsafe_b64decode(raw.encode()).decode())
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None

# ============================================================================
# Request Models
# ============================================================================
class RegisterRequest(BaseModel):
    username: str
    password: str
    name: str
    role: str = "artisan"  # 'artisan' | 'buyer' | 'businessman'
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    # Artisan fields
    craft_type: Optional[str] = None
    village: Optional[str] = None
    state: Optional[str] = None
    scheme_id: Optional[str] = None
    # Businessman fields
    company: Optional[str] = None
    gstin: Optional[str] = None
    gem_org_id: Optional[str] = None
    procurement_type: Optional[str] = None
    city: Optional[str] = None
    # Buyer fields
    pincode: Optional[str] = None
    buyer_type: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: str
    password: str

class ResetPasswordRequest(BaseModel):
    identifier: str
    new_password: str

# ============================================================================
# Endpoints
# ============================================================================
@router.post("/register")
def register_user(req: RegisterRequest):
    clean_username = req.username.strip().lower().replace("@", "")
    if len(clean_username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")
    
    valid_roles = ["artisan", "buyer", "businessman"]
    role = req.role.strip().lower()
    if role not in valid_roles:
        role = "artisan"

    # Check existing user
    existing = db_store.get_user_by_identifier(clean_username)
    if existing:
        raise HTTPException(status_code=409, detail="Username is already registered. Please login or choose another.")

    # Artisan Pehchan ID formatting if not supplied
    scheme_id = req.scheme_id
    if role == "artisan" and not scheme_id:
        from datetime import datetime
        import random
        state_code = "UP"
        loc = (req.location or req.state or "").upper()
        if "BIHAR" in loc or "BR" in loc: state_code = "BR"
        elif "RAJASTHAN" in loc or "RJ" in loc: state_code = "RJ"
        elif "ODISHA" in loc or "OD" in loc: state_code = "OD"
        elif "WEST BENGAL" in loc or "WB" in loc: state_code = "WB"
        elif "GUJARAT" in loc or "GJ" in loc: state_code = "GJ"
        elif "MAHARASHTRA" in loc or "MH" in loc: state_code = "MH"
        elif "KARNATAKA" in loc or "KA" in loc: state_code = "KA"
        elif "TAMIL" in loc or "TN" in loc: state_code = "TN"
        scheme_id = f"MoSJE-{state_code}-{datetime.now().year}-{random.randint(100000, 999999)}"

    # Construct user dictionary
    user_payload = {
        "username": clean_username,
        "name": req.name.strip(),
        "role": role,
        "phone": req.phone or "",
        "email": req.email or "",
        "location": req.location or (f"{req.village}, {req.state}" if req.village and req.state else req.village or req.city or ""),
        "craft_type": req.craft_type or "",
        "scheme_id": scheme_id or "",
        "mosje_pehchan_id": scheme_id or "",
        "company": req.company or "",
        "gstin": req.gstin or "",
        "gem_org_id": req.gem_org_id or "",
        "procurement_type": req.procurement_type or "",
        "buyer_type": req.buyer_type or ""
    }

    new_user = db_store.create_user(user_payload, req.password)
    token = create_token(new_user["id"], new_user["role"])

    return {
        "success": True,
        "token": token,
        "user": db_store.sanitize_user(new_user),
        "message": "Account registered successfully."
    }

@router.post("/login")
def login_user(req: LoginRequest):
    clean_id = req.identifier.strip().lower().replace("@", "")
    user = db_store.get_user_by_identifier(clean_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Please check username or register."
        )

    pwd_hash = user.get("password_hash", "")
    pwd_salt = user.get("password_salt", "")
    if not verify_password(req.password, pwd_hash, pwd_salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please verify and retry."
        )

    token = create_token(user["id"], user["role"])
    return {
        "success": True,
        "token": token,
        "user": db_store.sanitize_user(user),
        "message": "Logged in successfully."
    }

@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    
    payload = decode_token(authorization)
    if not payload or not payload.get("uid"):
        raise HTTPException(status_code=401, detail="Invalid or expired authentication session.")

    user = db_store.get_user_by_id(payload["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User account no longer exists.")

    return {
        "success": True,
        "user": db_store.sanitize_user(user)
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    clean_id = req.identifier.strip().lower().replace("@", "")
    if len(req.new_password) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters.")

    user = db_store.get_user_by_identifier(clean_id)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found with this username/phone/email.")

    db_store.update_user_password(user["id"], req.new_password)
    return {
        "success": True,
        "message": "Password updated successfully. You can now log in with your new password."
    }
