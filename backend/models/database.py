from flask_sqlalchemy import SQLAlchemy
from flask import Flask
#setting up the flask 
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default="To Do")

# Create the database
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Database Created Successfully!")

