from fastapi import FastAPI  # the web framework
from fastapi.middleware.cors import CORSMiddleware  # allows frontend to call this service
from routers.index import router  # all routes collected in one place
from settings import settings  # env config

app = FastAPI(title=settings.app_name)  # create the app instance

# allow requests from the frontend origins defined in .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),  # comma-separated string → list
    allow_methods=["*"],  # allow all HTTP methods
    allow_headers=["*"],  # allow all headers
)

app.include_router(router)  # mount all routes
