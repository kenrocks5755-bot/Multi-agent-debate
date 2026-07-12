from ddgs import DDGS


def search_web(query: str, max_results: int = 5) -> str:
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
    except Exception:
        return ""

    if not results:
        return ""

    formatted = "Web search results:\n\n"
    for i, r in enumerate(results, 1):
        formatted += f"{i}. {r['title']}\n{r['body']}\n{r['href']}\n\n"

    return formatted
