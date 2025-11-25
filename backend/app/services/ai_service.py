class AIService:
    async def classify_document(self, file_content: bytes):
        """
        Simulates document classification using a CNN.
        """
        # Mock classification
        return {
            "type": "CNI",
            "confidence": 0.98
        }

    async def generate_cv_suggestions(self, cv_data: dict):
        """
        Simulates AI suggestions for CV improvement.
        """
        return {
            "summary": "Consider adding more action verbs.",
            "skills": ["Python", "FastAPI", "React"]
        }

ai_service = AIService()
