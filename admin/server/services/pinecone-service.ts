import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "some_api_key",
});

const indexName = process.env.PINECONE_INDEX_NAME || "logs-vectorized";

export async function searchLogs(query: string, topK = 10) {
  try {
    const index = pc.Index(indexName);

    // Generate embedding for the query using a simple approach
    // In production, use a proper embedding model
    const queryEmbedding = await generateEmbedding(query);

    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return formatLogsForDisplay(results);
  } catch (error) {
    console.error("Pinecone search error:", error);
    throw error;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  // Simple embedding generation - in production use proper embedding model
  // This is a placeholder that creates a deterministic vector
  const hash = text.split("").reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0);
  }, 0);

  const embedding = Array(1536)
    .fill(0)
    .map((_, i) => Math.sin(hash + i) * 0.1);

  return embedding;
}

function formatLogsForDisplay(results: any) {
  const matches = results.matches || [];

  return matches.slice(0, 10).map((match: any, index: number) => {
    const metadata = match.metadata || {};
    return {
      id: match.id,
      score: match.score,
      text: metadata.text || metadata.message || "",
      timestamp: metadata.timestamp || metadata.ts || "",
      service: metadata.service || metadata.svc || "",
      level: metadata.level || metadata.severity || "",
      index: index + 1,
    };
  });
}
