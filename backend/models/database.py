from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# ✅ MySQL Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/Test'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ Initialize the database
db = SQLAlchemy(app)

# ✅ Task model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default="To Do")
    position = db.Column(db.Integer, nullable=False, default=0)
    startDate = db.Column(db.DateTime, nullable=True)
    endDate = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.String(20), default="Medium")  # High, Medium, Low
    progress = db.Column(db.Integer, default=0)

    # Relationship to Subtask
    subtasks = db.relationship('Subtask', backref='task', cascade="all, delete-orphan", lazy=True)

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    position = db.Column(db.Integer, nullable=False, default=0)

class User(db.Model):   
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# ✅ Create tables in the database
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Database and tables created successfully!")





