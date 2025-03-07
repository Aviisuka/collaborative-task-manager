from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
import pymysql
from flask_migrate import Migrate  


# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MySQL Database Configuration (updating credentials)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/Isukapatla'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True  # Enable logging of all SQL queries

# Initialize Database
db = SQLAlchemy(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Define Task Model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default="To Do")
    position = db.Column(db.Integer, nullable=False, default=0)
    startDate = db.Column(db.DateTime, nullable=True)  
    endDate = db.Column(db.DateTime, nullable=True)   

# Create Tables
# @app.before_first_request
def create_tables():
    db.create_all()
    if Task.query.count() == 0:  # Add sample tasks if none exist
        sample_tasks = [
            Task(title="Complete project setup", description="Finish Flask and SQL setup", status="In Progress"),
            Task(title="Create frontend UI", description="Develop task list and calendar views", status="To Do"),
            Task(title="Test database connection", description="Ensure Flask connects to MySQL", status="Done"),
        ]
        db.session.add_all(sample_tasks)
        db.session.commit()
        print("✅ Sample tasks added!")
# Route for homepage
@app.route('/')
def home():
    return "Welcome to the Task Mbreanager API!"
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
            "startDate": t.startDate.isoformat() if t.startDate else None,  
            "endDate": t.endDate.isoformat() if t.endDate else None        
        } for t in tasks])
    except Exception as e:
        print(f"Error fetching tasks: {str(e)}")
        return jsonify({"error": "An error occurred while fetching tasks."}), 500

@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        new_task = Task(
            title=data["title"],
            description=data.get("description", ""),
            status=data.get("status", "To Do"),
            position=data.get("position", 0),
            startDate=data.get("startDate"),  
            endDate=data.get("endDate")     
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Task created successfully", "task_id": new_task.id}), 201
    except Exception as e:
        print(f"Error creating task: {str(e)}")
        return jsonify({"error": "An error occurred while creating the task. Please try again later."}), 500

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
        task.startDate = data.get("startDate", task.startDate) 
        task.endDate = data.get("endDate", task.endDate)        
        db.session.commit()
        return jsonify({"message": "Task updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ✅ Reorder tasks based on drag-and-drop
@app.route('/tasks/reorder', methods=['PUT'])
def reorder_tasks():
    try:
        data = request.json
        for task_data in data['tasks']:
            task = Task.query.get(task_data['id'])
            if task:
                task.position = task_data['position']
        db.session.commit()
        return jsonify({"message": "Tasks reordered successfully"}), 200
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

if __name__ == "__main__":
    app.run(debug=True)
