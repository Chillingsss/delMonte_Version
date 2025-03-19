// api/semanticpoints/route.js
import * as tf from "@tensorflow/tfjs";
import * as useModel from "@tensorflow-models/universal-sentence-encoder";

let model = null;

// Load the model once to avoid multiple downloads
const loadModel = async () => {
  if (!model) {
    await tf.ready();
    model = await useModel.load();
  }
};

// Function to calculate cosine similarity
const cosineSimilarity = (vec1, vec2) => {
  const dotProduct = vec1.reduce((sum, a, idx) => sum + a * vec2[idx], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
  return dotProduct / (magnitude1 * magnitude2);
};

export async function POST(req) {
  await loadModel();
  const { resume, jobDescription } = await req.json();

  if (!resume || !jobDescription) {
    return Response.json({ error: "Missing resume or job description" }, { status: 400 });
  }

  const resumeEmbedding = await model.embed([resume]);
  const jobEmbedding = await model.embed([jobDescription]);

  const resumeVector = resumeEmbedding.arraySync()[0];
  const jobVector = jobEmbedding.arraySync()[0];

  const similarity = cosineSimilarity(resumeVector, jobVector);
  
  return Response.json({ similarity });
}
