// app/api/semanticAnalysis/route.js
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export async function POST(req) {
  const { text1, text2, threshold } = await req.json();

  console.log('Image Text:', text1);
  console.log('Training Title:', text2);

  try {
    // Load the Universal Sentence Encoder model
    const model = await use.load();

    // Get embeddings for the input texts
    const embeddings = await model.embed([text1, text2]);

    // Calculate similarity score
    const similarityScore = calculateCosineSimilarity(embeddings.arraySync()[0], embeddings.arraySync()[1]);
    const similarityPercentage = parseFloat((similarityScore * 100).toFixed(2));
    const matchQuality = similarityPercentage >= threshold ? "Acceptable Match" : "Poor Match";

    return new Response(JSON.stringify({
      score: similarityPercentage,
      matchQuality,
      threshold: threshold,
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error during semantic analysis:", error);
    return new Response(JSON.stringify({
      message: "An error occurred during semantic analysis.",
      error: error.message,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Function to calculate cosine similarity
function calculateCosineSimilarity(vecA, vecB) {
  const dotProduct = tf.dot(tf.tensor(vecA), tf.tensor(vecB));
  const normA = tf.norm(tf.tensor(vecA));
  const normB = tf.norm(tf.tensor(vecB));
  return dotProduct.div(normA.mul(normB)).dataSync()[0]; // Return similarity score
}