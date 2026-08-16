from dataclasses import dataclass, asdict


@dataclass
class Evidence:

    source: str
    severity: str
    confidence: int
    title: str
    description: str

    def to_dict(self):
        return asdict(self)
