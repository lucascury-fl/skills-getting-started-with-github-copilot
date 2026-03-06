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
    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 200
    assert "Signed up" in response.json().get("message", "")

# Test: Sign up for a non-existent activity

def test_signup_activity_not_found():
    # Arrange
    activity = "Nonexistent Club"
    email = "student@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 404
    assert response.json().get("detail") == "Activity not found"

# Test: Sign up with missing email

def test_signup_missing_email():
    # Arrange
    activity = "Chess Club"
    # Act: call the real endpoint without the required `email` query parameter
    response = client.post(f"/activities/{activity}/signup")
    # Assert
    assert response.status_code == 422
    body = response.json()
    assert any("email" in error.get("loc", []) for error in body.get("detail", []))

# Test: Unregister a student from an activity

def test_unregister_activity_success():
    # Arrange: sign up first, then unregister
    activity = "Science Club"
    email = "temp_student@mergington.edu"
    client.post(f"/activities/{activity}/signup?email={email}")
    # Act
    response = client.delete(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 200
    assert "Unregistered" in response.json().get("message", "")

# Test: Activity capacity enforcement

def test_signup_activity_full():
    # Arrange: use an activity with a low cap and fill it up
    activity = "Debate Team"
    # Debate Team starts with 1 participant and has max 16; fill remaining 15 spots
    existing_response = client.get("/activities")
    debate = existing_response.json().get(activity, {})
    current_count = len(debate.get("participants", []))
    max_p = debate.get("max_participants", 16)
    for i in range(max_p - current_count):
        client.post(f"/activities/{activity}/signup?email=filler{i}@mergington.edu")
    # Act: try to sign up one more student
    response = client.post(f"/activities/{activity}/signup?email=overflow@mergington.edu")
    # Assert
    assert response.status_code == 409
    assert "full" in response.json().get("detail", "").lower()
