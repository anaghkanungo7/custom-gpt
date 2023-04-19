import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);



const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({message: 'Hello World!'});
});

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const apiKey = req.body.apiKey;

        const systemMessage = {
            role: 'system',
            content: 'You are a chatbot. Answer questions'
        }
        console.log(prompt);


        // Improve prompt

        const firstPrompt = {
            role: 'user',
            content: `Write a more detailed and well articulated question prompt under 50 words to give to a large language model for this prompt: ${prompt}. Include the details AND CODE given in the original prompt. If no details are given, make up your own.`
        }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [systemMessage, firstPrompt],
            temperature: 1,
            // apiKey: apiKey
        });

        let improvedMessage = response.data.choices[0].message.content;
        console.log("reached till here!!");
        console.log(improvedMessage);

        // Generate final message
        const finalPrompt = {
            role: 'user',
            content: improvedMessage
        }

        const response2 = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [systemMessage, finalPrompt],
            temperature: 0.8,
            // apiKey: apiKey
        });

        let finalMessage = response2.data.choices[0].message.content;
        console.log(finalMessage);


        res.status(200).send({
            bot: finalMessage
          });

    }

    catch (error) {
        res.status(500).send(error || 'Something went wrong');
    }
});

app.listen(5000, () => {console.log('server is running on  http://localhost:5000')});
