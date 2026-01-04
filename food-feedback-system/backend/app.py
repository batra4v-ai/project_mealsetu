from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('mealsetu.db')
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS feedbacks
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  type TEXT NOT NULL,
                  overall_rating INTEGER,
                  overall_emoji TEXT,
                  quality_rating INTEGER,
                  quality_emoji TEXT,
                  hygiene_rating INTEGER,
                  hygiene_emoji TEXT,
                  quantity_rating INTEGER,
                  quantity_emoji TEXT,
                  temperature_rating INTEGER,
                  temperature_emoji TEXT,
                  average_rating REAL,
                  message TEXT,
                  timestamp TEXT NOT NULL)''')
    
    conn.commit()
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect('mealsetu.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        conn = get_db()
        c = conn.cursor()
        
        c.execute('''INSERT INTO feedbacks 
                     (type, overall_rating, overall_emoji, quality_rating, quality_emoji,
                      hygiene_rating, hygiene_emoji, quantity_rating, quantity_emoji,
                      temperature_rating, temperature_emoji, average_rating, message, timestamp)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (data.get('type'), 
                   data.get('overall_rating'), data.get('overall_emoji'),
                   data.get('quality_rating'), data.get('quality_emoji'),
                   data.get('hygiene_rating'), data.get('hygiene_emoji'),
                   data.get('quantity_rating'), data.get('quantity_emoji'),
                   data.get('temperature_rating'), data.get('temperature_emoji'),
                   data.get('average_rating'), data.get('message'),
                   datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Feedback submitted'}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/feedbacks', methods=['GET'])
def get_feedbacks():
    try:
        limit = request.args.get('limit', 50, type=int)
        conn = get_db()
        c = conn.cursor()
        
        c.execute('SELECT * FROM feedbacks ORDER BY timestamp DESC LIMIT ?', (limit,))
        feedbacks = [dict(row) for row in c.fetchall()]
        
        conn.close()
        return jsonify(feedbacks), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/stats/impact', methods=['GET'])
def get_impact_stats():
    return jsonify({
        'foodSaved': '2,450 kg',
        'servingsDonated': '1,234',
        'qualityScore': '4.5/5',
        'wastageReduced': '30%'
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)