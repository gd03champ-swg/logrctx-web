from utils.loki_client import get_logs
from utils.drainer import reduce
from utils.auth import get_current_user
from fastapi import FastAPI, Request, Depends
from utils.rag import generate_rag_response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/reduce")
async def reduce_logs(request: Request, user: dict = Depends(get_current_user)):

    try:

        params = await request.json()

        # Logging the requests
        print("user: ", user.get("email"), " @ ", datetime.now(), " with ", params)

        service_name = params.get("service_name")
        pod = params.get("pod")
        start_time = params.get("start_time")
        end_time = params.get("end_time")
        redution_ratio = int(params.get("reduction_rate"))

        start_time = datetime.strptime(start_time, "%d-%m-%Y %H:%M:%S")
        end_time = datetime.strptime(end_time, "%d-%m-%Y %H:%M:%S")

        # Get logs from Loki
        print("Getting logs from Loki...")

        raw_logs = get_logs(service_name, pod, start_time, end_time)

        # Reduce logs with Drain3
        print("Reducing logs with Drain3...")
        reduced_logs, original_len, reduced_len = reduce(
                                                    raw_logs,
                                                    reduction_ratio=redution_ratio
                                                    )

        return {
            "message": "Logs reduced successfully!",
            "original_len": original_len,
            "reduced_len": reduced_len,
            "reduced_logs": reduced_logs
            }
    
    except Exception as e:

        #if isinstance(e, ZeroDivisionError):
        #    message = "No logs found for given time range."
        #    print(message)
        #    return {"message": message}
        
        print(e)
        return {"message": str(e)}
    
@app.post("/rag")
async def generate_rag(request: Request, user: dict = Depends(get_current_user)):

    try:
        params = await request.json()

        # Logging the requests
        print("user: ", user.get("email"), " @ ", datetime.now(), "requested rag analysis")

        logs = params.get("logs")
        query = params.get("query")

        response = generate_rag_response(logs, query, user.get("email"))

        return {"response": response}
    
    except Exception as e:

        print(e)
        return {"message": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)

