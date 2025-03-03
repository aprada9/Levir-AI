# Levir AI's Architecture

Levir AI's architecture consists of the following key components:

1. **User Interface**: A web-based interface that allows users to interact with Levir AI for searching images, videos, and much more.
2. **Agent/Chains**: These components predict Levir AI's next actions, understand user queries, and decide whether a web search is necessary.
3. **SearXNG**: A metadata search engine used by Levir AI to search the web for sources.
4. **LLMs (Large Language Models)**: Utilized by agents and chains for tasks like understanding content, writing responses, and citing sources. Examples include Claude, GPTs, etc.
5. **Embedding Models**: To improve the accuracy of search results, embedding models re-rank the results using similarity search algorithms such as cosine similarity and dot product distance.

For a more detailed explanation of how these components work together, see [WORKING.md](https://github.com/alvarodeprada/Levir-AI/tree/master/docs/architecture/WORKING.md).
