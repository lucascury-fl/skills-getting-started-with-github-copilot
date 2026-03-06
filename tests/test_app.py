import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

# Test: List activities

def test_list_activities():
    # Arrange
    # (client is already set up)
    # Act
    response = client.get("/activities")
    # Assert
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

# Test: Sign up for an activity

def test_signup_activity_success():
    # Arrange
    activity = "Chess Club"
    email = "newstudent@mergington.edu"
    payload = {"activity": activity, "email": email}
    # Act
    response = client.post("/signup", json=payload)
    # Assert
    assert response.status_code == 200 or response.status_code == 201
    assert "success" in response.json().get("message", "")

# Test: Sign up for a non-existent activity

def test_signup_activity_not_found():
    # Arrange
    activity = "Nonexistent Club"
    email = "student@mergington.edu"
    payload = {"activity": activity, "email": email}
    # Act
    response = client.post("/signup", json=payload)
    # Assert
    assert response.status_code == 404
    assert "not found" in response.json().get("detail", "")

# Test: Sign up with missing email

def test_signup_missing_email():
    # Arrange
    activity = "Chess Club"
    payload = {"activity": activity}
    # Act
    response = client.post("/signup", json=payload)
    # Assert
    assert response.status_code == 422
