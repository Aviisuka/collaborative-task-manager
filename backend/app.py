from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
import pymysql

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MySQL Database Configuration (updating credentials)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Isukaptla%402105@localhost/Isukapatla'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True  # Enable logging of all SQL queries

# Initialize Database
db = SQLAlchemy(app)

# Define Task Model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default="To Do")

# Create Tables
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "Welcome to the Task Manager API!"

# # Route to test database connection using SQLAlchemy
# @app.route('/tasks', methods=['GET'])
# def get_tasks():
#     try:
#         tasks = Task.query.all()  # Query to get all tasks from the database
#         return jsonify([{"id": t.id, "title": t.title, "status": t.status} for t in tasks])
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500  # Return the error message if something goes wrong

# # Route to test database connection directly using PyMySQL
# @app.route('/test-db', methods=['GET'])
# @cross_origin()
# def test_db():
#     try:
#         connection = pymysql.connect(
#             host='localhost',
#             user='root',
#             password='Saikumar@2105',
#             database='Isukapatla'
#         )
#         with connection.cursor() as cursor:
#             cursor.execute("SELECT 1")
#             result = cursor.fetchone()
#             return jsonify({"result": result})  # Return result from direct database connection
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500  # If there's an error, return it as JSON
#     finally:
#         connection.close()  # Close the connection once done

# if __name__ == "__main__":
#     app.run(debug=True)
#     # Create tables if they don't exist before starting the Flask app
#     with app.app_context():
#         db.create_all()
#         if Task.query.count() == 0:  # Add tasks only if the database is empty
#                 sample_tasks = [
#                     Task(title="Complete UI for task list", status="In Progress"),
#                     Task(title="Create calendar placeholder", status="To Do"),
#                     Task(title="Connect backend with frontend", status="Done")
#                 ]
#                 db.session.add_all(sample_tasks)
#                 db.session.commit()
#                 print("Sample tasks added!")
#     # app.run(debug=True)
@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.order_by(Task.position).all()  
        return jsonify([{"id": t.id, "title": t.title, "description": t.description, "status": t.status, "position": t.position} for t in tasks])
    except Exception as e:
        # Log the exception details
        print(f"Error fetching tasks: {str(e)}")  # Print to console for debugging
        return jsonify({"error": "An error occurred while fetching tasks. Please try again later."}), 500

# ✅ POST - Create a new task
@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        new_task = Task(title=data["title"], description=data.get("description", ""), status=data.get("status", "To Do"), position=data.get("position", 0))
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Task created successfully", "task_id": new_task.id}), 201
    except Exception as e:
        print(f"Error creating task: {str(e)}")  # Print to console for debugging
        return jsonify({"error": "An error occurred while creating the task. Please try again later."}), 500

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

if __name__ == "__main__":
    app.run(debug=True)
