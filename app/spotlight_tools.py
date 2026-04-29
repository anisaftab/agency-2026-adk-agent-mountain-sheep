from ddgs import DDGS
from google.adk.tools import FunctionTool
from google.adk.tools.load_web_page import load_web_page


def search_news_archives(entity_name: str, max_results: int = 5) -> list[dict[str, str]]:
    """
    Search web and news archives for mentions of a specific entity (charity, contractor, non-profit).
    Useful for verifying if an entity has a real-world footprint or any historical red flags in the news.

    Args:
        entity_name: The name of the organization or individual to search for.
        max_results: The maximum number of search results to return.
    """
    try:
        results = []
        with DDGS() as ddgs:
            # We use text search aiming at news/media mentions
            query = f'"{entity_name}" (news OR controversy OR fraud OR contract OR charity)'
            for r in ddgs.text(query, max_results=max_results):
                results.append(
                    {
                        "title": r.get("title", ""),
                        "snippet": r.get("body", ""),
                        "href": r.get("href", ""),
                    }
                )

        if not results:
            return [
                {
                    "warning": (
                        f"No significant web presence or news found for "
                        f"'{entity_name}'. Could be a shell entity."
                    )
                }
            ]

        return results
    except Exception as e:
        return [{"error": f"Failed to search news archives: {e!s}"}]


# Wrap our functions as ADK FunctionTools
search_news_archives_tool = FunctionTool(func=search_news_archives)

# load_web_page is already an ADK tool, but we can re-export it or use it together with our custom tools
spotlight_tools = [search_news_archives_tool, load_web_page]
