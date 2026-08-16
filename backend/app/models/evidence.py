from dataclasses import dataclass


@dataclass
class Evidence:

    source: str

    severity: str

    confidence: int

    title: str

    description: str
