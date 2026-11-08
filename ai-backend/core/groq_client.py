from groq import Groq
from settings import settings

# single shared Groq client — instantiated once, reused across all services
client = Groq(api_key=settings.groq_api_key)
