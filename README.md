# BabyLex — Lexical Discovery in Child-Directed Speech

A small interactive tool exploring how infants might acquire their first words from child-directed speech (motherese), and why current language models don't learn language the way humans do.

🔗 **Live demo:** https://babylex.vercel.app

## What It Does

Give BabyLex a caregiver utterance like *"Look at the doggy! Big doggy!"* and it:

1. **Segments** the speech into candidate first words a pre-linguistic infant is most likely to acquire
2. **Scores** each word's learnability (1–10) based on length, stress, concreteness, and repetition
3. **Explains** why each word is learnable
4. **Speaks back** a caregiver's warm, contingent response — modelling how social feedback reinforces word learning

## The Research Question

Large language models learn language from billions of words of text. Human infants learn it from something completely different — warm, repetitive, socially-grounded caregiver speech tied to shared attention and the physical world.

BabyLex demonstrates two core challenges in grounded speech language modelling:

- **Lexical discovery** — how word boundaries and candidate words emerge from a continuous speech stream
- **Social grounding** — how caregiver contingent responses shape word-meaning mappings

Its key limitation is intentional and revealing: the model operates on text statistics alone, with no access to acoustic salience, prosodic stress, or shared visual attention — exactly the dimensions that multimodal speech language models aim to capture.

## Tech Stack

- **React** + **Vite** — frontend
- **Claude API** — speech segmentation and caregiver response generation
- **Web Speech API** — spoken caregiver feedback (motherese-style synthesis)
- **Recharts** — learnability visualisation
- **Vercel** — deployment (serverless API function)

## Running Locally

```bash
# Install dependencies
npm install

# Add your API key to a .env file
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Start the backend (terminal 1)
node server.js

# Start the frontend (terminal 2)
npm run dev
```

Open http://localhost:5173

## License

MIT