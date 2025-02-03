from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import pymysql

# Initialize Flask app
app = Flask(__name__)

# MySQL Database Configuration (updating credentials)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:%402105@localhost/Isukapatla'
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

# Route to test database connection using SQLAlchemy
@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()  # Query to get all tasks from the database
        return jsonify([{"id": t.id, "title": t.title, "status": t.status} for t in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return the error message if something goes wrong

# Route to test database connection directly using PyMySQL
@app.route('/test-db', methods=['GET'])
def test_db():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='Saikumar@2105',
            database='Isukapatla'
        )
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            return jsonify({"result": result})  # Return result from direct database connection
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # If there's an error, return it as JSON
    finally:
        connection.close()  # I will Close the connection once done

if __name__ == "__main__":
    # This will Create tables if they don't exist before starting the Flask app
    with app.app_context():
        db.create_all()
        print("✅ MySQL Database Connected & Tables Created!")

    app.run(debug=True)
