from flask import Flask, jsonify, request
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
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/Test'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False  # Disable SQL query logging

# Initialize Database
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define Models
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default="To Do")
    position = db.Column(db.Integer, nullable=False, default=0)
    startDate = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    endDate = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    priority = db.Column(db.String(20), default="Medium")
    progress = db.Column(db.Integer, default=0)

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

# Routes
@app.route('/')
def home():
    return "Welcome to the Task Manager API!"

@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.order_by(Task.position).all()
        return jsonify([{
            "id": t.id,
            "title": t.title,
            "description": t.description or "",
            "status": t.status,
            "position": t.position,
            "startDate": t.startDate.isoformat() if t.startDate else None,
            "endDate": t.endDate.isoformat() if t.endDate else None,
            "priority": t.priority,
            "progress": t.progress
        } for t in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        new_task = Task(
            title=data["title"],
            description=data.get("description", ""),
            status=data.get("status", "To Do"),
            position=data.get("position", 0),
            startDate=datetime.fromisoformat(data.get("startDate")) if data.get("startDate") else datetime.utcnow(),
            endDate=datetime.fromisoformat(data.get("endDate")) if data.get("endDate") else datetime.utcnow() + timedelta(days=1),
            priority=data.get("priority", "Medium"),
            progress=data.get("progress", 0)
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Task created successfully", "task_id": new_task.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        data = request.json
        if 'title' in data: task.title = data['title']
        if 'description' in data: task.description = data['description']
        if 'status' in data: task.status = data['status']
        if 'priority' in data: task.priority = data['priority']
        if 'progress' in data: task.progress = data['progress']
        if 'endDate' in data:
            task.endDate = datetime.fromisoformat(data['endDate'])
        
        db.session.commit()
        return jsonify({"message": "Task updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        # Delete associated subtasks first
        Subtask.query.filter_by(task_id=task_id).delete()
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Subtask routes
@app.route('/tasks/<int:task_id>/subtasks', methods=['GET'])
def get_subtasks(task_id):
    try:
        subtasks = Subtask.query.filter_by(task_id=task_id).order_by(Subtask.position).all()
        return jsonify([{
            "id": s.id,
            "title": s.title,
            "description": s.description or "",
            "completed": s.completed,
            "position": s.position
        } for s in subtasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tasks/<int:task_id>/subtasks', methods=['POST'])
def create_subtask(task_id):
    try:
        data = request.json
        new_subtask = Subtask(
            title=data["title"],
            description=data.get("description", ""),
            task_id=task_id,
            completed=data.get("completed", False),
            position=data.get("position", 0)
        )
        db.session.add(new_subtask)
        db.session.commit()
        return jsonify({"message": "Subtask created successfully", "subtask_id": new_subtask.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/subtasks/<int:subtask_id>', methods=['PUT'])
def update_subtask(subtask_id):
    try:
        subtask = Subtask.query.get(subtask_id)
        if not subtask:
            return jsonify({"error": "Subtask not found"}), 404
        
        data = request.json
        if 'completed' in data: subtask.completed = data['completed']
        if 'title' in data: subtask.title = data['title']
        
        db.session.commit()
        return jsonify({"message": "Subtask updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/subtasks/<int:subtask_id>', methods=['DELETE'])
def delete_subtask(subtask_id):
    try:
        subtask = Subtask.query.get(subtask_id)
        if not subtask:
            return jsonify({"error": "Subtask not found"}), 404
        
        db.session.delete(subtask)
        db.session.commit()
        return jsonify({"message": "Subtask deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tasks/<int:task_id>/progress', methods=['PUT'])
def update_task_progress(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        data = request.json
        if 'progress' not in data:
            return jsonify({"error": "Progress value required"}), 400
            
        progress = int(data['progress'])
        if progress < 0 or progress > 100:
            return jsonify({"error": "Progress must be between 0 and 100"}), 400
            
        task.progress = progress
        db.session.commit()
        return jsonify({"message": "Progress updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
