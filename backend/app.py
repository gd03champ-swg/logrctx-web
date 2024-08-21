from utils.loki_client import get_logs
from utils.drainer import reduce
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's origin if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/reduce")
async def reduce_logs(request: Request):

    try:
        params = await request.json()

        service_name = params.get("service_name")
        pod = params.get("pod")
        start_time = params.get("start_time")
        end_time = params.get("end_time")

        start_time = datetime.strptime(start_time, "%d-%m-%Y %H:%M:%S")
        end_time = datetime.strptime(end_time, "%d-%m-%Y %H:%M:%S")

        # Get logs from Loki
        print("Getting logs from Loki...")
        raw_logs = get_logs(service_name, pod, start_time, end_time)

        # Reduce logs with Drain3
        print("Reducing logs with Drain3...")
        reduced_logs, original_len, reduced_len = reduce(raw_logs)

        return {
            "message": "Logs reduced successfully!",
            "original_len": original_len,
            "reduced_len": reduced_len,
            "reduced_logs": reduced_logs
            }
    
    except Exception as e:
        print(e)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)

