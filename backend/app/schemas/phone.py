from pydantic import BaseModel

class PhoneInput(BaseModel):
    phone: str
