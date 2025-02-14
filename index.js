
const express = require('express');
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_NAME = "meta-llama/Llama-2-7b-hf"; // Change to your model

const hf = new HfInference(HF_TOKEN);

// Endpoint for Flutter Flow
app.post('/process', async (req, res) => {
    try {
        const { input } = req.body;

        // Step 1: Call SerpAPI
        const serpApiUrl = `https://serpapi.com/search.json?q=${input}&api_key=${SERPAPI_KEY}`;
        const serpResponse = await axios.get(serpApiUrl);
        const serpOutput = serpResponse.data.organic_results[0].snippet || "No result found";

        // Step 2: Send SerpAPI Output to Llama Model
        const hfResponse = await hf.textGeneration({
            model: MODEL_NAME,
            inputs: serpOutput,
            parameters: { max_new_tokens: 100 }
        });

        // Step 3: Return Llama Output to Flutter Flow
        res.json({ result: hfResponse.generated_text });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
