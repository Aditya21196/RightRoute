from flask import jsonify
from google.cloud import firestore

db = firestore.Client.from_service_account_json('firestore-access-key.json')
# db = firestore.Client()

def access_firestore(request):
    doc_ref = db.collection('skunkworks_22').document('bus_tracking')
    headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
    doc = doc_ref.get()
    if doc.exists:
        return (jsonify(doc.get('current')),200,headers)
    else:
        return None
