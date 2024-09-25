from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
from tqdm import tqdm

def drain_logs(logs, drain_sim_th=0.00001, target_reduction=0.15):
    # Set up Drain3 TemplateMiner
    config = TemplateMinerConfig()
    config.drain_sim_th = drain_sim_th
    config.profiling_enabled = False
    template_miner = TemplateMiner(config=config)

    unique_templates = {}
    log_counts = {}

    # Process logs with progress bar
    print(f"Processing {len(logs)} logs...")
    for log in tqdm(logs, desc="Processing logs", unit="log"):
        result = template_miner.add_log_message(log)
        template_id = result["cluster_id"]
        template_str = result["template_mined"]

        if template_id not in unique_templates:
            unique_templates[template_id] = template_str
            log_counts[template_id] = 1
        else:
            log_counts[template_id] += 1

    # Generate reduced logs with progress bar
    reduced_logs = []
    print("Generating reduced logs...")
    for template_id, template_str in tqdm(unique_templates.items(), desc="Reducing logs", unit="template"):
        count = log_counts[template_id]
        if count > 1:
            reduced_log = f"{template_str} (x{count})"
        else:
            reduced_log = template_str
        reduced_logs.append(reduced_log + "\n")

    # Check if the reduction is sufficient
    reduction_ratio = len(reduced_logs) / len(logs)
    print(f"Reduction ratio achieved: {reduction_ratio:.2f}")

    if reduction_ratio > target_reduction and drain_sim_th > 0:
        # If reduction is not sufficient and we can reduce further, recurse with lower similarity threshold
        print("Trying to reduce with lower similarity threshold...", drain_sim_th - 0.1)
        return drain_logs(logs, drain_sim_th - 0.1, target_reduction)
    else:
        return reduced_logs

def reduce(raw_logs, reduction_ratio=15):
    reduce_rate = reduction_ratio / 100
    reduced_logs = drain_logs(raw_logs, target_reduction=reduce_rate)
    return reduced_logs, len(raw_logs), len(reduced_logs)

def load_logs(file_path):
    print("Loading logs from file...")
    with open(file_path, 'r') as file:
        print("Logs loaded successfully.")
        return file.readlines()

def save_logs(file_path, logs):
    print("Saving logs to file...")
    with open(file_path, 'w') as file:
        print("Logs saved successfully.")
        for log in logs:
            file.write(log)

def reduce_from_file(input_file, output_file):
    logs = load_logs(input_file)
    reduced_logs = drain_logs(logs)
    save_logs(output_file, reduced_logs)
    return reduced_logs

if __name__ == "__main__":
    print("Reducing logs...")
    reduce_from_file(
        'logs/insight7_dash-enrichment-service/raw_dash-enrichment-service_12:30-12:45_1m.txt', 
        'logs/insight7_dash-enrichment-service/drain_dash-enrichment-service_12:30-12:45_1m_0.0001agg.log'
        )
    print("Logs reduced successfully.")
