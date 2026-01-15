import pickle

# Load trained model and vectorizer
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)


def predict_news(text: str):
    """
    Predict fake/real news with confidence
    """
    vec = vectorizer.transform([text])
    prediction = model.predict(vec)[0]
    probability = model.predict_proba(vec)[0].max()

    verdict = "Real News" if prediction == 1 else "Fake News"

    return {
        "verdict": verdict,
        "confidence": round(probability * 100, 2),
        "explanation": (
            "Language patterns match verified news sources"
            if prediction == 1
            else "Sensational or misleading language detected"
        )
    }
