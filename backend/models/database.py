from flask_sqlalchemy import SQLAlchemy
from flask import Flask

app = Flask(__name__)

# MySQL Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Saikumar%402105@localhost/Isukapatla/task'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

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

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    position = db.Column(db.Integer, nullable=False, default=0)
# Create the database and tables
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Database and tables created successfully!")
