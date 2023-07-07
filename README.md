# Isomorphic

## Description

Isomorphic is a visualization tool designed to simplify exploration of high-dimensional data. Explore your Pinecone embeddings using a web-based UI to project and interact with a readily understandable 3D view. Key features include:

- Exploration of individual data points. Metadata can be chosen to be included
- PCA reduction for graphing using a AWS Lambda function
- Viewing strati and positions of points in the latent space by similarity

The graph is preloaded with a demo Pinecone index featuring embeddings for over 400 poems from authors like Shakespeare.

## Usage

How to start exploring your embeddings

**1. Access the Application:**
Visit [Isomorphic](https://isomorphic-alpha.vercel.app/)

**2. View the graph and the example queries:**
There are preloaded queries already present in the graph that loads based on poems.

**3. Query the example index:**
Chat with the example embeddings. When you send a message, relevant queries are drawn from Pinecone and reduced using PCA in order to graph.

**4. Use your own Pinecone index:**
Select custom embeddings from the dropdown and enter your index information. When you click submit, the previous messages will be used to query this graph.

**5. Change who interacts with the latent space:**

You can change who you're chatting to and view the prompt by clicking on 'William Shakespeare' and changing the name.

## Installation

Isomorphic is an open-source project, and we welcome contributions. To set up the project locally:

1. Clone the repository: `git clone <repository_url>`
2. Navigate into the project directory: `cd isomorphic`
3. Install the dependencies: `npm install`
4. Copy the environment file and populate the necessary fields: `cp .env.example .env`. Note: For the `REDUCTION_FUNCTION_URL`, you will need a route that can handle PCA. If you need help with this, feel free to send us a message.

## Get Help

Happy to help out, just message me via [Twitter](https://twitter.com/silennai)
