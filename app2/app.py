from flask import Flask, render_template
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

def get_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route("/")
def index():

    try:

        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM employees")
            employees = cursor.fetchall()

        conn.close()

        return render_template(
            "index.html",
            status="Connected",
            employees=employees
        )

    except Exception as e:

        return render_template(
            "index.html",
            status="Disconnected",
            employees=[],
            error=str(e)
        )

@app.route("/health")
def health():
    return {
        "status":"OK"
    }

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT"))
    )
