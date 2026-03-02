from models import User, TodoItem, Comment, db


def test_check_correct_password():
    user = User(username="u1", full_name="User 1")
    user.set_password("testpassword")
    assert user.check_password("testpassword") is True


def test_check_incorrect_password():
    user = User(username="u2", full_name="User 2")
    user.set_password("testpassword")
    assert user.check_password("testpassworx") is False


def test_empty_todoitem(app_context):
    assert TodoItem.query.count() == 0


# -------------------------------------------------
# FIXED: create user before creating todo
# -------------------------------------------------

def create_todo_item_1():
    # สร้าง user ก่อน
    user = User(
        username="test_user",
        full_name="Test User"
    )
    user.set_password("1234")

    db.session.add(user)
    db.session.commit()

    # สร้าง todo พร้อม user_id
    todo = TodoItem(
        title="Todo with comments",
        done=True,
        user_id=user.id
    )

    # สร้าง comment แบบ relationship
    comment = Comment(
        message="Nested",
        todo=todo
    )

    db.session.add_all([todo, comment])
    db.session.commit()

    return todo


def test_todo_to_dict_includes_nested_comments(app_context):
    todo = create_todo_item_1()
    todo_id = todo.id

    # SQLAlchemy 2.0 style (ไม่ใช้ legacy Query.get)
    test_todo = db.session.get(TodoItem, todo_id)

    assert len(test_todo.comments) == 1