import time

# Simple in-memory analytics store

analytics = {
    "fakeNewsChecks": 0,
    "deepfakeChecks": 0,
    "phoneChecks": 0,
    "fakeDetected": 0,
    "deepfakeDetected": 0,
    "scamPhonesDetected": 0,
    "requests": []
}

def log_request(module, verdict):
    analytics["requests"].append({
        "module": module,
        "verdict": verdict,
        "timestamp": time.time()
    })

    if module == "fake_news":
        analytics["fakeNewsChecks"] += 1

        if verdict == "FAKE":
            analytics["fakeDetected"] += 1

    if module == "deepfake":
        analytics["deepfakeChecks"] += 1

        if verdict == "FAKE":
            analytics["deepfakeDetected"] += 1

    if module == "phone":
        analytics["phoneChecks"] += 1

        if verdict == "HIGH RISK":
            analytics["scamPhonesDetected"] += 1
