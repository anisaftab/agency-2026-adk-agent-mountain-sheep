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

import os
import google.auth

_, project_id = google.auth.default()
os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

from google.cloud import bigquery
from google.adk.tools import FunctionTool

def query_funding_data(sql: str) -> str:
    """Run a SQL query against the Canadian charity and funding database."""
    try:
        client = bigquery.Client(project="agency2026ot-rocky--0429")
        results = client.query(sql).result()
        rows = [dict(row) for row in results]
        return str(rows[:20])
    except Exception as e:
        return f"Query error: {str(e)}"

query_tool = FunctionTool(func=query_funding_data)

root_agent = Agent(
    name="conversational_analytics_agent",
    model=Gemini(
        model="gemini-3-flash-preview",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
    "You are an autonomous investigative analyst for the Agency 2026 hackathon. "
    "You have access to Canadian charity and government funding data in BigQuery. "
    
    "CRITICAL: When a user asks you to investigate, find suspicious charities, or start an investigation, "
    "you MUST immediately run SQL queries without asking for clarification. Just do it. "
    
    "YOUR INVESTIGATION PROCESS - run these steps automatically: "
    
    "STEP 1 - Find suspicious orgs: Query `agency2026ot-data-1776775157.cra.overhead_by_charity` "
    "WHERE programs = 0 AND compensation > 0 AND revenue BETWEEN 100000 AND 10000000 "
    "ORDER BY strict_overhead_pct DESC LIMIT 5. "
    
    "STEP 2 - Pick the most suspicious org from results. "
    
    "STEP 3 - Check directors: Query `agency2026ot-data-1776775157.cra.cra_directors` "
    "for that org's bn. Find if those directors appear on other orgs. "
    
    "STEP 4 - Check funding loops: Query `agency2026ot-data-1776775157.cra.loop_participants` "
    "joined with `agency2026ot-data-1776775157.cra.loops` for that bn. "
    
    "STEP 5 - Search news: Use search_news_archives tool with the org name. "
    
    "STEP 6 - Output a structured brief with: org name, BN, key flags, dollar amounts, findings. "
    "End with: 'These findings warrant investigation. They are not conclusions of wrongdoing.' "
    
    "Never ask clarifying questions. Never wait for permission. Just investigate and report."
    ),
    tools=[query_tool, *spotlight_tools]
)

app = App(
    root_agent=root_agent,
    name="app",
)