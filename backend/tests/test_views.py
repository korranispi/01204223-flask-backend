from http import HTTPStatus
import pytest
from flask import g
from flask_jwt_extended.config import config

from models import TodoItem, User, db


# -------------------------------------------------
# Mock JWT
# -------------------------------------------------

@pytest.fixture(autouse=True)
def no_jwt(monkeypatch):
    """
    Mock verify_jwt_in_request เพื่อ bypass @jwt_required
    และใส่ identity ปลอมชื่อ test_user
    """
    def no_verify(*args, **kwargs):
        g._jwt_extended_jwt = {
            config.identity_claim_key: "test_user"
        }

    from flask_jwt_extended import view_decorators
    monkeypatch.setattr(view_decorators, "verify_jwt_in_request", no_verify)


# -------------------------------------------------
# Create test user automatically
# -------------------------------------------------

@pytest.fixture(autouse=True)
def create_test_user(app_context):
    user = User(
        username="test_user",
        full_name="Test User"
    )
    user.set_password("1234")

    db.session.add(user)
    db.session.commit()

    return user


# -------------------------------------------------
# Helper function to create todo
# -------------------------------------------------

def create_todo(title="Sample todo", done=False):
    user = User.query.filter_by(username="test_user").first()

    todo = TodoItem(
        title=title,
        done=done,
        user_id=user.id
    )

    db.session.add(todo)
    db.session.commit()

    return todo


# -------------------------------------------------
# Sample todos fixture
# -------------------------------------------------

@pytest.fixture
def sample_todo_items(app_context):
    todo1 = create_todo(title="Todo 1", done=False)
    todo2 = create_todo(title="Todo 2", done=True)
    return [todo1, todo2]


# -------------------------------------------------
# Tests
# -------------------------------------------------

def test_get_empty_todo_items(client):
    response = client.get("/api/todos/")
    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == []


def test_get_sample_todo_items(client, sample_todo_items):
    response = client.get("/api/todos/")
    assert response.status_code == HTTPStatus.OK

    assert response.get_json() == [
        todo.to_dict() for todo in sample_todo_items
    ]


def test_toggle_todo_item(client, sample_todo_items):
    item1, item2 = sample_todo_items

    response = client.patch(f"/api/todos/{item1.id}/toggle/")
    assert response.status_code == HTTPStatus.OK

    data = response.get_json()

    assert data["done"] is True
    assert TodoItem.query.get(item1.id).done is True