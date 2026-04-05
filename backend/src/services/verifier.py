"""
Image Verification Service

Calls the verifier-model Flask API to:
1. Classify whether an image is an accident or not (+ confidence %)
2. Detect if an image is AI-generated

The verifier Flask app runs on port 5000 by default.
"""

import logging
from pathlib import Path

import httpx

from src.config.settings import settings

logger = logging.getLogger(__name__)

VERIFIER_URL = settings.VERIFIER_URL
VERIFY_TIMEOUT = 30.0  # seconds


async def verify_image(image_path: str | Path) -> dict:
    """Send an image to the verifier-model /predict endpoint.
    
    Returns a dict with:
        - image_url: the original image URL
        - is_accident: bool
        - accident_confidence: float (0-1)
        - label: "Accident" or "Non Accident"
        - ai_generated: bool | None (None if unavailable)
        - ai_generated_confidence: float | None
        - ai_generated_label: str | None
        - error: str | None (if verification failed)
    """
    image_path = Path(image_path)
    
    if not image_path.exists():
        logger.warning("Image file not found: %s", image_path)
        return {
            "image_url": str(image_path),
            "error": "Image file not found",
        }

    try:
        async with httpx.AsyncClient(timeout=VERIFY_TIMEOUT) as client:
            with open(image_path, "rb") as f:
                files = {"image": (image_path.name, f, "image/jpeg")}
                response = await client.post(
                    f"{VERIFIER_URL}/predict",
                    files=files,
                )

            if response.status_code != 200:
                logger.warning(
                    "Verifier returned %d for %s: %s",
                    response.status_code, image_path.name, response.text,
                )
                return {
                    "image_url": str(image_path),
                    "error": f"Verifier returned HTTP {response.status_code}",
                }

            data = response.json()
            
            result = {
                "is_accident": data.get("is_accident_model_1", False),
                "accident_confidence": round(data.get("accident_probability", 0.0) * 100, 1),
                "label": data.get("label", "Unknown"),
            }
            
            # AI-generated detection results
            if "ai_generated_prediction" in data:
                result["ai_generated"] = bool(data["ai_generated_prediction"])
                result["ai_generated_confidence"] = round(
                    data.get("ai_generated_score", 0.0) * 100, 1
                )
                result["ai_generated_label"] = data.get("ai_generated_label", "Unknown")
            elif data.get("ai_generated_check") == "unavailable":
                result["ai_generated"] = None
                result["ai_generated_confidence"] = None
                result["ai_generated_label"] = "Check unavailable"
            else:
                result["ai_generated"] = None
                result["ai_generated_confidence"] = None
                result["ai_generated_label"] = "Not checked (non-accident)"

            return result

    except httpx.ConnectError:
        logger.warning("Cannot connect to verifier service at %s", VERIFIER_URL)
        return {
            "error": "Verifier service unavailable",
        }
    except Exception as e:
        logger.exception("Verification failed for %s", image_path)
        return {
            "error": str(e),
        }


async def verify_task_images(
    proof_urls: list[str],
    upload_root: Path,
) -> list[dict]:
    """Verify all proof images for a task.
    
    Args:
        proof_urls: List of URL paths like "/uploads/proofs/{task_id}/{filename}"
        upload_root: The root uploads directory (e.g. backend/uploads/)
    
    Returns:
        List of verification result dicts, one per image.
    """
    results = []
    
    for url in proof_urls:
        # Convert URL path to filesystem path
        # url format: /uploads/proofs/{task_id}/{filename}
        relative = url.lstrip("/")  # "uploads/proofs/{task_id}/{filename}"
        # upload_root is the "uploads" directory, so strip the "uploads/" prefix
        if relative.startswith("uploads/"):
            relative = relative[len("uploads/"):]
        
        file_path = upload_root / relative
        
        result = await verify_image(file_path)
        result["image_url"] = url
        results.append(result)
    
    return results
