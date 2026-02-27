from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from flask_bcrypt import generate_password_hash, check_password_hash


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


# -------------------------
# User Model
# -------------------------

class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # relationship → Todo
    todos: Mapped[list["TodoItem"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)


# -------------------------
# Todo Model
# -------------------------

class TodoItem(db.Model):
    __tablename__ = "todo_item"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    done: Mapped[bool] = mapped_column(Boolean, default=False)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"),
        nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="todos")

    comments: Mapped[list["Comment"]] = relationship(
        back_populates="todo",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "done": self.done,
            "comments": [comment.to_dict() for comment in self.comments]
        }


# -------------------------
# Comment Model
# -------------------------

class Comment(db.Model):
    __tablename__ = "comment"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    message: Mapped[str] = mapped_column(String(250), nullable=False)

    todo_id: Mapped[int] = mapped_column(
        ForeignKey("todo_item.id"),
        nullable=False
    )

    todo: Mapped["TodoItem"] = relationship(back_populates="comments")

    def to_dict(self):
        return {
            "id": self.id,
            "message": self.message,
            "todo_id": self.todo_id
        }