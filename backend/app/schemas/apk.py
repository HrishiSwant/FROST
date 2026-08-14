from pydantic import BaseModel


class APKAnalysisResult(BaseModel):
    package_name: str | None = None
    app_name: str | None = None
    version: str | None = None

    risk_score: int
    threat_level: str

    permissions: list
    trackers: list
    urls: list
    certificates: dict
    findings: list
