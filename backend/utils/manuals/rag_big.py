import boto3
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from datetime import datetime
from tqdm import tqdm

import os

load_dotenv()

# Constants
MISTRAL_7B_MODEL_ID = os.getenv("MISTRAL_7B_MODEL_ID")         # 32k (ap-south-1) Mumbai
MISTRAL_7X8B_MODEL_ID = os.getenv("MISTRAL_7X8B_MODEL_ID")     # 32k (ap-south-1) Mumbai
MISTRAL_LARGE_MODEL_ID = os.getenv("MISTRAL_LARGE_MODEL_ID")   # 128k (us-west-2) Oregon
EMBEDDING_MODEL_ID = os.getenv("EMBEDDING_MODEL_ID")           # 512 (ap-south-1) Mumbai

bedrock_mumbai = boto3.client('bedrock-runtime', region_name='ap-south-1') # for Mumbai region usage
bedrock_oregon = boto3.client('bedrock-runtime', region_name='us-west-2') # for Oregon region usage

def generate_rag_response(logs, query, bedrock=bedrock_oregon):

    # Step 1: Embed Logs and Query using Bedrock
    print("Embedding log lines...")

    embedded_logs = []
    for log in tqdm(logs, desc="Embedding logs", unit="log"):
        embedded_logs.append(embed_text(log, input_type="search_document", truncate="END"))

    # Convert the query to an embedding
    print("Embedding query: ", query)
    embedded_query = embed_text(query, input_type="search_query", truncate="END")

    # Step 2: Perform Similarity Search
    print("Performing similarity search...")
    relevant_logs = perform_similarity_search(embedded_logs, embedded_query, logs)

    # Step 3: Generate Response using Bedrock
    print("Generating response...")
    # Prompt construction for the RAG model for using retrieved logs to answer users query for mistral 7b instruct model
    prompt = f'''
    You are an RAG system named *logrctx AI* for log analysis and given some extracted parts from logs as context through RAG system along with a question to answer.
    Prefer for visually appealing response and use time from the logs in your response if needed for concise response.
    Note that the logs in given context is reduced and will have count of occurence in eol in pattern like (xN) where N denotes number of times the log occured.
    Keep in mind not to talk about what the logs are, it's structure, what they mean or printing logs itself, but to answer the question using the logs by summarizing them.
    Also the provided below logs are the most relevant logs to the question asked but not all logs and these logs are internal to Swiggy.
    You're response should be helpful and informative.
    Logs: \n\n {relevant_logs} \n\n
    Question: *{query}*
    ''' 
    #print("Prompt: \n", prompt)
    response = bedrock.invoke_model(
        modelId=MISTRAL_LARGE_MODEL_ID,    # Mistral 7*8b Instruct
        body=json.dumps({"prompt": prompt}),  # Convert to JSON string
        contentType="application/json"
    )
    response_body = json.loads(response['body'].read())
    return response_body['outputs'][0]['text']

def embed_text(text, input_type, truncate, bedrock=bedrock_mumbai):
    # Prepare the correct input format for the embedding model
    body = json.dumps({
        "input_type": input_type,  # Choose from "search_document", "search_query", "classification", "clustering"
        #"texts": [text[:2000]],
        "texts": [middle_truncate(text, 2000)],
        "truncate": truncate  # Options: "NONE", "START", "END"
    })

    # Invoke the Bedrock model with the correct body format
    response = bedrock.invoke_model(
        modelId=EMBEDDING_MODEL_ID,    # Use the Cohere embedding model
        body=body,
        contentType="application/json"
    )
    
    # Extract the embedding from the response
    response_body = json.loads(response['body'].read())
    return response_body['embeddings'][0]  # Assuming embeddings are returned as a list

def perform_similarity_search(embedded_logs, embedded_query, original_logs):
    similarities = cosine_similarity([embedded_query], embedded_logs)
    best_indices = np.argsort(similarities[0])[-20:]  # Get top 10 relevant lines
    return "\n".join([original_logs[i][:2000] for i in best_indices]) # Truncate to 2000 characters in case of long logs

# Function to truncate a string in the middle
def middle_truncate(text, max_length=2000):
    """
    Truncate a string in the middle, keeping both the start and end parts.

    Args:
        text (str): The input text to be truncated.
        max_length (int): The maximum allowed length of the truncated string.

    Returns:
        str: The truncated string with the middle portion replaced by '...'.
    """
    if len(text) < max_length:
        return text
    
    # Calculate the length of the start and end parts to keep
    keep_length = max_length // 2
    start_part = text[:keep_length]
    end_part = text[-keep_length:]
    return start_part + " ... " + end_part
 

if __name__ == "__main__":

    # load logs from log file
    with open("drain_interocitor_2-2:01_0.1agg.log", "r") as file:
        logs = file.readlines()

    query = "Summarize and bring up any anomalies or insights in the logs that needs attention"

    print(generate_rag_response(logs, query))

