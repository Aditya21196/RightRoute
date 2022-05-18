import os
import requests
import json
import urllib
from collections import defaultdict
from operator import itemgetter
from haversine import Unit
import haversine as hs
from google.cloud import firestore
import time
import random

THRESH = 0.3
with open('apikey.txt','r') as f:
    api_key = f.read().strip()
db = firestore.Client.from_service_account_json('firestore-access-key.json')
doc_ref = db.collection(u'skunkworks_22').document(u'bus_tracking')

def get_vehicle_data(api_key):
    r = requests.get('http://bustime.mta.info/api/siri/vehicle-monitoring.json',params=[('key',api_key),('version',2)])
    if r.ok:
        return json.loads(r.content)['Siri']['ServiceDelivery']['VehicleMonitoringDelivery'][0]['VehicleActivity']
    print('Vehicle GET call failed')
    return None

def calculate_distance(loc1,loc2,unit = Unit.MILES):
    return hs.haversine((loc1['Latitude'],loc1['Longitude']),(loc2['Latitude'],loc2['Longitude']),unit=unit)

def extract_groups(vehicle_activities):
    groups = defaultdict(lambda : defaultdict(list))
    for vehicle_activity in vehicle_activities:
        vehicle_activity = vehicle_activity['MonitoredVehicleJourney']
        line_ref,direction_ref, location,v_id = itemgetter('LineRef', 'DirectionRef','VehicleLocation','VehicleRef')(vehicle_activity)
        groups[line_ref][direction_ref].append({
            'vehicle_id':v_id,
            'location':location
        })
    return groups

def extract_latest_mta_update(groups):
    latest_update = []
    for route,route_vehicles in groups.items():
        for route_dir,dir_vehicles in route_vehicles.items():
            l = len(dir_vehicles)
            for i in range(l):
                for j in range(i+1,l):
                    distance = calculate_distance(dir_vehicles[i]['location'],dir_vehicles[j]['location'])
                    if distance<THRESH:
                        latest_update.append({
                            'bus1':dir_vehicles[i]['vehicle_id'],
                            'bus2':dir_vehicles[j]['vehicle_id'],
                            'distance': round(distance,3),
                            'route':route,
                            'route_dir':int(route_dir),
                            'highlight': random.randint(0,1)
                        })
    return latest_update

def run_update_task():
    vehicle_activities = get_vehicle_data(api_key)
    groups = extract_groups(vehicle_activities)
    latest_update = extract_latest_mta_update(groups)
    doc_ref.update({
        'current':latest_update
    })

def run_mta_job(event, context):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    for _ in range(3):
        try:
            print('update started')
            run_update_task()
            print('update done')
        except:
            print('update failed')
    
    
    print('DONE') 
    