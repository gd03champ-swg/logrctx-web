import requests
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

def get_logs(service_name, start_time, end_time, error_logs_only, log_cap=10000):

    # Construct the base query
    query = f'{{service="{service_name}"}}'

    # If error_logs_only is True, modify the query to fetch only error logs
    if error_logs_only:
        # Assuming the log level for errors is stored under the 'level' label
        query += ' |= "error"'

    # Parameters for the query
    params = {
        'query': query,
        'start': int(start_time.timestamp() * 1e9),  # Convert to nanoseconds
        'end': int(end_time.timestamp() * 1e9),      # Convert to nanoseconds
        'limit': log_cap,
        'direction': 'forward'
    }

    print("Params: ", params)

    # Make the GET request to Loki
    response = requests.get(url, params=params)

    # Check the response
    if response.status_code == 200:
        print("Logs fetched successfully.")
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
        
        if count == 0:
            raise RuntimeError("No logs found for given time range.")
    
    # Recursively reduce log cap if 413 status code is returned
    elif response.status_code == 413:
        new_log_cap = log_cap - 500
        print(f"Log cap exceeded. Reducing log cap to {new_log_cap} and retrying...")
        return get_logs(service_name, start_time, end_time, error_logs_only, new_log_cap)

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
    start_time = datetime(2024, 8, 12, 5, 20)
    end_time = datetime(2024, 8, 12, 5, 30)

    # Get logs from Loki
    get_logs(service_name, start_time, end_time)