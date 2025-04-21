import requests
import re


MODEL = "google/gemini-pro"

from api_keys import API_KEYS

def get_valid_headers():
    for key in API_KEYS:
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        try:
            # ✅ Make a test request with current headers
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={
                    "model": "google/gemini-pro",
                    "messages": [{"role": "user", "content": "ping"}]
                },
                timeout=10
            )
            if response.status_code == 200:
                return headers
        except:
            continue
    raise Exception("All API keys failed.")


def clean_summary(summary):
    """
    Clean the raw summary by removing markdown, bullets, and HTML artifacts.
    """
    # Remove markdown headers like ## or #
    summary = re.sub(r"#+", "", summary)

    # Remove bold markers (e.g. **text**)
    summary = re.sub(r"\*\*(.*?)\*\*", r"\1", summary)

    # Remove italic markers (e.g. *text*)
    summary = re.sub(r"\*(.*?)\*", r"\1", summary)

    # Remove stray asterisks used as bullet points
    summary = re.sub(r"^\s*\*\s*", "- ", summary, flags=re.MULTILINE)

    # Remove stray HTML tags and chatty lines
    summary = re.sub(r"I hope this summary.|<\s*/?\s*(p|h[1-6]|li|ul)\s*>", "", summary, flags=re.IGNORECASE)

    # Normalize whitespace
    summary = re.sub(r"\n{2,}", "\n\n", summary)
    return summary.strip()


def summarize_with_llm(chunks, summary_length="medium"):
    """
    Summarize a research paper using the Gemini API with varying lengths.
    """
    if summary_length == "short":
        prompt = (
            "Summarize the following research paper in 1-2 short sentences:\n\n"
            + "\n---\n".join(chunks[:5])
        )
    elif summary_length == "medium":
        prompt = (
            "Summarize the following research paper in 2-3 short paragraphs:\n\n"
            + "\n---\n".join(chunks[:8])
        )
    elif summary_length == "long":
        prompt = (
            "Summarize the following research paper in 6-8 paragraphs, covering all the key points:\n\n"
            + "\n---\n".join(chunks[:15])
        )
    else:
        prompt = (
            "Summarize the following research paper in 2-3 short paragraphs:\n\n"
            + "\n---\n".join(chunks[:5])
        )

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You summarize academic papers."},
            {"role": "user", "content": prompt}
        ]
    }
    headers = get_valid_headers()
    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        raw_summary = response.json()["choices"][0]["message"]["content"]
    except (requests.RequestException, KeyError, IndexError) as e:
        return f"Error summarizing the paper: {str(e)}"

    cleaned = clean_summary(raw_summary)
    return format_summary(cleaned)

def ask_question(question, top_chunks):
    """
    Answer a question based on research paper excerpts using the Gemini API.
    """

    # Keywords for short, factual questions
    short_prompt_keywords = ["title", "author", "journal", "date", "conference"]
    if any(k in question.lower() for k in short_prompt_keywords):
        prompt = (
            f"Please provide a short and direct answer to the following question based on the paper excerpts.\n\n"
            f"Question: {question}\n\n"
            f"Excerpts:\n" +
            "\n---\n".join(top_chunks)
        )
    else:
        prompt = (
            f"Based on the excerpts of a research paper provided below, please answer the following question clearly "
            f"and organize your response using appropriate section headings (e.g., 'Disadvantages:', 'Advantages:', etc.). "
            f"Use bullet points where applicable.\n\n"
            f"Question: {question}\n\n"
            f"Excerpts:\n" +
            "\n---\n".join(top_chunks)
        )

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant for reading academic papers."},
            {"role": "user", "content": prompt}
        ]
    }
    headers = get_valid_headers()
    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        raw_answer = response.json()["choices"][0]["message"]["content"]
    except (requests.RequestException, KeyError, IndexError) as e:
        return f"Error answering the question: {str(e)}"

    return format_summary(clean_summary(raw_answer))

def format_summary(summary):
    """
    Format the cleaned summary into plain text with structured sections.
    """
    sections = re.split(r"(?<=\):\s)", summary)

    formatted = ""

    for section in sections:
        section = section.strip()
        if not section:
            continue

        # Match sections with headings
        match = re.match(r"([A-Za-z\s]+):\s*(.*)", section, re.DOTALL)
        if match:
            key, content = match.groups()
            key = key.strip()
            content = content.strip()
            formatted += f"{key}\n"
            # Clean up lines
            lines = [line.strip() for line in content.split("\n") if line.strip()]
            for line in lines:
                if line.startswith("-") or line.startswith("•"):
                    formatted += f"  - {line[1:].strip()}\n"  # Handling bullet points
                else:
                    formatted += f"{line}\n\n"
        else:
            lines = [line.strip() for line in section.split("\n") if line.strip()]
            for line in lines:
                if line.startswith("-") or line.startswith("•"):
                    formatted += f"  - {line[1:].strip()}\n"  # Handling bullet points
                else:
                    formatted += f"{line}\n\n"

    return formatted.strip()
