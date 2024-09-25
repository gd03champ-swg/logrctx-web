import requests
from datetime import datetime, timedelta
import pytz
from dotenv import load_dotenv
import os
import time
from tqdm import tqdm

load_dotenv()

def datetime_to_nanoseconds(dt):
    """Convert datetime object to nanoseconds since epoch."""
    return int(dt.timestamp() * 1e9)

def nanoseconds_to_datetime(ns):
    """Convert nanoseconds to datetime object."""
    seconds = ns // 1_000_000_000
    nanoseconds = ns % 1_000_000_000
    return datetime.utcfromtimestamp(seconds).replace(tzinfo=pytz.UTC) + timedelta(microseconds=nanoseconds // 1000)

def get_total_log_count(service_name, start_time_ns, end_time_ns):
    """Query Loki to get the total count of log lines in the given time range."""
    params = {
        'query': f'count_over_time({{service="{service_name}"}}[{end_time_ns - start_time_ns}ns])',
        'start': start_time_ns,
        'end': end_time_ns,
    }

    response = requests.get(url.replace('query_range', 'query'), params=params)

    if response.status_code == 200:
        data = response.json()
        print("Total log count query response: ", data)
        if data['data']['result']:
            return int(data['data']['result'][0]['value'][1])
    
    return None

def get_logs(service_name, start_time_ns, end_time_ns, log_cap=10000):
    params = {
        'query': f'{{service="{service_name}"}}',
        'start': start_time_ns,
        'end': end_time_ns,
        'limit': log_cap,
        'direction': 'forward'
    }

    print(f"Fetching logs from {nanoseconds_to_datetime(start_time_ns)} to {nanoseconds_to_datetime(end_time_ns)} (UTC)")
    print("Params: ", params)

    response = requests.get(url, params=params)

    if response.status_code == 200:
        print("Logs fetched successfully.")
        data = response.json()
        raw_logs = []
        latest_timestamp = None

        for stream in data['data']['result']:
            for entry in stream['values']:
                timestamp, log_line = entry
                timestamp = int(timestamp)
                if latest_timestamp is None or timestamp > latest_timestamp:
                    latest_timestamp = timestamp
                readable_timestamp = nanoseconds_to_datetime(timestamp).strftime('%Y-%m-%d %H:%M:%S.%f %Z')
                formatted_log_line = f"[{readable_timestamp}] {log_line}\n"
                raw_logs.append(formatted_log_line)
        
        print(f"Total log entries fetched in this batch: {len(raw_logs)}")
        print(f"Latest timestamp: {latest_timestamp}")
        return raw_logs, latest_timestamp

    elif response.status_code == 413:
        new_log_cap = log_cap - 500
        print(f"Log cap exceeded. Reducing log cap to {new_log_cap} and retrying...")
        return get_logs(service_name, start_time_ns, end_time_ns, new_log_cap)

    else:
        raise RuntimeError(f"{response.status_code} - {response.text}")

def fetch_all_logs(service_name, start_time, end_time, file_name, log_cap=10000):
    all_logs = []
    current_start_time_ns = datetime_to_nanoseconds(start_time)
    end_time_ns = datetime_to_nanoseconds(end_time)
    total_time_range = end_time_ns - current_start_time_ns
    
    total_log_count = get_total_log_count(service_name, current_start_time_ns, end_time_ns)
    print(f"Total log count in the given time range: {total_log_count if total_log_count is not None else 'Unknown'}")
    
    with tqdm(total=100, desc="Overall Progress", unit="%") as pbar:
        while current_start_time_ns < end_time_ns:
            logs, latest_timestamp = get_logs(service_name, current_start_time_ns, end_time_ns, log_cap)
            
            # Update logs to file immediately
            with open(file_name, 'a') as f:
                f.writelines(logs)
            
            all_logs.extend(logs)

            if not logs or latest_timestamp is None:
                print("No more logs found or reached the end of the time range.")
                break

            # Use the latest timestamp from the retrieved logs as the new start time
            current_start_time_ns = latest_timestamp + 1

            # Update progress bar
            progress = min(100, int((current_start_time_ns - datetime_to_nanoseconds(start_time)) / total_time_range * 100))
            pbar.update(progress - pbar.n)

            print(f"Current time: {datetime.now(pytz.UTC).strftime('%Y-%m-%d %H:%M:%S %Z')}")
            print(f"Fetched {len(logs)} logs, total logs so far: {len(all_logs)}")

            # stop if fetched log lines are more than 100,000
            if len(all_logs) >= 700000:
                print("Fetched more than 10,00,000 logs. Stopping.")
                print(f"Actual time range of fetched logs: {start_time} to {nanoseconds_to_datetime(current_start_time_ns)}")
                break

            print(f"Next batch starts from {nanoseconds_to_datetime(current_start_time_ns)}")

            if current_start_time_ns >= end_time_ns:
                print("Reached or exceeded the end time. Stopping.")
                break

            # Add a small delay to avoid overwhelming the API
            time.sleep(1)

    print(f"Total logs fetched: {len(all_logs)}")
    if total_log_count is not None:
        print(f"Percentage of logs fetched: {(len(all_logs) / total_log_count) * 100:.2f}%")
    return all_logs

# Loki URL
url = os.getenv("LOKI_URL") + "/loki/api/v1/query_range"

# Example usage
if __name__ == "__main__":
    service_name = "core-pricing-service"
    start_time = datetime(2024, 9, 24, 12, 30, tzinfo=pytz.UTC)
    end_time = datetime(2024, 9, 24, 12, 45, tzinfo=pytz.UTC)

    fileName = f"logs/insight8_{service_name}/raw_{service_name}_{start_time.strftime('%H:%M')}-{end_time.strftime('%H:%M')}_1m.txt"

    # Clear the log file before starting
    open(fileName, 'w').close()

    all_logs = fetch_all_logs(service_name, start_time, end_time, fileName)

    print(f"Log fetching complete. All logs have been written to {fileName}")

