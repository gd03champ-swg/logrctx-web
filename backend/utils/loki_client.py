import requests
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

def get_logs(service_name, pod, start_time, end_time, log_cap=5000):
    # Parameters for the query
    params = {
        'query': f'{{service="{service_name}"}}',
        'start': int(start_time.timestamp() * 1e9),  # Convert to nanoseconds
        'end': int(end_time.timestamp() * 1e9),      # Convert to nanoseconds
        'limit': log_cap,
        'direction': 'forward'
    }

    # Headers for the query
    headers = {
        'X-Scope-OrgId': pod
    }

    # Make the GET request to Loki
    response = requests.get(url, headers=headers, params=params)

    # Check the response
    if response.status_code == 200:
        data = response.json()
        count = 0
        raw_logs = []

        for stream in data['data']['result']:
            for entry in stream['values']:
                timestamp, log_line = entry
                # Convert timestamp from nanoseconds to a human-readable format
                readable_timestamp = datetime.utcfromtimestamp(int(timestamp) / 1e9).strftime('%d %b %Y %H:%M:%S')
                formatted_log_line = f"[{readable_timestamp}] {log_line}\n"
                raw_logs.append(formatted_log_line)
                count += 1
                #print(formatted_log_line, end='')  # Print to console
    
    # Recursively reduce log cap if 413 status code is returned
    elif response.status_code == 413:
        new_log_cap = log_cap - 500
        print(f"Log cap exceeded. Reducing log cap to {new_log_cap} and retrying...")
        return get_logs(service_name, pod, start_time, end_time, new_log_cap)

    else:
        raise RuntimeError(f"{response.status_code} - {response.text}")

    # Print the number of log entries written to the file
    print(f"Total log entries written: {count}")
    return raw_logs

# Loki URL
url = os.getenv("LOKI_URL") + "/loki/api/v1/query_range"

# Example usage
if __name__ == "__main__":

    service_name = "sand-scube"
    pod = "ugc"
    start_time = datetime(2024, 8, 12, 5, 20)
    end_time = datetime(2024, 8, 12, 5, 30)

    # Get logs from Loki
    get_logs(service_name, pod, start_time, end_time)