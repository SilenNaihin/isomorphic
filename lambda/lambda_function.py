import json
from sklearn.decomposition import PCA


def lambda_handler(event, context):
    # Process POST request:
    # Load data from the "body" field of the incoming JSON
    body = json.loads(event["body"])
    data = body["data"]

    # Perform PCA
    pca = PCA(n_components=3)
    reduced_data = pca.fit_transform(data).tolist()

    print(reduced_data)

    response = {
        "statusCode": 200,
        "body": json.dumps(reduced_data),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # Allow from anywhere
            "Access-Control-Allow-Methods": "POST",  # Allow only POST request
        },
    }
    return response
