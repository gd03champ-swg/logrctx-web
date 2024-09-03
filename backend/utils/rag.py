import boto3
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from datetime import datetime

import os

load_dotenv()

# Initialize Bedrock client
bedrock = boto3.client('bedrock-runtime', region_name='ap-south-1')

# Constants
LLM_MODEL_ID = os.getenv("LLM_MODEL_ID")
EMBEDDING_MODEL_ID = os.getenv("EMBEDDING_MODEL_ID")


def generate_rag_response(logs, query, user_email):

    # Step 1: Embed Logs and Query using Bedrock
    print("Embedding log lines...")
    embedded_logs = []
    count = 0
    for log in logs:
        embedded_logs.append(embed_text(log, input_type="search_document", truncate="END"))
        count += 1
        print(f"Embedded {count} log lines...", end="\r")
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
    Keep the response concise and to the point while not leaving any important information out.
    Use only the following pieces of context to answer the question at the end. Don't hallucinate or add any extra information.
    Note that the the logs in given context is reduced and will have count of occurence in eol in pattern like (xN) where N denotes number of times the log occured.
    Keep in mind not to talk about what the logs are, it's structure, what they mean or printing logs itself, but to answer the question using the logs by summarizing them.
    Also the provided below logs are the most relevant logs to the question asked but not all logs and these logs are internal to Swiggy.
    Logs: \n\n {relevant_logs} \n\n
    Question: *{query}*
    User: *{user_email}*
    Date Now: *{datetime.now()}*
    You're response should be helpful and informative to the user and will be directly sent to the user.
    '''
    #print("Prompt: \n", prompt)
    response = bedrock.invoke_model(
        modelId=LLM_MODEL_ID,    # Mistral 7b Instruct
        body=json.dumps({"prompt": prompt}),  # Convert to JSON string
        contentType="application/json"
    )
    response_body = json.loads(response['body'].read())
    return response_body['outputs'][0]['text']

def embed_text(text, input_type, truncate):
    # Prepare the correct input format for the embedding model
    body = json.dumps({
        "input_type": input_type,  # Choose from "search_document", "search_query", "classification", "clustering"
        "texts": [text[:2000]],
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
    best_indices = np.argsort(similarities[0])[-10:]  # Get top 10 relevant lines
    return "\n".join([original_logs[i][:2000] for i in best_indices]) # Truncate to 2000 characters in case of long logs


if __name__ == "__main__":

    # load logs from log file
    with open("../logs/raw.log", "r") as file:
        logs = file.readlines()

    query = "Summarize me all and bring up anything that needs attention."

    print(generate_rag_response(logs, query))

