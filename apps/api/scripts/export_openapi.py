"""Exporta o schema OpenAPI (o mesmo do /docs) para apps/api/openapi.json.

Esse arquivo é o contrato entre a API e o front: o Kubb lê ele para gerar
tipos, client, hooks e mocks em packages/api-client.
Roda sem Postgres: usa SQLite em memória só para conseguir importar o app.
"""
import json
import os
import sys
from pathlib import Path

API_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API_DIR))
os.environ["DATABASE_URL"] = "sqlite://"

from app.main import app  # noqa: E402

out = API_DIR / "openapi.json"
out.write_text(
    json.dumps(app.openapi(), indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
    newline="\n",
)
print(f"OpenAPI exportado em {out}")
