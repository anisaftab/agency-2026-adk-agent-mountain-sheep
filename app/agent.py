# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

from .spotlight_tools import spotlight_tools

import json
import os

import google.auth

_, project_id = google.auth.default()
project_id = (
    project_id
    or os.environ.get("GOOGLE_CLOUD_PROJECT")
    or os.environ.get("BIGQUERY_BILLING_PROJECT")
    or "agency2026ot-rocky--0429"
)
os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

from google.cloud import bigquery
from google.adk.tools import FunctionTool

DATA_PROJECT = os.environ.get("BIGQUERY_DATA_PROJECT", "agency2026ot-data-1776775157")
BILLING_PROJECT = os.environ.get("BIGQUERY_BILLING_PROJECT", project_id)


def query_funding_data(sql: str) -> str:
    """Run a SQL query against the Canadian charity and funding database."""
    try:
        client = bigquery.Client(project=BILLING_PROJECT)
        results = client.query(sql).result()
        rows = [dict(row) for row in results]
        return json.dumps(rows[:50], default=str)
    except Exception as e:
        return json.dumps({"error": f"Query error: {e!s}"})


query_tool = FunctionTool(func=query_funding_data)

GRAPH_RESPONSE_SCHEMA = """
Return exactly one JSON object with this shape and no markdown:
{
  "message": "short human-readable investigation summary for the chat bubble",
  "insights": [
    {
      "title": "finding title",
      "severity": "HIGH | MEDIUM | LOW",
      "summary": "why this matters",
      "evidence": ["concrete row values, dollar amounts, or tool observations"]
    }
  ],
  "graph": {
    "nodes": [
      {
        "id": "stable lowercase id with no spaces",
        "label": "organization or person name",
        "short": "short display label",
        "type": "org | director",
        "risk": "HIGH | MEDIUM | LOW | null",
        "bn": "business number or null",
        "flags": ["HIGH RISK", "ZERO PROGRAMS"],
        "brief": "one sentence tooltip/infobar summary"
      }
    ],
    "edges": [
      {
        "from": "source node id",
        "to": "target node id",
        "loop": false,
        "relation": "shared director | funding loop | grant | other",
        "amount": null
      }
    ]
  }
}
"""

root_agent = Agent(
    name="conversational_analytics_agent",
    model=Gemini(
        model="gemini-3-flash-preview",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
    "You are an autonomous investigative analyst for the Agency 2026 hackathon. "
    f"You have direct SQL access to Canadian charity and government funding data in BigQuery project `{DATA_PROJECT}`. "
    "Always fully qualify tables with that project id. "
    
    "CRITICAL: When a user asks you to search for an organization, investigate, find suspicious charities, or start an investigation, "
    "you MUST immediately run SQL queries without asking for clarification. Just do it. "
    
    "YOUR ORGANIZATION NETWORK PROCESS - run these steps automatically: "
    
    f"STEP 1 - Resolve the target organization: Query `{DATA_PROJECT}.cra.overhead_by_charity` "
    "by organization name, short name, or BN if the user provided one. If the user did not name an organization, "
    "find suspicious orgs WHERE programs = 0 AND compensation > 0 AND revenue BETWEEN 100000 AND 10000000 "
    "ORDER BY strict_overhead_pct DESC LIMIT 5 and pick the most suspicious org. "
    
    "STEP 2 - Fetch the selected organization's details: BN, name, revenue, compensation, programs, strict_overhead_pct, and any useful risk fields. "
    
    f"STEP 3 - Check directors: Query `{DATA_PROJECT}.cra.cra_directors` for that org's bn. "
    f"Then query `{DATA_PROJECT}.cra.cra_directors` joined back to `{DATA_PROJECT}.cra.overhead_by_charity` "
    "to find other charities connected to those same directors. Limit connected charities to the strongest 8 by risk or revenue. "
    
    f"STEP 4 - Check funding loops: Query `{DATA_PROJECT}.cra.loop_participants` "
    f"joined with `{DATA_PROJECT}.cra.loops` for that bn and any connected org bns. "
    
    "STEP 5 - Search news: Use search_news_archives tool with the org name. "
    
    "STEP 6 - Build graph nodes for the selected organization, its directors, connected organizations, and funding loop participants. "
    "Build edges for directorships, shared director links, and funding loops. Only include nodes and edges supported by tool results. "
    "Do not invent people, charities, BNs, amounts, or links. If no connections are found, return one org node and an insight explaining that. "
    "In the message, include: 'These findings warrant investigation. They are not conclusions of wrongdoing.' "
    
    "Never ask clarifying questions. Never wait for permission. Just investigate and report. "
    + GRAPH_RESPONSE_SCHEMA
    ),
    tools=[query_tool, *spotlight_tools]
)

app = App(
    root_agent=root_agent,
    name="app",
)