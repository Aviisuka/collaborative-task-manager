from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_session import Session
from datetime import datetime, timedelta
import pymysql

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure session
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# MySQL Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Saikumar%402105@localhost/Isukapatla'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True  # Enable logging of all SQL queries

# Initialize Database
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define Task Model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default="To Do")
    position = db.Column(db.Integer, nullable=False, default=0)
    startDate = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # Default to current time
    endDate = db.Column(db.DateTime, nullable=False, default=datetime.utcnow )  # Default to tomorrow

# Define User Model for Authentication
class User(db.Model):   
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# Create Tables
def create_tables():
    with app.app_context():
        db.create_all()
        print("✅ Database and tables created successfully!")

# Home Route
@app.route('/')
def home():
    return "Welcome to the Task Manager API!"

# ✅ GET - Fetch all tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.order_by(Task.position).all()
        return jsonify([{
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "position": t.position,
            "startDate": t.startDate.isoformat() if t.startDate else datetime.utcnow().isoformat(),
            "endDate": t.endDate.isoformat() if t.endDate else (datetime.utcnow() + timedelta(days=1)).isoformat(),
        } for t in tasks])
    except Exception as e:
        print(f"Error fetching tasks: {str(e)}")
        return jsonify({"error": "An error occurred while fetching tasks."}), 500

# ✅ POST - Create a new task
@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        new_task = Task(
            title=data["title"],
            description=data.get("description", ""),
            status=data.get("status", "To Do"),
            position=data.get("position", 0),
            startDate=data.get("startDate", datetime.utcnow()),  # Default to current time
            endDate=data.get("endDate", datetime.utcnow() + timedelta(days=1)),  # Default to tomorrow
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Task created successfully", "task_id": new_task.id}), 201
    except Exception as e:
        print(f"Error creating task: {str(e)}")
        return jsonify({"error": "An error occurred while creating the task."}), 500

# ✅ PUT/PATCH - Update an existing task
@app.route('/tasks/<int:task_id>', methods=['PUT', 'PATCH'])
def update_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        data = request.json
        task.title = data.get("title", task.title)
        task.description = data.get("description", task.description)
        task.status = data.get("status", task.status)
        db.session.commit()
        return jsonify({"message": "Task updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ DELETE - Delete a task
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    with app.app_context():
        # Check if tables already exist
        if not db.engine.has_table("task"):
            db.create_all()
            print("✅ Database and tables created successfully!")
    app.run(debug=True)
