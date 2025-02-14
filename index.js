
const express = require('express');
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');
const cors = require('cors');
const app = express();
app.use(cors());

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_NAME = "meta-llama/Llama-2-7b-hf"; // Change to your model

const hf = new HfInference(HF_TOKEN);

// Endpoint for Flutter Flow
app.get('/proxy', async (req, res) => {
    try {
        const serpResponse = await axios.get("https://serpapi.com/search", {
            params: { ...req.query, api_key: process.env.SERPAPI_KEY },
        });
        res.json(serpResponse.data);
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
    res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
