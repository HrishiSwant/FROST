import torch
import torchvision.transforms as transforms
from torchvision.models import efficientnet_b0
from PIL import Image
import numpy as np

# Load model ONCE
model = efficientnet_b0(pretrained=True)
model.classifier[1] = torch.nn.Linear(1280, 2)

model.load_state_dict(
    torch.load("deepfake/efficientnet_weights.pth", map_location="cpu")
)

model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def detect_deepfake(image_bytes: bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        confidence, prediction = torch.max(probs, 1)

    return {
        "verdict": "FAKE" if prediction.item() == 1 else "REAL",
        "confidence": round(confidence.item() * 100, 2)
    }
