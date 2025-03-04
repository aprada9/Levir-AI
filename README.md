# 🚀 Levir AI - An AI-powered search engine 🔎 <!-- omit in toc -->

[![Discord](https://dcbadge.vercel.app/api/server/26aArMy8tT?style=flat&compact=true)](https://discord.gg/26aArMy8tT)


![preview](.assets/levir-ai-screenshot.png?)

## Table of Contents <!-- omit in toc -->

- [Overview](#overview)
- [Preview](#preview)
- [Features](#features)
- [Installation](#installation)
  - [Getting Started with Docker (Recommended)](#getting-started-with-docker-recommended)
  - [Non-Docker Installation](#non-docker-installation)
  - [Ollama Connection Errors](#ollama-connection-errors)
- [Using as a Search Engine](#using-as-a-search-engine)
- [Using Levir AI's API](#using-levir-ais-api)
- [Expose Levir AI to a network](#expose-levir-ai-to-network)
- [One-Click Deployment](#one-click-deployment)
- [Deployment to Production](#deployment-to-production)
  - [Deploying to Vercel](#deploying-to-vercel)
  - [Deploying to Render](#deploying-to-render)
- [Upcoming Features](#upcoming-features)
- [Support Us](#support-us)
  - [Donations](#donations)
- [Contribution](#contribution)
- [Help and Support](#help-and-support)

## Overview

Levir AI is an open-source AI-powered searching tool or an AI-powered search engine that goes deep into the internet to find answers. Inspired by Perplexity AI, it's an open-source option that not just searches the web but understands your questions. It uses advanced machine learning algorithms like similarity searching and embeddings to refine results and provides clear answers with sources cited.

Using SearxNG to stay current and fully open source, Levir AI ensures you always get the most up-to-date information without compromising your privacy.

Want to know more about its architecture and how it works? You can read it [here](https://github.com/alvarodeprada/Levir-AI/tree/master/docs/architecture/README.md).

## Preview

![video-preview](.assets/levir-ai-preview.gif)

## Features

- **Local LLMs**: You can make use local LLMs such as Llama3 and Mixtral using Ollama.
- **Two Main Modes:**
  - **Copilot Mode:** (In development) Boosts search by generating different queries to find more relevant internet sources. Like normal search instead of just using the context by SearxNG, it visits the top matches and tries to find relevant sources to the user's query directly from the page.
  - **Normal Mode:** Processes your query and performs a web search.
- **Focus Modes:** Special modes to better answer specific types of questions. Levir AI currently has 6 focus modes:
  - **All Mode:** Searches the entire web to find the best results.
  - **Writing Assistant Mode:** Helpful for writing tasks that does not require searching the web.
  - **Academic Search Mode:** Finds articles and papers, ideal for academic research.
  - **YouTube Search Mode:** Finds YouTube videos based on the search query.
  - **Wolfram Alpha Search Mode:** Answers queries that need calculations or data analysis using Wolfram Alpha.
  - **Reddit Search Mode:** Searches Reddit for discussions and opinions related to the query.
- **Current Information:** Some search tools might give you outdated info because they use data from crawling bots and convert them into embeddings and store them in a index. Unlike them, Levir AI uses SearxNG, a metasearch engine to get the results and rerank and get the most relevant source out of it, ensuring you always get the latest information without the overhead of daily data updates.
- **API**: Integrate Levir AI into your existing applications and make use of its capibilities.

It has many more features like image and video search. Some of the planned features are mentioned in [upcoming features](#upcoming-features).

## Installation

There are mainly 2 ways of installing Levir AI - With Docker, Without Docker. Using Docker is highly recommended.

### Getting Started with Docker (Recommended)

1. Ensure Docker is installed and running on your system.
2. Clone the Levir AI repository:

   ```bash
   git clone https://github.com/alvarodeprada/Levir-AI.git
   ```

3. After cloning, navigate to the directory containing the project files.

4. Rename the `sample.config.toml` file to `config.toml`. For Docker setups, you need only fill in the following fields:

   - `OPENAI`: Your OpenAI API key. **You only need to fill this if you wish to use OpenAI's models**.
   - `OLLAMA`: Your Ollama API URL. You should enter it as `http://host.docker.internal:PORT_NUMBER`. If you installed Ollama on port 11434, use `http://host.docker.internal:11434`. For other ports, adjust accordingly. **You need to fill this if you wish to use Ollama's models instead of OpenAI's**.
   - `GROQ`: Your Groq API key. **You only need to fill this if you wish to use Groq's hosted models**.
   - `ANTHROPIC`: Your Anthropic API key. **You only need to fill this if you wish to use Anthropic models**.

     **Note**: You can change these after starting Levir AI from the settings dialog.

   - `SIMILARITY_MEASURE`: The similarity measure to use (This is filled by default; you can leave it as is if you are unsure about it.)

5. Ensure you are in the directory containing the `docker-compose.yaml` file and execute:

   ```bash
   docker compose up -d
   ```

6. Wait a few minutes for the setup to complete. You can access Levir AI at http://localhost:3000 in your web browser.

**Note**: After the containers are built, you can start Levir AI directly from Docker without having to open a terminal.

### Non-Docker Installation

1. Install SearXNG and allow `JSON` format in the SearXNG settings.
2. Clone the repository and rename the `sample.config.toml` file to `config.toml` in the root directory. Ensure you complete all required fields in this file.
3. Rename the `.env.example` file to `.env` in the `ui` folder and fill in all necessary fields.
4. After populating the configuration and environment files, run `npm i` in both the `ui` folder and the root directory.
5. Install the dependencies and then execute `

## Deployment to Production

Levir AI can be deployed to production environments like Vercel and Render. This section provides guidance on how to set up your environment for production deployment.

### Environment Variables

For production deployments, all configuration is managed through environment variables rather than the `config.toml` file. Refer to the `.env.example` file in the project root for a complete list of required environment variables.

The key environment variables you need to configure include:

- `OPENAI_API_KEY` - Your OpenAI API key
- `SEARXNG_API_URL` - URL to your SearxNG instance
- `PORT` - The port for your API server
- `SIMILARITY_MEASURE` - The similarity measure to use for search
- `DATABASE_URL` - Connection string for your PostgreSQL database
- Other model API keys (GROQ, ANTHROPIC, GEMINI, etc.)

### Deploying to Vercel

To deploy the frontend (Next.js) to Vercel:

1. Fork the Levir AI repository
2. Connect your forked repository to Vercel
3. Configure the environment variables in Vercel project settings
4. Set the build command to:
   ```
   cd ui && npm install && npm run build
   ```
5. Set the output directory to:
   ```
   ui/.next
   ```
6. Deploy the project

### Deploying to Render

For deploying the API server on Render:

1. Create a new Web Service on Render
2. Connect your repository
3. Configure the service with the following settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all the required environment variables from `.env.example`
4. Deploy the service

**Important Notes:**
- You will need to deploy a SearxNG instance separately or use an existing one
- For production use, ensure you have proper database setup with Supabase
- Configure CORS settings appropriately to allow communication between frontend and backend
- Set up proper authentication for production environments

## Upcoming Features

- **Image and Video Search:** Add image and video search capabilities.
- **Advanced Focus Modes:** Implement more advanced focus modes for specific types of questions.
- **Customizable Search:** Allow users to customize their search experience.
- **Real-Time Updates:** Implement real-time updates for search results.
- **User Feedback:** Implement user feedback mechanisms to improve search accuracy.

## Support Us

If you find Levir AI useful and want to support its development, consider donating to the project.

### Donations

- **GitHub Sponsors:** If you're using GitHub, you can sponsor the project on GitHub.
- **PayPal:** You can donate via PayPal.
- **Crypto:** You can donate via cryptocurrency.

## Contribution

We welcome contributions from the community. If you're interested in contributing, please follow these steps:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

## Help and Support

If you need help or have any questions, please feel free to reach out to us.

- **GitHub Issues:** If you encounter any issues, please open an issue on GitHub.
- **Discord:** You can join our Discord server for support.
- **Email:** You can email us at [contact@levir.ai](mailto:contact@levir.ai).