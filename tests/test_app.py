import copy
import urllib.parse

import pytest
from fastapi.testclient import TestClient

from src.app import app, activities


client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_activities():
    orig = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(copy.deepcopy(orig))


def quote(name: str) -> str:
    return urllib.parse.quote(name, safe="")


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_presence():
    email = "pytest_user@example.com"
    activity = quote("Chess Club")
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert "Signed up" in resp.json().get("message", "")

    resp2 = client.get("/activities")
    participants = resp2.json()["Chess Club"]["participants"]
    assert email in participants


def test_unregister():
    email = "to_remove@example.com"
    activity = quote("Chess Club")
    # ensure participant exists
    client.post(f"/activities/{activity}/signup?email={email}")

    resp = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp.status_code == 200
    assert "Unregistered" in resp.json().get("message", "")

    resp2 = client.get("/activities")
    participants = resp2.json()["Chess Club"]["participants"]
    assert email not in participants
