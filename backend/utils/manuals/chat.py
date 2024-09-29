import boto3
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

# Load model IDs from .env file
MISTRAL_7B_MODEL_ID = "mistral.mistral-7b-instruct-v0:2"         # 32k (ap-south-1) Mumbai
MISTRAL_7X8B_MODEL_ID = "mistral.mixtral-8x7b-instruct-v0:1"     # 32k (ap-south-1) Mumbai

# Initialize the Bedrock client for the Mumbai region
bedrock = boto3.client('bedrock-runtime', region_name='ap-south-1')

def create_user_message(text):
    """Creates a message object for the user."""
    return {
        "role": "user",
        "content": [
            {"text": text}
        ]
    }

def create_assistant_message(text):
    """Creates a message object for the assistant."""
    return {
        "role": "assistant",
        "content": [
            {"text": text}
        ]
    }


def generate_conversation(
        bedrock_client, 
        model_id,
        system_prompts, 
        messages
        ):

    # Inference parameters to control generation behavior
    inference_config = {"temperature": 0.5}
    additional_model_fields = {"top_k": 200}

    print("Generating message with model:", model_id)

    # Start conversation loop
    while True:
        # Send conversation history to the model
        response = bedrock_client.converse(
            modelId=model_id,
            #system=system_prompts, Mistral doesn't support system instruction
            messages=messages,
            inferenceConfig=inference_config,
            additionalModelRequestFields=additional_model_fields
        )

        # Extract and display the assistant's response
        output_message = response['output']['message']['content'][0]['text']
        print("\nBot:", output_message)

        # Append assistant's response to the conversation history
        messages.append(create_assistant_message(output_message))

        # Get user input for the next round
        user_input = input("\nYou: ")

        # Exit the loop if the user types 'exit' or 'quit'
        if user_input.lower() in ['exit', 'quit']:
            print("Ending conversation.")
            break

        # Append user's input to the conversation history
        messages.append(create_user_message(user_input))


if __name__ == "__main__":

    # Setup the system prompts and messages to send to the model.
    system_prompts = [{"text": "You are an AI system named JARVIS,"
                       "you are build to help users with their queries and provide useful information."}]

    # Initial conversation history
    messages = [
        create_user_message("Hey JARVIS"),
    ]
    
    # Start conversation
    generate_conversation(bedrock, MISTRAL_7B_MODEL_ID, system_prompts, messages)