# Agency-2026

*This project was spun up for the [AI For Accountability Hackathon](https://github.com/GovAlta/agency-26-hackathon) (April 29, 2026).*

**Hackathon Context:** The hackathon focuses on Canadian government transparency and accountability research by unifying four major open data sources (Canada Revenue Agency T3010 Charity Data, Federal Grants & Contributions, and Alberta Open Data) into a single PostgreSQL database. The core challenge involves cross-dataset entity resolution to reconcile ~1 million source records into ~851,000 canonical organizations.

## Demo Screencast

![Demo Screencast](screencast.gif)

## What This Agent Does

This project features a **Sophisticated Conversational Analytics Agent** built with the Google Agent Development Kit (ADK) designed to act as an investigative researcher. It leverages LLMs (Gemini 3 Flash) to proactively aid transparency research by connecting raw financial and grant data to real-world impacts. 

To achieve the hackathon's "AI for Accountability" goals, the agent utilizes a combination of specialized analytical tools:

1. **BigQuery MCP Toolset**: The agent dynamically formulates and executes SQL queries through Model Context Protocol (MCP) to analyze the core hackathon datasets (`cra`, `fed`, `ab`, and `entity_golden_records`). This enables complex cross-referencing between federal grants, Alberta sole-source contracts, and charity tax filings to identify statistical anomalies or shell corporations.
2. **Spotlight Tools**: Specifically designed for investigating suspicious entities or charities flagged in the data:
   - `search_news_archives`: Automatically searches DuckDuckGo for news articles, fraud mentions, or controversies associated with an entity.
   - `load_web_page`: Cross-references a grant recipient's domain to verify if a multi-million dollar grant recipient actually possesses a functional website.

By unifying hard relational database querying with live web footprint analysis, the agent is capable of identifying true "shell entities"—where millions cross the books but no external media presence exists—scoring a significant win for public accountability.

### Learn More
* **[Design Specification](DESIGN_SPEC.md)**: Further details on the agent's core identity and technical architecture.
* **[Tool Ideas & Agent Capabilities](TOOL_IDEAS.md)**: Ideation for advanced agents and new MCP tools to uncover deeper fraud typologies.


## Running the demo

> **Note:** The `toolbox` executable is excluded from this repository. You must download it before running the demo.
> 
> ```bash
> # Download the MCP toolbox binary (Update URL to the appropriate distribution source)
> curl -sL https://storage.googleapis.com/your-tools-bucket/toolbox -o toolbox
> chmod +x toolbox
> ```

```bash

# in one terminal start mcp
export BIGQUERY_PROJECT=agency2026ot-data-nnnnnnnn
./toolbox --prebuilt bigquery

# in the other terminal
export BIGQUERY_PROJECT=agency2026ot-data-nnnnnnnn
gcloud auth application-default login
agents-cli playground

```

## Project Structure

Agent generated with `agents-cli` version `0.1.1`

```
agency-2026/
├── app/         # Core agent code
│   ├── agent.py               # Main agent logic
│   └── app_utils/             # App utilities and helpers
├── tests/                     # Unit, integration, and load tests
├── GEMINI.md                  # AI-assisted development guide
└── pyproject.toml             # Project dependencies
```

> 💡 **Tip:** Use [Gemini CLI](https://github.com/google-gemini/gemini-cli) for AI-assisted development - project context is pre-configured in `GEMINI.md`.

## Requirements

Before you begin, ensure you have:
- **uv**: Python package manager (used for all dependency management in this project) - [Install](https://docs.astral.sh/uv/getting-started/installation/) ([add packages](https://docs.astral.sh/uv/concepts/dependencies/) with `uv add <package>`)
- **agents-cli**: Agents CLI - Install with `uv tool install google-agents-cli`
- **Google Cloud SDK**: For GCP services - [Install](https://cloud.google.com/sdk/docs/install)


## Quick Start

Install required packages:

```bash
agents-cli install
```

Test the agent with a local web server:

```bash
agents-cli playground
```

You can also use features from the [ADK](https://adk.dev/) CLI with `uv run adk`.

## Commands

| Command              | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `agents-cli install` | Install dependencies using uv                                                         |
| `agents-cli playground` | Launch local development environment                                                  |
| `agents-cli lint`    | Run code quality checks                                                               |
| `uv run pytest tests/unit tests/integration` | Run unit and integration tests                                                        |

## 🛠️ Project Management

| Command | What It Does |
|---------|--------------|
| `agents-cli scaffold enhance` | Add CI/CD pipelines and Terraform infrastructure |
| `agents-cli infra cicd` | One-command setup of entire CI/CD pipeline + infrastructure |
| `agents-cli scaffold upgrade` | Auto-upgrade to latest version while preserving customizations |

---

## Development

Edit your agent logic in `app/agent.py` and test with `agents-cli playground` - it auto-reloads on save.

## Deployment

```bash
gcloud config set project <your-project-id>
agents-cli deploy
```

To add CI/CD and Terraform, run `agents-cli scaffold enhance`.
To set up your production infrastructure, run `agents-cli infra cicd`.

## Observability

Built-in telemetry exports to Cloud Trace, BigQuery, and Cloud Logging.
