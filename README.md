# BabyLex

**An interactive research demo exploring how children learn words — from segmenting speech to grounding meaning in the visual world.**

🔗 **Live demo:** [babylex.vercel.app](https://babylex.vercel.app)

BabyLex is built to make the research questions behind *multimodal and socially-grounded speech language models* tangible and explorable. It is an interactive demonstration, not a model trained from scratch: the speech analysis is LLM-assisted, and the visual grounding runs on OpenAI's pretrained CLIP model.

---

## What it does

BabyLex has two connected parts, each illustrating a different challenge in early language acquisition.

### 1. Lexical segmentation & social feedback
Type (or pick) a caregiver utterance — for example, *"Look at the doggy! Big doggy!"* — and BabyLex:
- highlights the candidate words a learner might pull out of the continuous speech stream,
- scores each word for "learnability,"
- and generates a simulated caregiver social response, spoken aloud via the Web Speech API.

This part is intentionally **text-only**, which exposes its own limitation: it has no access to acoustic salience, prosody, or what the words actually *refer to*.

### 2. Visual grounding (live CLIP model)
This is the piece that closes that gap. Upload an image of an object, list a few candidate words, and a live **CLIP vision-language model** scores how strongly each word grounds in the image — mapping word and picture into a shared embedding space. Show it a photo of an apple, and *"apple"* wins at ~99.9%.

Together, the two parts demonstrate the move from **statistical** to **visually grounded** word learning.

---

## Architecture

```
React + Vite frontend (Vercel)
      │
      ├── POST /api/analyze ──▶ serverless function (LLM-based segmentation + caregiver response)
      │
      └── POST /ground ──────▶ FastAPI + CLIP service (Hugging Face Space, Docker)
                                      │
                                      └── openai/clip-vit-base-patch32
```

- **Frontend:** React, Vite, JavaScript, axios, Recharts
- **Segmentation backend:** Node serverless function (`/api/analyze`)
- **Grounding backend:** FastAPI + PyTorch + Hugging Face Transformers (CLIP), containerized with Docker and deployed on a Hugging Face Space

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, JavaScript, axios, Recharts, Web Speech API |
| Segmentation API | Node / serverless function |
| Grounding API | Python, FastAPI, PyTorch (CPU), Hugging Face Transformers, CLIP |
| Deployment | Vercel (frontend), Hugging Face Spaces / Docker (CLIP backend) |

---

## Running locally

### Frontend
```bash
npm install
npm run dev
```
Opens at `http://localhost:5173`.

### CLIP grounding backend
The grounding service lives in its own folder (`ml-backend/`). To run it locally:
```bash
cd ml-backend
python -m venv venv
venv\Scripts\activate          # Windows (use source venv/bin/activate on macOS/Linux)
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install fastapi "uvicorn[standard]" transformers pillow
uvicorn app:app --reload --port 7860
```
In development the frontend automatically targets `http://localhost:7860`. In production it points to the deployed Hugging Face Space.

---

## Why this project

The most interesting open problems in language acquisition sit at the boundary between what a model can infer from *patterns in text* and what it can only learn by being *grounded in the world* — through vision, social interaction, and shared attention. BabyLex is a small, hands-on way to see that boundary in action.

---

## Author

**Sohini Roy Chowdhury** · [github.com/SohiniRC-bit](https://github.com/SohiniRC-bit)