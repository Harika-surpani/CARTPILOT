import os
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "phase3"))
from app.services.multi_agent_pipeline import (
    RiskAgent, ReasonAgent, ActionAgent, PolicyAgent,
    MultiAgentPipeline, get_multi_agent_pipeline
)
