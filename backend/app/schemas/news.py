from typing import Optional

from pydantic import BaseModel


class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
