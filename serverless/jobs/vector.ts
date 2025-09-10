import { Pinecone } from '@pinecone-database/pinecone';
import type { DenseEmbedding, SparseEmbedding } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/inference';
import { fetchLogs } from './inject';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_SECRET!
});

const indexName = 'logs-vectorized';

type http_logs = {
  service: string,
  host: string,
  pid: number,
  requestId: string,
  method: string,
  path: string,
  status: number,
  latencyMs: number,
  ip: string,
  userAgent: string,
  responseSize: number,
  cpuLoad: number,
  memoryMb: number,
  heapUsedMb: number,
  uptimeSec: number,
  level: string,
};

interface DenseVectorEmbedding extends DenseEmbedding {
  values: number[];
  vectorType: "dense";
}

interface SparseVectorEmbedding extends SparseEmbedding {
  values: number[];
  vectorType: "sparse";
}

type EmbeddingV2 = DenseVectorEmbedding | SparseVectorEmbedding;

export const persistInVectorStore = async (logs: http_logs[]) => {
  const index = pc.index(indexName);
  const model = 'llama-text-embed-v2';

  const inputs = logs.map(
    (log) =>
      `Service: ${log.service}, Host: ${log.host}, Path: ${log.path}, Method: ${log.method}, Status: ${log.status}, UA: ${log.userAgent}, Level: ${log.level}`
  );

  const embeddingResponse = await pc.inference.embed(model, inputs, {
    inputType: "passage",
  }) as {
    data: EmbeddingV2[]
  };

  const records = logs.map((log, i) => ({
    id: log.requestId || `${log.service}-${log.pid}-${Date.now()}-${i}`,
    values: embeddingResponse.data[i].values,
    metadata: {
      service: log.service,
      host: log.host,
      pid: log.pid,
      method: log.method,
      path: log.path,
      status: log.status,
      latencyMs: log.latencyMs,
      ip: log.ip,
      userAgent: log.userAgent,
      responseSize: log.responseSize,
      cpuLoad: log.cpuLoad,
      memoryMb: log.memoryMb,
      heapUsedMb: log.heapUsedMb,
      uptimeSec: log.uptimeSec,
      level: log.level,
      timestamp : new Date().toISOString()
    },
  }));

  await index.upsert(records);
  console.log(`✅ ${records.length} log vectors upserted into Pinecone!`);
};

export const vectorJob = async () => {
  const { inventory_logs, order_logs } = await fetchLogs()
  console.log("Populating vector store!")
  Promise.all([
    await persistInVectorStore(inventory_logs),
    await persistInVectorStore(order_logs)
  ])
}